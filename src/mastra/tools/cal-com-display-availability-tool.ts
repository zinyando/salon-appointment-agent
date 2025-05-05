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

export const displayCalComAvailability = createTool({
  id: "displayCalComAvailability",
  description:
    "Displays available booking slots from Cal.com for a specific event type within a given time range.",
  inputSchema: z.object({
    availableSlots: z
      .array(
        z.object({
          time: z.string().datetime(),
          bookingUid: z.string().nullable().optional(),
        })
      )
      .describe("List of available time slots."),
    busySlots: z
      .array(
        z.object({
          start: z.string().datetime(),
          end: z.string().datetime(),
        })
      )
      .optional()
      .describe("List of busy time slots (optional, depends on API response)."),
    timeZone: z.string().describe("The time zone used for the slots."),
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
