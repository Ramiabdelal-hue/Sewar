import { NextResponse } from "next/server";

// لتفعيل القفل: غير إلى true
// لفتح التسجيل: غير إلى false
const REGISTRATION_LOCKED = true;

export async function GET() {
  return NextResponse.json({
    locked: REGISTRATION_LOCKED || process.env.REGISTRATION_LOCKED === "true"
  });
}
