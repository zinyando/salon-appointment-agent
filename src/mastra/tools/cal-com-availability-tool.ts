import { z } from "zod";
import { createTool } from "@mastra/core/tools";

export type AvailabilityArgs = {
  start: string;
  end: string;
  username?: string;
  eventTypeSlug?: string;
};

export type AvailabilitySlot = {
  time: string;
  bookingUid: string | null;
};

export type AvailabilityResult = {
  availableSlots: AvailabilitySlot[];
  timeZone: string;
  status: "completed" | "error";
  message?: string;
};

export const getCalComAvailability = createTool({
  id: "getCalComAvailability",
  description:
    "Fetches available booking slots from Cal.com for a specific event type within a given time range.",
  inputSchema: z.object({
    start: z
      .string()
      .datetime()
      .describe("Start time of the availability search range (ISO 8601)"),
    end: z
      .string()
      .datetime()
      .describe("End time of the availability search range (ISO 8601)"),
  }),
  outputSchema: z.object({
    availableSlots: z.array(
      z.object({
        time: z.string().datetime(),
        bookingUid: z.string().nullable(),
      })
    ),
    timeZone: z.string(),
    status: z.enum(["completed", "error"]),
    message: z.string().optional(),
  }),
});
