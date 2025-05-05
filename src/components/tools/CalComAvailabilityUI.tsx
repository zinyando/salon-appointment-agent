import { makeAssistantToolUI } from "@assistant-ui/react";
import { useState, useEffect } from "react";
import type {
  AvailabilityArgs,
  AvailabilityResult,
} from "@/mastra/tools/cal-com-availability-tool";

type AvailabilityComponentProps = {
  args: AvailabilityArgs;
  status: { type: string };
  result?: AvailabilityResult;
  addResult: (result: AvailabilityResult) => void;
};

const AvailabilityComponent = ({
  args,
  result,
  addResult,
}: AvailabilityComponentProps) => {
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  console.log("AvailabilityComponent", args);

  useEffect(() => {
    if (!args.start || !args.end) {
      return;
    }

    const fetchAvailability = async () => {
      const {
        start,
        end,
        username = "zinyando",
        eventTypeSlug = "salon-appointment",
      } = args;
      setIsLoading(true);

      try {
        const query: Record<string, string> = {
          start,
          end,
          username,
          eventTypeSlug,
        };

        const searchParams = new URLSearchParams(query);

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

        const availableSlots = Object.values(typedData.data).flatMap(
          (slots) => {
            return slots.map((slot) => ({
              time: slot.time || slot.start || "",
              bookingUid: null,
            }));
          }
        );

        if (!Array.isArray(availableSlots)) {
          throw new Error(
            "Failed to process available slots from Cal.com API response."
          );
        }

        addResult({
          status: "completed",
          availableSlots,
          timeZone: "UTC",
        });
      } catch (error) {
        console.error("Error fetching Cal.com availability:", error);
        addResult({
          status: "error",
          availableSlots: [],
          timeZone: "UTC",
          message:
            error instanceof Error
              ? error.message
              : "Failed to fetch availability from Cal.com",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailability();
  }, [args, addResult]);

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Loading available slots...</p>
      </div>
    );
  }

  if (!result || result.status === "error") {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <p className="text-red-600">
          {result?.message || "Failed to load available slots"}
        </p>
      </div>
    );
  }

  if (result.availableSlots.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 rounded-lg">
        <p className="text-yellow-600">
          No available slots found for the selected time range.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Available Time Slots</h3>
      <div className="grid grid-cols-3 gap-2">
        {result.availableSlots.map((slot) => {
          const date = new Date(slot.time);
          const isSelected = selectedTime === slot.time;

          return (
            <button
              key={slot.time}
              onClick={() => setSelectedTime(slot.time)}
              className={`p-2 rounded-lg text-sm ${
                isSelected
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {date.toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })}
            </button>
          );
        })}
      </div>

      {selectedTime && (
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            Selected time: {new Date(selectedTime).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};

export const CalComAvailabilityUI = makeAssistantToolUI<
  AvailabilityArgs,
  AvailabilityResult
>({
  toolName: "getCalComAvailability",
  render: (props) => <AvailabilityComponent {...props} />,
});
