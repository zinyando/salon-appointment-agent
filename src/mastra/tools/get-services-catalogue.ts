import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const ServiceSchema = z.object({
  service: z.string(),
  price: z.string(),
  duration: z.string(),
  description: z.string(),
});

const ServiceCategorySchema = z.object({
  category: z.string(),
  services: z.array(ServiceSchema),
});

export const getServicesCatalogue = createTool({
  id: "getServicesCatalogue",
  description:
    "Displays a UI component showing all available salon services grouped by category, allowing users to view details and select a service. Returns the selected service with its category, price, duration, and description for booking.",
  inputSchema: z.object({}),
  outputSchema: z.object({
    catalogue: z.array(ServiceCategorySchema),
    message: z
      .string()
      .optional()
      .describe("Additional message, especially for errors"),
    status: z
      .enum(["completed", "error"])
      .describe("Status of the availability request"),
  }),
});
