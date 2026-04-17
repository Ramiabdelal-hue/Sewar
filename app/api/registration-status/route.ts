import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    locked: process.env.REGISTRATION_LOCKED === "true"
  });
}
