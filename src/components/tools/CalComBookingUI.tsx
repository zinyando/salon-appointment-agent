import { makeAssistantToolUI } from "@assistant-ui/react";
import { useState } from "react";

type BookingArgs = {
  username: string;
  eventTypeSlug: string;
  start: string;
  name: string;
  email: string;
  phoneNumber: string;
  notes?: string;
  metadata: {
    service: string;
    price: string;
    duration: string;
  };
};

type BookingResponse = {
  label: string;
  value: string;
};

type BookingResult = {
  uid: string;
  responses: Record<string, BookingResponse>;
  smsReminderNumber: string | null;
  status: "completed" | "rejected";
  message?: string;
};

type BookingComponentProps = {
  args: BookingArgs;
  status: { type: string };
  result?: BookingResult;
  addResult: (result: BookingResult) => void;
};

const BookingComponent = ({
  args,
  status,
  result,
  addResult,
}: BookingComponentProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReject = () => {
    const finalResult: BookingResult = {
      uid: `rejected-${Date.now()}`,
      responses: {},
      smsReminderNumber: null,
      status: "rejected",
      message: `Booking for ${args.metadata.service} on ${new Date(args.start).toLocaleString()} was cancelled.`,
    };
    addResult(finalResult);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const bookingResponse = await fetch("/api/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "cal-api-version": "2024-09-04",
        },
        body: JSON.stringify({
          start: args.start,
          email: args.email,
          name: args.name,
          phoneNumber: args.phoneNumber,
          metadata: args.metadata,
        }),
      });

      if (!bookingResponse.ok) {
        const errorData = await bookingResponse.json().catch(() => ({}));
        throw new Error(
          `Booking failed: ${errorData?.error || bookingResponse.statusText}`
        );
      }

      const bookingData = await bookingResponse.json();
      const finalResult: BookingResult = {
        uid: bookingData.uid,
        responses: bookingData.responses || {},
        smsReminderNumber: bookingData.smsReminderNumber,
        status: "completed",
        message: `Successfully booked ${args.metadata.service} for ${new Date(
          args.start
        ).toLocaleString()}. Total: ${args.metadata.price}`,
      };
      addResult(finalResult);
    } catch (err) {
      console.error("Booking error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during booking."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (status.type === "running" || isLoading) {
    return (
      <div className="p-4 mb-6 mt-6 bg-white rounded-lg shadow">
        <p className="text-sm text-gray-500">Processing booking...</p>
      </div>
    );
  }

  if (result) {
    if (result.status === "rejected") {
      return (
        <div className="p-4 mb-6 mt-6 mx-4 bg-white rounded-lg shadow border border-red-200">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900">
              Booking Cancelled
            </h3>
          </div>
          <p className="mt-2 text-sm text-gray-500">{result.message}</p>
        </div>
      );
    }

    return (
      <div className="p-4 mb-6 mt-6 bg-white rounded-lg shadow border border-green-200">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-green-500"
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
            Booking Complete
          </h3>
        </div>
        <p className="mt-2 text-sm text-gray-500">{result.message}</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Booking Details</h3>
          <dl className="mt-2 text-sm text-gray-500">
            <div className="flex justify-between py-1">
              <dt>Service:</dt>
              <dd className="font-medium text-gray-900">
                {args.metadata.service}
              </dd>
            </div>
            <div className="flex justify-between py-1">
              <dt>Price:</dt>
              <dd className="font-medium text-gray-900">
                {args.metadata.price}
              </dd>
            </div>
            <div className="flex justify-between py-1">
              <dt>Duration:</dt>
              <dd className="font-medium text-gray-900">
                {args.metadata.duration}
              </dd>
            </div>
            <div className="flex justify-between py-1">
              <dt>Date & Time:</dt>
              <dd className="font-medium text-gray-900">
                {new Date(args.start).toLocaleString()}
              </dd>
            </div>
            <div className="flex justify-between py-1">
              <dt>Name:</dt>
              <dd className="font-medium text-gray-900">{args.name}</dd>
            </div>
            <div className="flex justify-between py-1">
              <dt>Email:</dt>
              <dd className="font-medium text-gray-900">{args.email}</dd>
            </div>
            <div className="flex justify-between py-1">
              <dt>Phone:</dt>
              <dd className="font-medium text-gray-900">{args.phoneNumber}</dd>
            </div>
            {args.notes && (
              <div className="flex justify-between py-1">
                <dt>Notes:</dt>
                <dd className="font-medium text-gray-900">{args.notes}</dd>
              </div>
            )}
          </dl>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <div className="flex gap-4">
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium text-sm shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
          >
            Confirm Booking
          </button>
          <button
            onClick={handleReject}
            disabled={isLoading}
            className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-md font-medium text-sm shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export const CalComBookingUI = makeAssistantToolUI<BookingArgs, BookingResult>({
  toolName: "bookCalComAppointment",
  render: (props) => <BookingComponent {...props} />,
});
