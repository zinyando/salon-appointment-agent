import { makeAssistantToolUI } from "@assistant-ui/react";
import { useState } from "react";

type Slot = {
  time: string;
  bookingUid?: string | null;
};

type DisplayArgs = {
  availableSlots: Slot[];
  timeZone: string;
};

type DisplayResult = {
  selectedSlot: Slot;
  timeZone: string;
  status: "completed" | "error";
  message: string;
};

type AvailabilityComponentProps = {
  args: DisplayArgs;
  status: { type: string };
  result?: DisplayResult;
  addResult: (result: DisplayResult) => void;
};

const AvailabilityComponent = ({
  args,
  status,
  result,
  addResult,
}: AvailabilityComponentProps) => {
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  if (status.type === "running") {
    return (
      <div className="p-4 mb-6 mt-6 bg-white rounded-lg shadow">
        <p className="text-sm text-gray-500">Processing availability...</p>
      </div>
    );
  }

  if (result?.status === "completed") {
    return (
      <div className="p-4 bg-white rounded-lg shadow border border-teal-200">
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

  if (result?.status === "error") {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <p className="text-red-600">
          {result?.message ||
            "An error occurred while processing the selection."}
        </p>
      </div>
    );
  }

  if (!args.availableSlots || args.availableSlots.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 rounded-lg">
        <p className="text-yellow-600">
          No available slots found for the selected time range.
        </p>
      </div>
    );
  }

  const handleConfirmSelection = async () => {
    if (!selectedTime) return;

    setIsConfirming(true);

    const selectedSlot = args.availableSlots.find(
      (slot) => slot.time === selectedTime
    );

    if (!selectedSlot) {
      setIsConfirming(false);
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const resultSlot: Slot = {
      time: selectedSlot.time,
      bookingUid: selectedSlot.bookingUid ?? null,
    };

    const newResult: DisplayResult = {
      status: "completed",
      selectedSlot: resultSlot,
      timeZone: args.timeZone,
      message: `Slot for ${selectedSlot.time} selected and confirmed.`,
    };

    addResult(newResult);
    setIsConfirming(false);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Available Time Slots</h3>
      <p className="text-sm text-muted-foreground">
        Select a time slot to book your appointment.
      </p>
      <div className="grid grid-cols-3 gap-2">
        {args.availableSlots.map((slot: Slot) => {
          const date = new Date(slot.time);
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
              {date.toLocaleTimeString([], {
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
};

export const CalComDisplayAvailabilityUI = makeAssistantToolUI<
  DisplayArgs,
  DisplayResult
>({
  toolName: "displayCalComAvailability",
  render: (props) => <AvailabilityComponent {...props} />,
});
