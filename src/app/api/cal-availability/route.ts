import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Get query parameters
  const searchParams = request.nextUrl.searchParams;
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const username = process.env.CAL_USERNAME;
  const eventTypeSlug = process.env.CAL_EVENT_TYPE_SLUG;

  // Validate required parameters
  if (!start || !end) {
    return NextResponse.json(
      {
        availableSlots: [],
        timeZone: "UTC",
        status: "error",
        message: "Missing required parameters: start and end dates",
      },
      { status: 400 }
    );
  }

  try {
    // Build query with environment variables from server
    const query = new URLSearchParams();
    query.append("start", start);
    query.append("end", end);

    // Add optional parameters if they exist
    if (username) {
      query.append("username", username);
    } else {
      query.append("username", "zinyando");
    }

    if (eventTypeSlug) {
      query.append("eventTypeSlug", eventTypeSlug);
    } else {
      query.append("eventTypeSlug", "salon-appointment");
    }

    // Make request to Cal.com API
    const response = await fetch(`https://api.cal.com/v2/slots?${query}`, {
      headers: {
        "cal-api-version": "2024-09-04",
        "content-type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        `Cal.com API request failed with status ${response.status}: ${JSON.stringify(errorData)}`
      );
    }

    // Get response data
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

    const availableSlots = Object.values(typedData.data).flatMap((slots) => {
      return slots.map((slot) => ({
        time: slot.time || slot.start || "",
        bookingUid: null,
      }));
    });

    return NextResponse.json({
      availableSlots,
      timeZone: "UTC",
      status: "completed",
    });
  } catch (error) {
    console.error("Error fetching Cal.com availability:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to fetch availability from Cal.com";

    return NextResponse.json(
      {
        availableSlots: [],
        timeZone: "UTC",
        status: "error",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
