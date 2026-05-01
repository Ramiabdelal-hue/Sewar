import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// GET - اختبار إرسال إيميل وعرض تشخيص كامل
export async function GET(request: NextRequest) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = parseInt(process.env.SMTP_PORT || "587");

  const debug = {
    smtp_user: smtpUser ? `set (${smtpUser})` : "❌ MISSING",
    smtp_pass: smtpPass ? `set (length: ${smtpPass.length})` : "❌ MISSING",
    smtp_host: smtpHost,
    smtp_port: smtpPort,
    node_env: process.env.NODE_ENV,
  };

  if (!smtpUser || !smtpPass) {
    return NextResponse.json({ success: false, error: "SMTP credentials missing", debug });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false,
      auth: { user: smtpUser, pass: smtpPass },
      tls: { rejectUnauthorized: false },
    });

    // اختبار الاتصال
    await transporter.verify();

    // إرسال إيميل تجريبي
    await transporter.sendMail({
      from: `"Sewar Test" <${smtpUser}>`,
      to: smtpUser, // إرسال لنفس الحساب
      subject: "✅ Test Email - Sewar Rijbewijs Online",
      text: `SMTP is working correctly!\n\nDebug info:\n${JSON.stringify(debug, null, 2)}`,
    });

    return NextResponse.json({ success: true, message: `Test email sent to ${smtpUser}`, debug });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      debug,
    }, { status: 500 });
  }
}
