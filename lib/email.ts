import nodemailer from "nodemailer";

// ننشئ transporter داخل كل دالة لضمان قراءة env vars في وقت التشغيل
function createTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    throw new Error(`SMTP not configured. SMTP_USER=${user ? "set" : "MISSING"}, SMTP_PASS=${pass ? "set" : "MISSING"}`);
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });
}

/**
 * إرسال إيميل تحذيري للمشترك الذي تجاوز حد محاولات Screenshot
 */
export async function sendScreenshotWarningEmail(
  toEmail: string,
  userName: string,
  attemptCount: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = createTransporter();

    const subject = `⚠️ Sewar Rijbewijs Online – Waarschuwing schermafbeelding / تحذير لقطة شاشة`;

    const html = `
<!DOCTYPE html>
<html dir="ltr" lang="nl">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:600px;width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,#dc2626,#b91c1c);padding:32px 40px;text-align:center;">
            <div style="font-size:48px;margin-bottom:12px;">⚠️</div>
            <h1 style="color:#fff;margin:0;font-size:24px;font-weight:900;">Sewar Rijbewijs Online</h1>
            <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Beveiligingswaarschuwing / تحذير أمني</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px 24px;">
            <p style="color:#374151;font-size:16px;margin:0 0 16px;">Beste <strong>${userName}</strong>,</p>
            <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px;">
              We hebben gedetecteerd dat er op uw account
              <strong style="color:#dc2626;"> ${attemptCount} pogingen</strong> zijn gedaan
              om schermafbeeldingen te maken van beschermde inhoud.
            </p>
            <div style="background:#fef2f2;border:2px solid #fecaca;border-radius:12px;padding:20px;margin-bottom:24px;">
              <p style="color:#991b1b;font-size:14px;font-weight:700;margin:0 0 8px;">⛔ Dit is niet toegestaan:</p>
              <ul style="color:#7f1d1d;font-size:14px;margin:0;padding-left:20px;line-height:1.8;">
                <li>Het kopiëren of opslaan van beschermde leermaterialen</li>
                <li>Het delen van inhoud met anderen</li>
                <li>Herhaalde pogingen kunnen leiden tot opschorting van uw abonnement</li>
              </ul>
            </div>
            <p style="color:#6b7280;font-size:14px;margin:0;">
              Vragen? <a href="mailto:sewarrijbewijs@gmail.com" style="color:#2563eb;">sewarrijbewijs@gmail.com</a>
            </p>
          </td>
        </tr>
        <tr><td style="padding:0 40px;"><hr style="border:none;border-top:2px dashed #e5e7eb;margin:0;"/></td></tr>
        <tr>
          <td style="padding:24px 40px 36px;" dir="rtl">
            <p style="color:#374151;font-size:16px;margin:0 0 16px;">عزيزي <strong>${userName}</strong>،</p>
            <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px;">
              لقد رصدنا على حسابك
              <strong style="color:#dc2626;"> ${attemptCount} محاولة</strong>
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
              للتواصل: <a href="mailto:sewarrijbewijs@gmail.com" style="color:#2563eb;">sewarrijbewijs@gmail.com</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="color:#9ca3af;font-size:12px;margin:0;">
              © ${new Date().getFullYear()} Sewar Rijbewijs Online ·
              <a href="mailto:sewarrijbewijs@gmail.com" style="color:#6b7280;">sewarrijbewijs@gmail.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await transporter.sendMail({
      from: `"Sewar Rijbewijs Online" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject,
      html,
    });

    console.log(`✅ Warning email sent to ${toEmail} (${attemptCount} attempts)`);
    return { success: true };
  } catch (error: any) {
    console.error(`❌ Warning email failed to ${toEmail}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * إرسال إيميل تحذير شديد + إشعار تعليق تلقائي بعد 6+ محاولات screenshot
 */
export async function sendAutoSuspendEmail(
  toEmail: string,
  userName: string,
  attemptCount: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = createTransporter();

    const subject = `🔒 Sewar Rijbewijs Online – Account opgeschort wegens misbruik / تم تعليق حسابك تلقائياً`;

    const html = `
<!DOCTYPE html>
<html dir="ltr" lang="nl">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:600px;width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,#7c3aed,#4c1d95);padding:32px 40px;text-align:center;">
            <div style="font-size:48px;margin-bottom:12px;">🔒</div>
            <h1 style="color:#fff;margin:0;font-size:24px;font-weight:900;">Sewar Rijbewijs Online</h1>
            <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Account opgeschort / تم تعليق الحساب</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px 24px;">
            <p style="color:#374151;font-size:16px;margin:0 0 16px;">Beste <strong>${userName}</strong>,</p>
            <div style="background:#fef2f2;border:2px solid #fecaca;border-radius:12px;padding:20px;margin-bottom:20px;">
              <p style="color:#991b1b;font-size:15px;font-weight:900;margin:0 0 12px;">⛔ Uw account is automatisch opgeschort</p>
              <p style="color:#7f1d1d;font-size:14px;line-height:1.7;margin:0 0 12px;">
                Er zijn <strong>${attemptCount} pogingen</strong> gedetecteerd om beschermde inhoud te fotograferen.
                Uw account is <strong>onmiddellijk opgeschort</strong>.
              </p>
              <ul style="color:#7f1d1d;font-size:14px;margin:0;padding-left:20px;line-height:1.9;">
                <li>Het kopiëren van beschermd lesmateriaal is <strong>illegaal</strong></li>
                <li>Uw gegevens zijn geregistreerd (IP-adres, tijdstip, pagina)</li>
                <li>Wij behouden ons het recht voor om <strong>juridische stappen</strong> te ondernemen</li>
                <li>Dit valt onder de <strong>Belgische wet op het auteursrecht (art. 80 WER)</strong></li>
              </ul>
            </div>
            <div style="background:#fffbeb;border:2px solid #fde68a;border-radius:12px;padding:16px;margin-bottom:20px;">
              <p style="color:#92400e;font-size:14px;font-weight:700;margin:0 0 6px;">📋 Geregistreerde gegevens:</p>
              <p style="color:#78350f;font-size:13px;margin:0;">E-mail: ${toEmail} | Pogingen: ${attemptCount} | Datum: ${new Date().toLocaleDateString("nl-BE")}</p>
            </div>
            <p style="color:#6b7280;font-size:14px;margin:0;">
              Bezwaar? <a href="mailto:sewarrijbewijs@gmail.com" style="color:#2563eb;">sewarrijbewijs@gmail.com</a>
            </p>
          </td>
        </tr>
        <tr><td style="padding:0 40px;"><hr style="border:none;border-top:3px dashed #e5e7eb;margin:0;"/></td></tr>
        <tr>
          <td style="padding:24px 40px 36px;" dir="rtl">
            <p style="color:#374151;font-size:16px;margin:0 0 16px;">عزيزي <strong>${userName}</strong>،</p>
            <div style="background:#fef2f2;border:2px solid #fecaca;border-radius:12px;padding:20px;margin-bottom:20px;">
              <p style="color:#991b1b;font-size:15px;font-weight:900;margin:0 0 12px;">⛔ تم تعليق حسابك تلقائياً</p>
              <p style="color:#7f1d1d;font-size:14px;line-height:1.7;margin:0 0 12px;">
                تم رصد <strong>${attemptCount} محاولة</strong> لتصوير المحتوى المحمي.
                تم <strong>تعليق حسابك فوراً</strong>.
              </p>
              <ul style="color:#7f1d1d;font-size:14px;margin:0;padding-right:20px;line-height:1.9;">
                <li>نسخ المواد التعليمية المحمية <strong>مخالف للقانون</strong></li>
                <li>تم تسجيل بياناتك (عنوان IP، الوقت، الصفحة)</li>
                <li>نحتفظ بحقنا في <strong>اتخاذ إجراءات قانونية</strong> بحقك</li>
                <li>يخضع ذلك لـ <strong>قانون حقوق الملكية الفكرية البلجيكي (المادة 80)</strong></li>
              </ul>
            </div>
            <div style="background:#fffbeb;border:2px solid #fde68a;border-radius:12px;padding:16px;margin-bottom:20px;">
              <p style="color:#92400e;font-size:14px;font-weight:700;margin:0 0 6px;">📋 البيانات المسجلة:</p>
              <p style="color:#78350f;font-size:13px;margin:0;">البريد: ${toEmail} | المحاولات: ${attemptCount} | التاريخ: ${new Date().toLocaleDateString("ar-EG")}</p>
            </div>
            <p style="color:#6b7280;font-size:14px;margin:0;">
              للاعتراض: <a href="mailto:sewarrijbewijs@gmail.com" style="color:#2563eb;">sewarrijbewijs@gmail.com</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="color:#9ca3af;font-size:12px;margin:0;">© ${new Date().getFullYear()} Sewar Rijbewijs Online · sewarrijbewijs@gmail.com</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await transporter.sendMail({
      from: `"Sewar Rijbewijs Online" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject,
      html,
    });

    console.log(`✅ Auto-suspend email sent to ${toEmail} (${attemptCount} attempts)`);
    return { success: true };
  } catch (error: any) {
    console.error(`❌ Auto-suspend email failed to ${toEmail}:`, error.message);
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
  try {
    const transporter = createTransporter();

    const subject = `🔒 Sewar Rijbewijs Online – Abonnement opgeschort / تم تعليق اشتراكك`;

    const html = `
<!DOCTYPE html>
<html dir="ltr" lang="nl">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:600px;width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,#7c3aed,#5b21b6);padding:32px 40px;text-align:center;">
            <div style="font-size:48px;margin-bottom:12px;">🔒</div>
            <h1 style="color:#fff;margin:0;font-size:24px;font-weight:900;">Sewar Rijbewijs Online</h1>
            <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Abonnement opgeschort / تعليق الاشتراك</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px 24px;">
            <p style="color:#374151;font-size:16px;margin:0 0 16px;">Beste <strong>${userName}</strong>,</p>
            <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px;">Uw abonnement is tijdelijk opgeschort door de beheerder.</p>
            ${reason ? `<div style="background:#f5f3ff;border:2px solid #ddd6fe;border-radius:12px;padding:16px;margin-bottom:20px;">
              <p style="color:#5b21b6;font-size:14px;font-weight:700;margin:0 0 4px;">Reden:</p>
              <p style="color:#374151;font-size:14px;margin:0;">${reason}</p>
            </div>` : ""}
            <p style="color:#6b7280;font-size:14px;margin:0;">
              Contact: <a href="mailto:sewarrijbewijs@gmail.com" style="color:#2563eb;">sewarrijbewijs@gmail.com</a>
            </p>
          </td>
        </tr>
        <tr><td style="padding:0 40px;"><hr style="border:none;border-top:2px dashed #e5e7eb;margin:0;"/></td></tr>
        <tr>
          <td style="padding:24px 40px 36px;" dir="rtl">
            <p style="color:#374151;font-size:16px;margin:0 0 16px;">عزيزي <strong>${userName}</strong>،</p>
            <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px;">تم تعليق اشتراكك مؤقتاً من قِبل المشرف.</p>
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
            <p style="color:#9ca3af;font-size:12px;margin:0;">© ${new Date().getFullYear()} Sewar Rijbewijs Online</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await transporter.sendMail({
      from: `"Sewar Rijbewijs Online" <${process.env.SMTP_USER}>`,
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

/**
 * إرسال إيميل تأكيد الاشتراك مع الفاتورة
 */
export async function sendSubscriptionConfirmationEmail(params: {
  toEmail: string;
  userName: string;
  subscriptionType: string;
  category: string;
  duration: string;
  amount: number;
  expiryDate: Date;
  paymentMethod: string;
  invoiceNumber: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = createTransporter();

    const { toEmail, userName, subscriptionType, category, duration, amount, expiryDate, paymentMethod, invoiceNumber } = params;

    // حساب الضريبة (21% BTW في بلجيكا)
    const BTW_RATE = 0.21;
    const amountExclBTW = Math.round((amount / (1 + BTW_RATE)) * 100) / 100;
    const btwAmount = Math.round((amount - amountExclBTW) * 100) / 100;

    // ترجمة نوع الاشتراك
    const subTypeNL: Record<string, string> = {
      theorie: "Theorie Rijbewijs",
      examen: "Examen Training",
      "praktijk-lessons": "Praktijk - Oefenvideo's",
      "praktijk-exam": "Praktijk - Gevaarherkenning",
    };
    const subTypeAR: Record<string, string> = {
      theorie: "دروس نظرية",
      examen: "تدريب الامتحانات",
      "praktijk-lessons": "عملي - فيديوهات",
      "praktijk-exam": "عملي - إدراك المخاطر",
    };
    const payMethodNL: Record<string, string> = {
      bancontact: "Bancontact",
      cash: "Contant",
      card: "Bankkaart",
      bank_transfer: "Overschrijving",
      payconiq: "Payconiq",
    };

    const subLabel = subTypeNL[subscriptionType] || subscriptionType;
    const subLabelAR = subTypeAR[subscriptionType] || subscriptionType;
    const payLabel = payMethodNL[paymentMethod] || paymentMethod;
    const durationLabel = duration === "2w" ? "2 Weken" : "1 Maand";
    const durationLabelAR = duration === "2w" ? "أسبوعان" : "شهر واحد";
    const expiryFormatted = expiryDate.toLocaleDateString("nl-BE", { day: "2-digit", month: "2-digit", year: "numeric" });
    const expiryFormattedAR = expiryDate.toLocaleDateString("ar-EG", { day: "2-digit", month: "2-digit", year: "numeric" });
    const today = new Date().toLocaleDateString("nl-BE", { day: "2-digit", month: "2-digit", year: "numeric" });
    const todayAR = new Date().toLocaleDateString("ar-EG", { day: "2-digit", month: "2-digit", year: "numeric" });

    const subject = `✅ Bevestiging abonnement – Sewar Rijbewijs Online | تأكيد الاشتراك`;

    const html = `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:32px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:600px;width:100%;">

      <!-- Header -->
      <tr>
        <td style="background:linear-gradient(135deg,#003399,#0055cc);padding:32px 40px;text-align:center;">
          <div style="font-size:48px;margin-bottom:12px;">🎉</div>
          <h1 style="color:#fff;margin:0;font-size:24px;font-weight:900;">Sewar Rijbewijs Online</h1>
          <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Abonnement bevestigd / تم تأكيد الاشتراك</p>
        </td>
      </tr>

      <!-- NL Content -->
      <tr>
        <td style="padding:32px 40px 24px;">
          <p style="color:#374151;font-size:16px;margin:0 0 8px;">Beste <strong>${userName}</strong>,</p>
          <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px;">
            Bedankt voor uw inschrijving! Uw abonnement is succesvol geactiveerd.
          </p>

          <!-- Subscription Details Box -->
          <div style="background:#eff6ff;border:2px solid #bfdbfe;border-radius:12px;padding:20px;margin-bottom:24px;">
            <h3 style="color:#1d4ed8;margin:0 0 16px;font-size:16px;">📋 Abonnementsdetails</h3>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="color:#6b7280;font-size:14px;padding:4px 0;">Type:</td>
                <td style="color:#111827;font-size:14px;font-weight:700;text-align:right;">${subLabel} – Categorie ${category}</td>
              </tr>
              <tr>
                <td style="color:#6b7280;font-size:14px;padding:4px 0;">Duur:</td>
                <td style="color:#111827;font-size:14px;font-weight:700;text-align:right;">${durationLabel}</td>
              </tr>
              <tr>
                <td style="color:#6b7280;font-size:14px;padding:4px 0;">Geldig tot:</td>
                <td style="color:#16a34a;font-size:14px;font-weight:700;text-align:right;">${expiryFormatted}</td>
              </tr>
            </table>
          </div>

          <!-- Invoice -->
          <div style="border:2px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:24px;">
            <div style="background:#f9fafb;padding:16px 20px;border-bottom:1px solid #e5e7eb;">
              <h3 style="color:#111827;margin:0;font-size:16px;">🧾 Factuur / Invoice</h3>
              <p style="color:#6b7280;font-size:12px;margin:4px 0 0;">Nr: ${invoiceNumber} | Datum: ${today}</p>
            </div>
            <table width="100%" cellpadding="0" cellspacing="0" style="padding:16px 20px;">
              <tr>
                <td style="color:#374151;font-size:14px;padding:6px 0;">${subLabel} – Cat. ${category} (${durationLabel})</td>
                <td style="color:#374151;font-size:14px;text-align:right;padding:6px 0;">€${amountExclBTW.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="color:#6b7280;font-size:13px;padding:4px 0;">BTW 21%</td>
                <td style="color:#6b7280;font-size:13px;text-align:right;padding:4px 0;">€${btwAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="2" style="border-top:2px solid #e5e7eb;padding-top:8px;"></td>
              </tr>
              <tr>
                <td style="color:#111827;font-size:16px;font-weight:900;padding:4px 0;">Totaal (incl. BTW)</td>
                <td style="color:#003399;font-size:16px;font-weight:900;text-align:right;padding:4px 0;">€${amount.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="color:#6b7280;font-size:13px;padding:4px 0;">Betaalmethode:</td>
                <td style="color:#374151;font-size:13px;text-align:right;padding:4px 0;">${payLabel}</td>
              </tr>
            </table>
          </div>

          <div style="background:#f0fdf4;border:2px solid #bbf7d0;border-radius:12px;padding:16px;margin-bottom:20px;text-align:center;">
            <p style="color:#16a34a;font-size:15px;font-weight:700;margin:0;">✅ Betaling ontvangen – Abonnement actief!</p>
          </div>

          <p style="color:#6b7280;font-size:13px;margin:0;">
            Vragen? <a href="mailto:sewarrijbewijs@gmail.com" style="color:#2563eb;">sewarrijbewijs@gmail.com</a>
          </p>
        </td>
      </tr>

      <!-- Divider -->
      <tr><td style="padding:0 40px;"><hr style="border:none;border-top:3px dashed #e5e7eb;margin:0;"/></td></tr>

      <!-- AR Content -->
      <tr>
        <td style="padding:32px 40px 24px;" dir="rtl">
          <p style="color:#374151;font-size:16px;margin:0 0 8px;">عزيزي <strong>${userName}</strong>،</p>
          <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px;">
            شكراً لاشتراكك! تم تفعيل اشتراكك بنجاح.
          </p>

          <!-- تفاصيل الاشتراك -->
          <div style="background:#eff6ff;border:2px solid #bfdbfe;border-radius:12px;padding:20px;margin-bottom:24px;">
            <h3 style="color:#1d4ed8;margin:0 0 16px;font-size:16px;">📋 تفاصيل الاشتراك</h3>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="color:#6b7280;font-size:14px;padding:4px 0;">النوع:</td>
                <td style="color:#111827;font-size:14px;font-weight:700;text-align:left;">${subLabelAR} – فئة ${category}</td>
              </tr>
              <tr>
                <td style="color:#6b7280;font-size:14px;padding:4px 0;">المدة:</td>
                <td style="color:#111827;font-size:14px;font-weight:700;text-align:left;">${durationLabelAR}</td>
              </tr>
              <tr>
                <td style="color:#6b7280;font-size:14px;padding:4px 0;">صالح حتى:</td>
                <td style="color:#16a34a;font-size:14px;font-weight:700;text-align:left;">${expiryFormattedAR}</td>
              </tr>
            </table>
          </div>

          <!-- الفاتورة -->
          <div style="border:2px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:24px;">
            <div style="background:#f9fafb;padding:16px 20px;border-bottom:1px solid #e5e7eb;">
              <h3 style="color:#111827;margin:0;font-size:16px;">🧾 الفاتورة</h3>
              <p style="color:#6b7280;font-size:12px;margin:4px 0 0;">رقم: ${invoiceNumber} | التاريخ: ${todayAR}</p>
            </div>
            <table width="100%" cellpadding="0" cellspacing="0" style="padding:16px 20px;">
              <tr>
                <td style="color:#374151;font-size:14px;padding:6px 0;">${subLabelAR} – فئة ${category} (${durationLabelAR})</td>
                <td style="color:#374151;font-size:14px;text-align:left;padding:6px 0;">€${amountExclBTW.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="color:#6b7280;font-size:13px;padding:4px 0;">ضريبة القيمة المضافة 21%</td>
                <td style="color:#6b7280;font-size:13px;text-align:left;padding:4px 0;">€${btwAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="2" style="border-top:2px solid #e5e7eb;padding-top:8px;"></td>
              </tr>
              <tr>
                <td style="color:#111827;font-size:16px;font-weight:900;padding:4px 0;">الإجمالي (شامل الضريبة)</td>
                <td style="color:#003399;font-size:16px;font-weight:900;text-align:left;padding:4px 0;">€${amount.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="color:#6b7280;font-size:13px;padding:4px 0;">طريقة الدفع:</td>
                <td style="color:#374151;font-size:13px;text-align:left;padding:4px 0;">${payLabel}</td>
              </tr>
            </table>
          </div>

          <div style="background:#f0fdf4;border:2px solid #bbf7d0;border-radius:12px;padding:16px;margin-bottom:20px;text-align:center;">
            <p style="color:#16a34a;font-size:15px;font-weight:700;margin:0;">✅ تم استلام الدفع – الاشتراك نشط!</p>
          </div>

          <p style="color:#6b7280;font-size:13px;margin:0;">
            للتواصل: <a href="mailto:sewarrijbewijs@gmail.com" style="color:#2563eb;">sewarrijbewijs@gmail.com</a>
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="color:#9ca3af;font-size:12px;margin:0;">© ${new Date().getFullYear()} Sewar Rijbewijs Online · sewarrijbewijs@gmail.com</p>
          <p style="color:#d1d5db;font-size:11px;margin:4px 0 0;">BTW-nummer: BE0XXX.XXX.XXX</p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;

    await transporter.sendMail({
      from: `"Sewar Rijbewijs Online" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject,
      html,
    });

    console.log(`✅ Subscription confirmation email sent to ${toEmail}`);
    return { success: true };
  } catch (error: any) {
    console.error(`❌ Subscription confirmation email failed to ${toEmail}:`, error.message);
    return { success: false, error: error.message };
  }
}
