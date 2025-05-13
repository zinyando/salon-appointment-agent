import { NextResponse } from "next/server";

export type Service = {
  service: string;
  price: string;
  duration: string;
  description: string;
};

export type ServiceCategory = {
  category: string;
  services: Service[];
};

const servicesCatalogue: ServiceCategory[] = [
  {
    category: "Haircuts",
    services: [
      { service: "Men's Haircut", price: "$30", duration: "30 min", description: "Consultation, wash, cut, and style" },
      { service: "Women's Haircut", price: "$50-$70", duration: "60 min", description: "Consultation, wash, cut, and style" },
      { service: "Children's Haircut", price: "$25", duration: "30 min", description: "Ages 12 and under" },
    ],
  },
  {
    category: "Color Services",
    services: [
      { service: "Root Touch-up", price: "$75", duration: "90 min", description: "Single color application at the roots" },
      { service: "Full Color", price: "$100+", duration: "2-3 hrs", description: "All-over color application" },
      { service: "Highlights/Lowlights", price: "$120+", duration: "2-3 hrs", description: "Partial or full foil options" },
      { service: "Balayage", price: "$150+", duration: "3+ hrs", description: "Hand-painted highlights for natural look" },
    ],
  },
  {
    category: "Treatments",
    services: [
      { service: "Deep Conditioning", price: "$25", duration: "30 min", description: "Intensive treatment for damaged hair" },
      { service: "Keratin Treatment", price: "$200+", duration: "2-3 hrs", description: "Long-lasting smoothing treatment" },
    ],
  },
  {
    category: "Styling",
    services: [
      { service: "Blow Dry & Style", price: "$35", duration: "30 min", description: "Professional blowout and styling" },
      { service: "Special Occasion", price: "$65+", duration: "60 min", description: "Formal styling for events" },
      { service: "Bridal Hair", price: "$100+", duration: "90 min", description: "Includes consultation and trial" },
    ],
  },
];

export async function GET() {
  try {
    return NextResponse.json({ catalogue: servicesCatalogue });
  } catch (error) {
    console.error("Error fetching services catalogue:", error);
    return NextResponse.json(
      { error: "Failed to fetch services catalogue" },
      { status: 500 }
    );
  }
}
