import { z } from "zod";
import { createTool } from "@mastra/core/tools";

export const getCalComAvailability = createTool({
  id: "getCalComAvailability",
  description:
    "Fetches available booking slots from Cal.com for a specific event type within a given time range.",
  inputSchema: z.object({
    start: z
      .string()
      .datetime()
      .describe(
        "The start date and time for the availability search range (ISO 8601 format)."
      ),
    end: z
      .string()
      .datetime()
      .describe(
        "The end date and time for the availability search range (ISO 8601 format)."
      ),
  }),
  outputSchema: z.object({
    availableSlots: z
      .array(
        z.object({
          time: z.string().datetime(),
          bookingUid: z.string().nullable().optional(),
        })
      )
      .describe("List of available time slots."),
    timeZone: z.string().describe("The time zone used for the slots."),
    status: z
      .enum(["completed", "error"])
      .describe("Status of the availability request"),
    message: z
      .string()
      .optional()
      .describe("Additional message, especially for errors"),
  }),
});
