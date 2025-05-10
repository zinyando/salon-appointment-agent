import { makeAssistantToolUI } from "@assistant-ui/react";
import { useState } from "react";
import { useEffect } from "react";

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
  args,
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

  useEffect(() => {
    const fetchAvailability = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (!args.start || !args.end) {
          return;
        }

        const searchParams = new URLSearchParams();
        searchParams.append("start", args.start);
        searchParams.append("end", args.end);

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
      }
    };

    if (status.type === "running" && !isLoading && !result) {
      fetchAvailability();
    }
  }, [status.type, isLoading, result, args, addResult]);

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

  if (availableSlots.length > 0) {
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

    // Group slots by date
    const slotsByDate: Record<string, Slot[]> = {};
    availableSlots.forEach((slot) => {
      const date = new Date(slot.time).toLocaleDateString();
      if (!slotsByDate[date]) {
        slotsByDate[date] = [];
      }
      slotsByDate[date].push(slot);
    });

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Available Time Slots</h3>
        <p className="text-sm text-muted-foreground">
          Select a time slot to book your appointment.
        </p>

        {Object.entries(slotsByDate).map(([date, slots]) => (
          <div key={date} className="space-y-2">
            <h4 className="font-medium text-gray-900">{date}</h4>
            <div className="grid grid-cols-3 gap-2">
              {slots.map((slot) => {
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
          </div>
        ))}

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
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <p className="text-sm text-gray-500">
        Preparing to fetch availability for{" "}
        {new Date(args.start).toLocaleDateString()} to{" "}
        {new Date(args.end).toLocaleDateString()}
      </p>
    </div>
  );
};

export const CalComGetAvailabilityUI = makeAssistantToolUI<
  AvailabilityArgs,
  AvailabilityResult
>({
  toolName: "getCalComAvailability",
  render: (props) => <AvailabilityComponent {...props} />,
});
