import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { b as storeMonitoringPulse } from '../analyticsDb.mjs';
import 'pg';

const metricsSchema = z.object({}).catchall(z.union([z.string(), z.number(), z.boolean()])).describe("Key-value telemetry metrics (string|number|boolean) object");
const monitoringPulseTool = createTool({
  id: "monitoring-pulse",
  description: "Captures telemetry signals (traffic shifts, schema errors, UX anomalies) and stores them for monitoring workflows.",
  inputSchema: z.object({
    websiteUrl: z.string().url(),
    signal: z.string().describe("Name of the signal, e.g., traffic_drop, schema_error"),
    severity: z.enum(["info", "warning", "critical"]),
    metrics: metricsSchema.optional()
  }),
  outputSchema: z.object({
    websiteUrl: z.string(),
    signal: z.string(),
    severity: z.enum(["info", "warning", "critical"]),
    metrics: metricsSchema.optional(),
    observedAt: z.string()
  }),
  execute: async ({ context, mastra }) => {
    const logger = mastra?.getLogger();
    const metrics = context.metrics ?? {};
    const pulse = {
      websiteUrl: context.websiteUrl,
      signal: context.signal,
      severity: context.severity,
      metrics,
      observedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await storeMonitoringPulse(pulse);
    logger?.info("\u{1F4E1} [Monitoring Pulse] Signal recorded", {
      signal: context.signal,
      severity: context.severity
    });
    return pulse;
  }
});

export { monitoringPulseTool };
//# sourceMappingURL=67363779-7879-40e5-ba43-b78edee8ac00.mjs.map
