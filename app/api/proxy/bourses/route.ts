import { NextRequest, NextResponse } from "next/server";

/**
 * Mock endpoint pour tester les bourses
 * À supprimer une fois le backend Laravel connecté
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || "1";
  const perPage = searchParams.get("per_page") || "10";

  return NextResponse.json({
    data: [
      {
        id: 1,
        title: "Bourse Eiffel Excellence",
        description: "Bourse d'excellence pour études en France",
        country_id: 1,
        country: { id: 1, name: "France" },
        amount: 1181,
        currency: "EUR",
        status: "active",
        level: "master",
      },
      {
        id: 2,
        title: "Fulbright Foreign Student",
        description: "Programme d'échange USA",
        country_id: 2,
        country: { id: 2, name: "USA" },
        amount: 25000,
        currency: "USD",
        status: "active",
        level: "phd",
      },
    ],
    meta: {
      current_page: parseInt(page),
      per_page: parseInt(perPage),
      total: 50,
      last_page: 5,
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  return NextResponse.json({
    data: {
      id: Math.random(),
      ...body,
      created_at: new Date().toISOString(),
    },
  });
}
