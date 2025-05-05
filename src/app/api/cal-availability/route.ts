import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Get query parameters
  const searchParams = request.nextUrl.searchParams;
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  // Validate required parameters
  if (!start || !end) {
    return NextResponse.json(
      { error: "Missing required parameters: start and end" },
      { status: 400 }
    );
  }

  try {
    // Build query with environment variables from server
    const query = new URLSearchParams({
      start,
      end,
      username: process.env.CAL_USERNAME || "",
      eventTypeSlug: process.env.CAL_EVENT_TYPE_SLUG || "",
    });

    // Make request to Cal.com API
    const response = await fetch(`https://api.cal.com/v2/slots?${query}`, {
      headers: {
        "cal-api-version": "2024-09-04",
        "content-type": "application/json",
      },
    });

    // Get response data
    const data = await response.json();

    // Return response
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching Cal.com availability:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability from Cal.com" },
      { status: 500 }
    );
  }
}
