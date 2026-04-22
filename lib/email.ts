import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * إرسال إيميل تحذيري للمشترك الذي تجاوز حد محاولات Screenshot
 */
export async function sendScreenshotWarningEmail(
  toEmail: string,
  userName: string,
  attemptCount: number
): Promise<{ success: boolean; error?: string }> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("⚠️ SMTP not configured. Skipping warning email.");
    return { success: false, error: "SMTP not configured" };
  }

  const subject = `⚠️ Sewar RijbewijsOnline – Waarschuwing schermafbeelding / تحذير لقطة شاشة`;

  const html = `
<!DOCTYPE html>
<html dir="ltr" lang="nl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Waarschuwing – Sewar RijbewijsOnline</title>
</head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#dc2626,#b91c1c);padding:32px 40px;text-align:center;">
              <div style="font-size:48px;margin-bottom:12px;">⚠️</div>
              <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:900;letter-spacing:-0.5px;">
                Sewar RijbewijsOnline
              </h1>
              <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">
                Beveiligingswaarschuwing / تحذير أمني
              </p>
            </td>
          </tr>

          <!-- Body NL -->
          <tr>
            <td style="padding:36px 40px 24px;">
              <p style="color:#374151;font-size:16px;margin:0 0 16px;">Beste <strong>${userName}</strong>,</p>
              <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px;">
                We hebben gedetecteerd dat er op uw account 
                <strong style="color:#dc2626;">${attemptCount} pogingen</strong> zijn gedaan 
                om schermafbeeldingen te maken van beschermde inhoud.
              </p>
              <div style="background:#fef2f2;border:2px solid #fecaca;border-radius:12px;padding:20px;margin-bottom:24px;">
                <p style="color:#991b1b;font-size:14px;font-weight:700;margin:0 0 8px;">⛔ Dit is niet toegestaan:</p>
                <ul style="color:#7f1d1d;font-size:14px;margin:0;padding-right:20px;line-height:1.8;">
                  <li>Het kopiëren of opslaan van beschermde leermaterialen</li>
                  <li>Het delen van inhoud met anderen</li>
                  <li>Herhaalde pogingen kunnen leiden tot opschorting van uw abonnement</li>
                </ul>
              </div>
              <p style="color:#6b7280;font-size:14px;margin:0;">
                Als u vragen heeft, neem dan contact met ons op via 
                <a href="mailto:sewarrijbewijs@gmail.com" style="color:#2563eb;">sewarrijbewijs@gmail.com</a>
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:2px dashed #e5e7eb;margin:0;" />
            </td>
          </tr>

          <!-- Body AR -->
          <tr>
            <td style="padding:24px 40px 36px;" dir="rtl">
              <p style="color:#374151;font-size:16px;margin:0 0 16px;">عزيزي <strong>${userName}</strong>،</p>
              <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px;">
                لقد رصدنا على حسابك 
                <strong style="color:#dc2626;">${attemptCount} محاولة</strong> 
                لأخذ لقطات شاشة من المحتوى المحمي.
              </p>
              <div style="background:#fef2f2;border:2px solid #fecaca;border-radius:12px;padding:20px;margin-bottom:24px;">
                <p style="color:#991b1b;font-size:14px;font-weight:700;margin:0 0 8px;">⛔ هذا غير مسموح به:</p>
                <ul style="color:#7f1d1d;font-size:14px;margin:0;padding-right:20px;line-height:1.8;">
                  <li>نسخ أو حفظ المواد التعليمية المحمية</li>
                  <li>مشاركة المحتوى مع الآخرين</li>
                  <li>تكرار المحاولات قد يؤدي إلى تعليق اشتراكك</li>
                </ul>
              </div>
              <p style="color:#6b7280;font-size:14px;margin:0;">
                إذا كان لديك أي استفسار، تواصل معنا على 
                <a href="mailto:sewarrijbewijs@gmail.com" style="color:#2563eb;">sewarrijbewijs@gmail.com</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="color:#9ca3af;font-size:12px;margin:0;">
                © ${new Date().getFullYear()} Sewar RijbewijsOnline · 
                <a href="mailto:sewarrijbewijs@gmail.com" style="color:#6b7280;">sewarrijbewijs@gmail.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    await transporter.sendMail({
      from: `"Sewar RijbewijsOnline" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject,
      html,
    });
    console.log(`✅ Warning email sent to ${toEmail} (${attemptCount} attempts)`);
    return { success: true };
  } catch (error: any) {
    console.error(`❌ Email failed to ${toEmail}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * إرسال إيميل إشعار تعليق الاشتراك
 */
export async function sendSuspensionEmail(
  toEmail: string,
  userName: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return { success: false, error: "SMTP not configured" };
  }

  const subject = `🔒 Sewar RijbewijsOnline – Abonnement opgeschort / تم تعليق اشتراكك`;

  const html = `
<!DOCTYPE html>
<html dir="ltr" lang="nl">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:600px;width:100%;">
          <tr>
            <td style="background:linear-gradient(135deg,#7c3aed,#5b21b6);padding:32px 40px;text-align:center;">
              <div style="font-size:48px;margin-bottom:12px;">🔒</div>
              <h1 style="color:#fff;margin:0;font-size:24px;font-weight:900;">Sewar RijbewijsOnline</h1>
              <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Abonnement opgeschort / تعليق الاشتراك</p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px 24px;">
              <p style="color:#374151;font-size:16px;margin:0 0 16px;">Beste <strong>${userName}</strong>,</p>
              <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px;">
                Uw abonnement is tijdelijk opgeschort door de beheerder.
              </p>
              ${reason ? `<div style="background:#f5f3ff;border:2px solid #ddd6fe;border-radius:12px;padding:16px;margin-bottom:20px;">
                <p style="color:#5b21b6;font-size:14px;font-weight:700;margin:0 0 4px;">Reden / السبب:</p>
                <p style="color:#374151;font-size:14px;margin:0;">${reason}</p>
              </div>` : ""}
              <p style="color:#6b7280;font-size:14px;margin:0;">
                Neem contact op via <a href="mailto:sewarrijbewijs@gmail.com" style="color:#2563eb;">sewarrijbewijs@gmail.com</a>
              </p>
            </td>
          </tr>
          <tr><td style="padding:0 40px;"><hr style="border:none;border-top:2px dashed #e5e7eb;margin:0;"/></td></tr>
          <tr>
            <td style="padding:24px 40px 36px;" dir="rtl">
              <p style="color:#374151;font-size:16px;margin:0 0 16px;">عزيزي <strong>${userName}</strong>،</p>
              <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px;">
                تم تعليق اشتراكك مؤقتاً من قِبل المشرف.
              </p>
              ${reason ? `<div style="background:#f5f3ff;border:2px solid #ddd6fe;border-radius:12px;padding:16px;margin-bottom:20px;">
                <p style="color:#5b21b6;font-size:14px;font-weight:700;margin:0 0 4px;">السبب:</p>
                <p style="color:#374151;font-size:14px;margin:0;">${reason}</p>
              </div>` : ""}
              <p style="color:#6b7280;font-size:14px;margin:0;">
                للتواصل: <a href="mailto:sewarrijbewijs@gmail.com" style="color:#2563eb;">sewarrijbewijs@gmail.com</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="color:#9ca3af;font-size:12px;margin:0;">© ${new Date().getFullYear()} Sewar RijbewijsOnline</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    await transporter.sendMail({
      from: `"Sewar RijbewijsOnline" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject,
      html,
    });
    console.log(`✅ Suspension email sent to ${toEmail}`);
    return { success: true };
  } catch (error: any) {
    console.error(`❌ Suspension email failed to ${toEmail}:`, error.message);
    return { success: false, error: error.message };
  }
}
