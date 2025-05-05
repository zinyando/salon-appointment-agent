import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const bookCalComAppointment = createTool({
  id: "bookCalComAppointment",
  description: "Book an appointment using the Cal.com API",
  inputSchema: z.object({
    start: z
      .string()
      .datetime()
      .describe("Start time of the booking in ISO 8601 format"),
    name: z.string().describe("Name of the person making the booking"),
    email: z
      .string()
      .email()
      .describe("Email of the person making the booking"),
    phoneNumber: z
      .string()
      .describe("Phone number of the person making the booking"),
    metadata: z
      .object({
        service: z.string().describe("The salon service being booked"),
        price: z.string().describe("Price of the service"),
        duration: z.string().describe("Duration of the service"),
      })
      .describe("Additional metadata about the salon appointment"),
  }),
  outputSchema: z.object({
    uid: z.string().describe("Unique identifier for the booking"),
    responses: z.record(z.any()).describe("Responses provided during booking"),
    smsReminderNumber: z
      .string()
      .nullable()
      .describe("Phone number for SMS reminders"),
  }),
});
