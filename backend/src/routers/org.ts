/**
 * Org router — accounts/identity org surface (ACCS-1/2/3) over the BetterAuth
 * organization plugin. Scope is the SESSION's active org (ACC-3, via orgProcedure),
 * never a client-supplied id. Membership lifecycle (ACCS-3) enforces the
 * Steward-only single-owner invariant that BetterAuth does not: an invite or
 * role-change can never mint a second owner, and ownership moves only via an
 * atomic transfer.
 */
import type { Org } from "@shared";
import { member } from "@shared/db/schema.js";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import type { Database } from "../db/client.js";
import { orgProcedure, protectedProcedure, router } from "../trpc.js";

const slugify = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "org";

/** A unique-enough dev slug (BetterAuth requires org slugs to be unique). */
export const orgSlug = (name: string): string => `${slugify(name)}-${Date.now().toString(36)}`;

/**
 * Roles that can be ASSIGNED to a member (ACCS-3): never `owner` — ownership moves
 * only via the atomic transfer below, so an invite or role-change can never mint a
 * second owner.
 */
const AssignableRole = z.enum(["admin", "member"]);

/** Compose the cross-boundary Org from a BetterAuth organization record. */
function toOrg(o: {
  id: string;
  name: string;
  slug: string;
  logo?: string | null | undefined;
  createdAt: Date;
}): Org {
  return { id: o.id, name: o.name, slug: o.slug, logo: o.logo ?? null, createdAt: o.createdAt };
}

/** Fetch a member by id CONFINED to an org (ACC-3), or throw NOT_FOUND. */
async function memberInOrg(db: Database, memberId: string, orgId: string) {
  const [row] = await db
    .select()
    .from(member)
    .where(and(eq(member.id, memberId), eq(member.organizationId, orgId)));
  if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "member not in this org" });
  return row;
}

export const orgRouter = router({
  /** The orgs the signed-in user is a member of (BetterAuth confines this). */
  list: protectedProcedure.query(async ({ ctx }) => {
    const orgs = await ctx.auth.api.listOrganizations({ headers: ctx.headers });
    return orgs.map(toOrg);
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const created = await ctx.auth.api.createOrganization({
        body: { name: input.name, slug: orgSlug(input.name) },
        headers: ctx.headers,
      });
      if (!created)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "org creation failed" });
      return toOrg(created);
    }),

  /** The active org (ACC-3: id comes from the session via orgProcedure, never the client). */
  active: orgProcedure.query(async ({ ctx }) => {
    const orgs = await ctx.auth.api.listOrganizations({ headers: ctx.headers });
    const active = orgs.find((o) => o.id === ctx.orgId);
    if (!active) throw new TRPCError({ code: "NOT_FOUND", message: "active org not found" });
    return toOrg(active);
  }),

  /** Switch the active org — BetterAuth refuses an org the user is not a member of (ACCS-2). */
  setActive: protectedProcedure
    .input(z.object({ organizationId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.auth.api.setActiveOrganization({
        body: { organizationId: input.organizationId },
        headers: ctx.headers,
      });
      return { ok: true };
    }),

  // ── ACCS-3: member invitation & lifecycle (owner/admin; single-owner invariant) ──

  /** Invite a user by email at an admin|member role (never owner — ACCS-3). */
  invite: orgProcedure
    .input(z.object({ email: z.email(), role: AssignableRole }))
    .mutation(({ ctx, input }) =>
      ctx.auth.api.createInvitation({
        body: { email: input.email, role: input.role },
        headers: ctx.headers,
      }),
    ),

  /** Members of the active org. */
  members: orgProcedure.query(({ ctx }) => ctx.auth.api.listMembers({ headers: ctx.headers })),

  /** Pending invitations for the active org. */
  invitations: orgProcedure.query(({ ctx }) =>
    ctx.auth.api.listInvitations({ headers: ctx.headers }),
  ),

  /** Accept an invitation (the invited user — needs a session, not an active org). */
  acceptInvitation: protectedProcedure
    .input(z.object({ invitationId: z.string().min(1) }))
    .mutation(({ ctx, input }) =>
      ctx.auth.api.acceptInvitation({
        body: { invitationId: input.invitationId },
        headers: ctx.headers,
      }),
    ),

  /** Change a member's role — admin|member only; the owner is untouchable here. */
  updateMemberRole: orgProcedure
    .input(z.object({ memberId: z.string().min(1), role: AssignableRole }))
    .mutation(async ({ ctx, input }) => {
      const target = await memberInOrg(ctx.db, input.memberId, ctx.orgId);
      if (target.role === "owner") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "the owner's role changes only via ownership transfer",
        });
      }
      await ctx.auth.api.updateMemberRole({
        body: { memberId: input.memberId, role: input.role },
        headers: ctx.headers,
      });
      return { ok: true };
    }),

  /** Remove a member — never the owner (transfer first; last-owner protection). */
  removeMember: orgProcedure
    .input(z.object({ memberId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const target = await memberInOrg(ctx.db, input.memberId, ctx.orgId);
      if (target.role === "owner") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "the owner cannot be removed; transfer ownership first",
        });
      }
      await ctx.auth.api.removeMember({
        body: { memberIdOrEmail: input.memberId },
        headers: ctx.headers,
      });
      return { ok: true };
    }),

  /**
   * Atomic ownership transfer (ACCS-3): demote the current owner to admin and
   * promote the target to owner IN ONE TRANSACTION, so the org always has EXACTLY
   * one owner. Only the current owner may transfer.
   */
  transferOwnership: orgProcedure
    .input(z.object({ toMemberId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.transaction(async (tx) => {
        const members = await tx.select().from(member).where(eq(member.organizationId, ctx.orgId));
        const currentOwner = members.find((m) => m.role === "owner");
        const target = members.find((m) => m.id === input.toMemberId);
        if (!currentOwner || currentOwner.userId !== ctx.session.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "only the current owner can transfer ownership",
          });
        }
        if (!target)
          throw new TRPCError({ code: "NOT_FOUND", message: "target member not in this org" });
        if (target.id === currentOwner.id) return;
        await tx.update(member).set({ role: "admin" }).where(eq(member.id, currentOwner.id));
        await tx.update(member).set({ role: "owner" }).where(eq(member.id, target.id));
      });
      return { ok: true };
    }),
});
