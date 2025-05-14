import { makeAssistantToolUI } from "@assistant-ui/react";
import { useState, useEffect, useCallback } from "react";
import { DayPicker } from "react-day-picker";
import { format, startOfDay, endOfDay } from "date-fns";
import "react-day-picker/dist/style.css";

type AvailabilityArgs = {
  start: string;
  end: string;
  username?: string;
  eventTypeSlug?: string;
  eventTypeId?: string;
};

type Slot = {
  time: string;
  bookingUid: string | null;
};

type AvailabilityResult = {
  availableSlots: Slot[];
  selectedSlot?: Slot;
  timeZone: string;
  status: "completed" | "error";
  message?: string;
};

type AvailabilityComponentProps = {
  args: AvailabilityArgs;
  status: { type: string };
  result?: AvailabilityResult;
  addResult: (result: AvailabilityResult) => void;
};

const AvailabilityComponent = ({
  status,
  result,
  addResult,
}: AvailabilityComponentProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [timeZone, setTimeZone] = useState<string>("UTC");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const fetchAvailability = useCallback(async (date: Date) => {
      setIsLoading(true);
      setError(null);
      try {
        const start = startOfDay(date).toISOString();
        const end = endOfDay(date).toISOString();

        const searchParams = new URLSearchParams();
        searchParams.append("start", start);
        searchParams.append("end", end);

        const response = await fetch(`/api/cal-availability?${searchParams}`, {
          headers: {
            "Content-Type": "application/json",
            "cal-api-version": "2024-09-04",
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `Failed to fetch availability: ${errorData?.error || response.statusText}`
          );
        }

        const data = await response.json();

        if (!data.availableSlots || !Array.isArray(data.availableSlots)) {
          throw new Error("Invalid response format from availability API");
        }

        // Store the fetched slots in local state
        setAvailableSlots(data.availableSlots);
        setTimeZone(data.timeZone || "UTC");
      } catch (err) {
        console.error("Availability fetch error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while fetching availability."
        );

        addResult({
          availableSlots: [],
          timeZone: "UTC",
          status: "error",
          message:
            err instanceof Error ? err.message : "Failed to fetch availability",
        });
      } finally {
        setIsLoading(false);
      };
    }, [addResult]);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailability(selectedDate);
    }
  }, [selectedDate, fetchAvailability]);

  useEffect(() => {
    if (status.type === "running" && !isLoading && !result && !selectedDate) {
      // Set initial date to today when the tool starts
      setSelectedDate(new Date());
    }
  }, [status.type, isLoading, result, selectedDate]);

  if (status.type === "running" || isLoading) {
    return (
      <div className="p-6 my-8 bg-white rounded-lg shadow-md border border-gray-100">
        <p className="text-sm text-gray-500">
          Fetching available time slots...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 my-8 bg-red-50 rounded-lg border border-red-100">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (result?.status === "error") {
    return (
      <div className="p-6 my-8 bg-red-50 rounded-lg border border-red-100">
        <p className="text-red-600">
          {result?.message || "An error occurred while fetching availability."}
        </p>
      </div>
    );
  }

  // If we've already selected a slot and returned it to the agent, show confirmation
  if (result?.status === "completed" && result.selectedSlot) {
    return (
      <div className="p-6 my-8 bg-white rounded-lg shadow-md border border-teal-200">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-teal-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900">
            Time Slot Selected
          </h3>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          {new Date(result.selectedSlot.time).toLocaleString([], {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
      </div>
    );
  }

  // Show any errors from the API call
  if (error) {
    return (
      <div className="p-6 my-8 bg-red-50 rounded-lg border border-red-100">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (availableSlots.length === 0 && !isLoading) {
    return (
      <div className="p-6 my-8 bg-yellow-50 rounded-lg border border-yellow-100">
        <p className="text-yellow-600">
          No available slots found for the selected time range.
        </p>
      </div>
    );
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setSelectedTime(null); // Reset selected time when date changes
      setAvailableSlots([]); // Reset available slots
      setError(null); // Reset any errors
    }
  };

  // Calendar and time slots view
  if (status.type === "running" || !result?.status) {
    return (
      <div className="space-y-6 p-4 bg-white rounded-lg shadow-md border border-gray-100">
        <div className="flex flex-col items-center space-y-4">
          <h3 className="text-lg font-semibold">Select a Date</h3>
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={[{ before: new Date() }]}
            className="border rounded-lg p-3"
          />
        </div>

        {selectedDate && (
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-4">
              Available times for {format(selectedDate, "EEEE, MMMM d")}
            </h4>
            {isLoading ? (
              <p className="text-sm text-gray-500">Loading available times...</p>
            ) : availableSlots.length > 0 ? (
              <div>
                {(() => {
                  const handleConfirmSelection = async () => {
      if (!selectedTime) return;

      setIsConfirming(true);

      const selectedSlot = availableSlots.find(
        (slot) => slot.time === selectedTime
      );

      if (!selectedSlot) {
        setIsConfirming(false);
        return;
      }

      // Brief delay to show confirming state
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Return the selected slot to the agent for booking
      const newResult: AvailabilityResult = {
        availableSlots: [], // Clear the slots since we've made a selection
        selectedSlot,
        timeZone,
        status: "completed",
        message: `Selected appointment time: ${new Date(
          selectedSlot.time
        ).toLocaleString([], {
          weekday: "long",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })}`,
      };

      addResult(newResult);
                    setIsConfirming(false);
                  };

                  return (
                    <div>
                      <div className="grid grid-cols-3 gap-2">
                        {availableSlots.map((slot) => {
                          const slotTime = new Date(slot.time);
                          const isSelected = selectedTime === slot.time;

                          return (
                            <button
                              key={slot.time}
                              onClick={() => setSelectedTime(slot.time)}
                              className={`cursor-pointer p-2 rounded-lg text-sm ${
                                isSelected
                                  ? "bg-teal-600 text-white"
                                  : "bg-gray-100 hover:bg-gray-200"
                              }`}
                            >
                              {slotTime.toLocaleTimeString([], {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </button>
                          );
                        })}
                      </div>

                      {selectedTime && (
                        <div className="mt-4 space-y-3">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleConfirmSelection();
                            }}
                            className={`cursor-pointer px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors w-full ${
                              isConfirming ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            type="button"
                            disabled={isConfirming}
                          >
                            {isConfirming ? "Confirming..." : "Confirm Selection"}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No available times for this date. Please select another date.
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
};

export const CalComGetAvailabilityUI = makeAssistantToolUI<
  AvailabilityArgs,
  AvailabilityResult
>({
  toolName: "getCalComAvailability",
  render: (props) => <AvailabilityComponent {...props} />,
});
