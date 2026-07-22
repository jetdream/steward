/**
 * OpenTelemetry bootstrap (constitution: "OpenTelemetry for dev — LGTM"). Imported
 * for its side effect at the very top of server.ts, before any instrumented module,
 * so auto-instrumentation can patch http/pg/etc. Exports traces via OTLP to the
 * Grafana LGTM stack (.coder/grafana, OTLP :4318); set OTEL_DEBUG=1 to also print
 * spans to the console, and OTEL_ENABLED=false to disable. Service name comes from
 * the OTEL_SERVICE_NAME env var.
 */
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { NodeSDK } from "@opentelemetry/sdk-node";
import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
  SimpleSpanProcessor,
  type SpanProcessor,
} from "@opentelemetry/sdk-trace-base";

if (process.env.OTEL_ENABLED !== "false") {
  const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? "http://localhost:4318";
  const spanProcessors: SpanProcessor[] = [
    new BatchSpanProcessor(new OTLPTraceExporter({ url: `${endpoint}/v1/traces` })),
  ];
  if (process.env.OTEL_DEBUG === "1") {
    spanProcessors.push(new SimpleSpanProcessor(new ConsoleSpanExporter()));
  }
  const sdk = new NodeSDK({ spanProcessors, instrumentations: [getNodeAutoInstrumentations()] });
  sdk.start();
  process.on("SIGTERM", () => {
    void sdk.shutdown();
  });
}
