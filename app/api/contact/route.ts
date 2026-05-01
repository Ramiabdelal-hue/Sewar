import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { checkRateLimit, getClientIp, sanitizeString, isValidEmail } from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
  // Rate limit: max 3 contact messages per 10 minutes per IP
  const ip = getClientIp(request);
  if (!checkRateLimit(ip, 3, 600000)) {
    return NextResponse.json({ success: false, message: "Too many requests. Try again later." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const name = sanitizeString(body.name, 100);
    const email = sanitizeString(body.email, 254);
    const phone = sanitizeString(body.phone, 20);
    const subject = sanitizeString(body.subject, 200);
    const message = sanitizeString(body.message, 2000);

    if (!name || !isValidEmail(email) || !message) {
      return NextResponse.json({ success: false, message: "Name, valid email, and message are required" }, { status: 400 });
    }

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      console.error("SMTP credentials missing");
      return NextResponse.json({ success: false, message: "Email service not configured" }, { status: 500 });
    }

    // ننشئ transporter هنا (وقت التشغيل) لضمان قراءة env vars
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: { user: smtpUser, pass: smtpPass },
      tls: { rejectUnauthorized: false },
    });

    await transporter.sendMail({
      from: `"Sewar Rijbewijs Online" <${smtpUser}>`,
      to: process.env.CONTACT_EMAIL || "sewarrijbewijs@gmail.com",
      replyTo: email,
      subject: `📩 رسالة جديدة من ${name}${subject ? ` - ${subject}` : ""}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e0e0e0;border-radius:10px;">
          <h2 style="color:#3b82f6;border-bottom:2px solid #3b82f6;padding-bottom:10px;">📩 رسالة جديدة</h2>
          <p><strong>الاسم:</strong> ${name}</p>
          <p><strong>البريد:</strong> <a href="mailto:${email}">${email}</a></p>
          ${phone ? `<p><strong>الهاتف:</strong> ${phone}</p>` : ""}
          ${subject ? `<p><strong>الموضوع:</strong> ${subject}</p>` : ""}
          <div style="background:#f3f4f6;padding:15px;border-radius:5px;margin:20px 0;">
            <h3 style="color:#374151;margin-top:0;">الرسالة:</h3>
            <p style="color:#4b5563;line-height:1.6;white-space:pre-wrap;">${message}</p>
          </div>
          <p style="color:#6b7280;font-size:12px;">تاريخ الإرسال: ${new Date().toLocaleString("ar-EG", { timeZone: "Europe/Amsterdam" })}</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: "Your message has been sent successfully" });

  } catch (error: any) {
    console.error("Contact email error:", error.message);
    return NextResponse.json({ success: false, message: "Failed to send email" }, { status: 500 });
  }
}
