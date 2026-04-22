import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await request.json();

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json({
        success: false,
        message: "Name, email, and message are required"
      }, { status: 400 });
    }

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    // تحقق من وجود بيانات SMTP
    if (!smtpUser || !smtpPass) {
      console.error("SMTP credentials missing:", { smtpUser: !!smtpUser, smtpPass: !!smtpPass });
      return NextResponse.json({
        success: false,
        message: "Email service not configured",
        debug: { smtp_user: smtpUser ? "set" : "MISSING", smtp_pass: smtpPass ? "set" : "MISSING" }
      }, { status: 500 });
    }

    // Setup Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // تحقق من الاتصال
    await transporter.verify();

    // Email content
    const mailOptions = {
      from: `"Sewar RijbewijsOnline" <${smtpUser}>`,
      to: process.env.CONTACT_EMAIL || "sewarrijbewijs@gmail.com",
      replyTo: email,
      subject: `📩 رسالة جديدة من ${name}${subject ? ` - ${subject}` : ''}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #3b82f6; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">📩 رسالة جديدة من نموذج التواصل</h2>
          
          <div style="margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>الاسم:</strong> ${name}</p>
            <p style="margin: 10px 0;"><strong>البريد:</strong> <a href="mailto:${email}">${email}</a></p>
            ${phone ? `<p style="margin: 10px 0;"><strong>الهاتف:</strong> ${phone}</p>` : ''}
            ${subject ? `<p style="margin: 10px 0;"><strong>الموضوع:</strong> ${subject}</p>` : ''}
          </div>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">الرسالة:</h3>
            <p style="color: #4b5563; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
          
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #6b7280; font-size: 12px;">
            <p>تاريخ الإرسال: ${new Date().toLocaleString('ar-EG', { timeZone: 'Europe/Amsterdam' })}</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: "Your message has been sent successfully"
    });

  } catch (error: any) {
    console.error("Contact email error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to send email",
      error: error?.message || String(error),
      code: error?.code,
      smtp_user: process.env.SMTP_USER ? "set" : "MISSING",
      smtp_pass: process.env.SMTP_PASS ? "set" : "MISSING",
    }, { status: 500 });
  }
}
