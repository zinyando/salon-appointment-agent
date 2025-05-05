"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import { CalComBookingUI } from "@/components/tools/CalComBookingUI";
import { CalComDisplayAvailabilityUI } from "@/components/tools/CalComDisplayAvailabilityUI";

export const Assistant = () => {
  const runtime = useChatRuntime({
    api: "/api/chat",
  });

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-gray-100 p-4 border-b border-gray-300 flex justify-between items-center shrink-0">
        <h1 className="text-xl font-semibold">
          Jenny&apos;s Hair Salon Booking
        </h1>
        <div className="text-sm text-gray-500">
          Powered by{" "}
          <a
            href="https://mastra.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
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
        <CalComDisplayAvailabilityUI />
      </AssistantRuntimeProvider>
    </div>
  );
};
