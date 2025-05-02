import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { start, email, name, phoneNumber, metadata } = body;

    const username = "zinyando";
    const eventTypeSlug = "salon-appointment";

    const response = await fetch(`https://api.cal.com/v2/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "cal-api-version": "2024-08-13",
        Authorization: `Bearer ${process.env.CAL_API_KEY}`,
      },
      body: JSON.stringify({
        attendee: {
          name,
          email,
          phoneNumber,
          language: "en",
          timeZone: "UTC",
        },
        start,
        eventTypeSlug,
        username,
        metadata,
        location: {
          type: "attendeeAddress",
          address: "Salon Location",
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const booking = await response.json();
    return NextResponse.json(booking);
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
