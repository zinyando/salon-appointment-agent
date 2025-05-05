import { makeAssistantToolUI } from "@assistant-ui/react";
import { useState } from "react";
import type {
  AvailabilityArgs,
  AvailabilityResult,
} from "@/mastra/tools/cal-com-get-availability-tool";

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

  const handleConfirmSelection = () => {
    if (!selectedTime) return;

    const selectedSlot = result.availableSlots.find(
      (slot) => slot.time === selectedTime
    );

    if (!selectedSlot) return;

    const newResult: AvailabilityResult = {
      status: "completed",
      availableSlots: [selectedSlot],
      timeZone: result.timeZone,
    };

    addResult(newResult);
  };

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
        <div className="mt-4 space-y-3">
          <button
            onClick={(e) => {
              e.preventDefault();
              handleConfirmSelection();
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-full"
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
  AvailabilityArgs,
  AvailabilityResult
>({
  toolName: "displayCalComAvailability",
  render: (props) => <AvailabilityComponent {...props} />,
});
