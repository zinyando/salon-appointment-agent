import { makeAssistantToolUI } from "@assistant-ui/react";
import { useState } from "react";

type Slot = {
  time: string;
  bookingUid?: string | null;
};

type BusySlot = {
  start: string;
  end: string;
};

type DisplayArgs = {
  availableSlots: Slot[];
  busySlots?: BusySlot[];
  timeZone: string;
};

type DisplayResult = {
  selectedSlot: Slot;
  timeZone: string;
  status: "completed" | "error";
  message?: string;
};

type AvailabilityComponentProps = {
  args: DisplayArgs;
  status: { type: string };
  result?: DisplayResult;
  addResult: (result: DisplayResult) => void;
};

const AvailabilityComponent = ({
  args,
  result,
  addResult,
}: AvailabilityComponentProps) => {
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

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

  const handleConfirmSelection = () => {
    if (!selectedTime) return;

    const selectedSlot = args.availableSlots.find(
      (slot) => slot.time === selectedTime
    );

    if (!selectedSlot) return;

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
            className="cursor-pointer px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors w-full"
            type="button"
          >
            Confirm Selection
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
