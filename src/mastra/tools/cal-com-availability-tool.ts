import { z } from "zod";
import { createTool } from "@mastra/core/tools";

const inputSchema = z.object({
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
  username: z
    .string()
    .default("zinyando")
    .describe("The username of the Cal.com account to check availability for."),
  eventTypeSlug: z
    .string()
    .default("salon-appointment")
    .describe("The slug of the event type to check availability for."),
});

const outputSchema = z.object({
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
});

export const getCalComAvailability = createTool({
  id: "get_cal_com_availability",
  description:
    "Fetches available booking slots from Cal.com for a specific event type within a given time range.",
  inputSchema,
  outputSchema,
  execute: async ({ context }) => {
    const { start, end, username, eventTypeSlug } = context;

    const query: Record<string, string> = {
      start,
      end,
      username,
      eventTypeSlug,
    };

    const searchParams = new URLSearchParams(query);

    try {
      const response = await fetch(
        `https://api.cal.com/v2/slots?${searchParams}`,
        {
          headers: {
            "cal-api-version": "2024-09-04",
            "content-type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          `Cal.com API request failed with status ${response.status}: ${JSON.stringify(errorData)}`
        );
      }

      const data = await response.json();

      if (data.status !== "success" || !data.data) {
        throw new Error(
          "Invalid response from Cal.com API: missing data or unsuccessful status"
        );
      }

      interface CalComSlot {
        time?: string;
        start?: string;
      }

      interface CalComResponse {
        status: string;
        data: {
          [date: string]: CalComSlot[];
        };
      }

      const typedData = data as CalComResponse;

      const availableSlots = Object.values(typedData.data).flatMap((slots) => {
        return slots.map((slot) => ({
          time: slot.time || slot.start || "",
          bookingUid: null,
        }));
      });

      const result = {
        availableSlots,
        timeZone: "UTC",
      };

      if (!Array.isArray(result.availableSlots)) {
        throw new Error(
          "Failed to process available slots from Cal.com API response."
        );
      }

      return result;
    } catch (error) {
      console.error("Error fetching Cal.com availability:", error);
      throw error instanceof Error
        ? error
        : new Error("Failed to fetch availability from Cal.com");
    }
  },
});
