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
    "Get the salon services catalogue with pricing and duration information",
  inputSchema: z.object({}),
  outputSchema: z.object({
    catalogue: z.array(ServiceCategorySchema),
  }),
});
