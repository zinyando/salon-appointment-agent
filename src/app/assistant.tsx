"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import { CalComBookingUI } from "@/components/tools/cal-com-booking-ui";
import { CalComGetAvailabilityUI } from "@/components/tools/cal-com-get-availability-ui";
import { GetServicesCatalogueUI } from "@/components/tools/get-services-catalogue-ui";

export const Assistant = () => {
  const runtime = useChatRuntime({
    api: "/api/chat",
  });

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white px-4 py-3 shadow-sm flex justify-between items-center shrink-0">
        <h1 className="text-xl font-semibold">
          Jenny&apos;s Hair Salon Booking
        </h1>
        <div className="text-sm text-gray-500">
          Powered by{" "}
          <a
            href="https://mastra.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-600 hover:text-teal-700"
          >
            mastra
          </a>
        </div>
      </header>
      <AssistantRuntimeProvider runtime={runtime}>
        <div className="grid flex-grow grid-cols-1 gap-x-2 px-4 py-4 overflow-hidden">
          <div className="overflow-auto">
            <Thread />
          </div>
        </div>
        <CalComBookingUI />
        <CalComGetAvailabilityUI />
        <GetServicesCatalogueUI />
      </AssistantRuntimeProvider>
    </div>
  );
};
