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

    const subject = `🔒 Sewar Rijbewijs Online – Account opgeschort / تم تعليق حسابك / Compte suspendu / Account suspended`;

    const today = new Date();
    const dateNL = today.toLocaleDateString("nl-BE");
    const dateAR = today.toLocaleDateString("ar-EG");
    const dateFR = today.toLocaleDateString("fr-BE");
    const dateEN = today.toLocaleDateString("en-GB");

    const sections = [
      // ── هولندي ──
      {
        dir: "ltr",
        lang: "nl",
        greeting: `Beste <strong>${userName}</strong>,`,
        title: "⛔ Uw account is automatisch opgeschort",
        body: `Er zijn <strong>${attemptCount} pogingen</strong> gedetecteerd om beschermde inhoud te fotograferen. Uw account is <strong>onmiddellijk opgeschort</strong>.`,
        bullets: [
          "Het kopiëren van beschermd lesmateriaal is <strong>illegaal</strong>",
          "Uw gegevens zijn geregistreerd (IP-adres, tijdstip, pagina)",
          "Wij behouden ons het recht voor om <strong>juridische stappen</strong> te ondernemen",
          "Dit valt onder de <strong>Belgische wet op het auteursrecht (art. 80 WER)</strong>",
        ],
        dataLabel: "📋 Geregistreerde gegevens:",
        dataLine: `E-mail: ${toEmail} | Pogingen: ${attemptCount} | Datum: ${dateNL}`,
        contactLabel: "Bezwaar?",
        whatsapp: "📱 Neem contact op met Sewar Achour via WhatsApp om uw account te herstellen: <a href='https://wa.me/32470813725' style='color:#25d366;font-weight:700;'>+32 470 81 37 25</a>",
        paddingDir: "padding-left:20px",
      },
      // ── فرنسي ──
      {
        dir: "ltr",
        lang: "fr",
        greeting: `Cher(e) <strong>${userName}</strong>,`,
        title: "⛔ Votre compte a été automatiquement suspendu",
        body: `<strong>${attemptCount} tentatives</strong> de capture d'écran de contenu protégé ont été détectées. Votre compte est <strong>immédiatement suspendu</strong>.`,
        bullets: [
          "La copie de matériel pédagogique protégé est <strong>illégale</strong>",
          "Vos données ont été enregistrées (adresse IP, heure, page)",
          "Nous nous réservons le droit d'engager des <strong>poursuites judiciaires</strong>",
          "Cela relève de la <strong>loi belge sur le droit d'auteur (art. 80 CDE)</strong>",
        ],
        dataLabel: "📋 Données enregistrées:",
        dataLine: `E-mail: ${toEmail} | Tentatives: ${attemptCount} | Date: ${dateFR}`,
        contactLabel: "Contestation?",
        whatsapp: "📱 Contactez Sewar Achour via WhatsApp pour récupérer votre compte: <a href='https://wa.me/32470813725' style='color:#25d366;font-weight:700;'>+32 470 81 37 25</a>",
        paddingDir: "padding-left:20px",
      },
      // ── إنجليزي ──
      {
        dir: "ltr",
        lang: "en",
        greeting: `Dear <strong>${userName}</strong>,`,
        title: "⛔ Your account has been automatically suspended",
        body: `<strong>${attemptCount} attempts</strong> to capture screenshots of protected content have been detected. Your account is <strong>immediately suspended</strong>.`,
        bullets: [
          "Copying protected educational material is <strong>illegal</strong>",
          "Your data has been recorded (IP address, time, page)",
          "We reserve the right to take <strong>legal action</strong> against you",
          "This falls under <strong>Belgian intellectual property law (art. 80)</strong>",
        ],
        dataLabel: "📋 Recorded data:",
        dataLine: `Email: ${toEmail} | Attempts: ${attemptCount} | Date: ${dateEN}`,
        contactLabel: "Appeal?",
        whatsapp: "📱 Contact Sewar Achour via WhatsApp to restore your account: <a href='https://wa.me/32470813725' style='color:#25d366;font-weight:700;'>+32 470 81 37 25</a>",
        paddingDir: "padding-left:20px",
      },
      // ── عربي ──
      {
        dir: "rtl",
        lang: "ar",
        greeting: `عزيزي <strong>${userName}</strong>،`,
        title: "⛔ تم تعليق حسابك تلقائياً",
        body: `تم رصد <strong>${attemptCount} محاولة</strong> لتصوير المحتوى المحمي. تم <strong>تعليق حسابك فوراً</strong>.`,
        bullets: [
          "نسخ المواد التعليمية المحمية <strong>مخالف للقانون</strong>",
          "تم تسجيل بياناتك (عنوان IP، الوقت، الصفحة)",
          "نحتفظ بحقنا في <strong>اتخاذ إجراءات قانونية</strong> بحقك",
          "يخضع ذلك لـ <strong>قانون حقوق الملكية الفكرية البلجيكي (المادة 80)</strong>",
        ],
        dataLabel: "📋 البيانات المسجلة:",
        dataLine: `البريد: ${toEmail} | المحاولات: ${attemptCount} | التاريخ: ${dateAR}`,
        contactLabel: "للاعتراض:",
        whatsapp: "📱 يجب التواصل مع سوار عاشور عبر واتساب لإعادة حسابك على الرقم: <a href='https://wa.me/32470813725' style='color:#25d366;font-weight:700;'>0470 81 37 25</a>",
        paddingDir: "padding-right:20px",
      },
    ];

    const sectionsHtml = sections.map((s, idx) => `
      ${idx > 0 ? '<tr><td style="padding:0 40px;"><hr style="border:none;border-top:3px dashed #e5e7eb;margin:0;"/></td></tr>' : ""}
      <tr>
        <td style="padding:28px 40px;" dir="${s.dir}">
          <p style="color:#374151;font-size:16px;margin:0 0 14px;">${s.greeting}</p>
          <div style="background:#fef2f2;border:2px solid #fecaca;border-radius:12px;padding:20px;margin-bottom:16px;">
            <p style="color:#991b1b;font-size:15px;font-weight:900;margin:0 0 10px;">${s.title}</p>
            <p style="color:#7f1d1d;font-size:14px;line-height:1.7;margin:0 0 10px;">${s.body}</p>
            <ul style="color:#7f1d1d;font-size:14px;margin:0;${s.paddingDir};line-height:1.9;">
              ${s.bullets.map(b => `<li>${b}</li>`).join("")}
            </ul>
          </div>
          <div style="background:#fffbeb;border:2px solid #fde68a;border-radius:10px;padding:14px;margin-bottom:14px;">
            <p style="color:#92400e;font-size:13px;font-weight:700;margin:0 0 4px;">${s.dataLabel}</p>
            <p style="color:#78350f;font-size:13px;margin:0;">${s.dataLine}</p>
          </div>
          <div style="background:#f0fdf4;border:2px solid #bbf7d0;border-radius:10px;padding:14px;margin-bottom:14px;">
            <p style="color:#166534;font-size:13px;margin:0;">${s.whatsapp}</p>
          </div>
          <p style="color:#6b7280;font-size:13px;margin:0;">
            ${s.contactLabel} <a href="mailto:sewarrijbewijs@gmail.com" style="color:#2563eb;">sewarrijbewijs@gmail.com</a>
          </p>
        </td>
      </tr>
    `).join("");

    const html = `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:600px;width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,#7c3aed,#4c1d95);padding:28px 40px;text-align:center;">
            <div style="font-size:44px;margin-bottom:10px;">🔒</div>
            <h1 style="color:#fff;margin:0;font-size:22px;font-weight:900;">Sewar Rijbewijs Online</h1>
            <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">
              Account opgeschort · Compte suspendu · Account suspended · تم تعليق الحساب
            </p>
          </td>
        </tr>
        ${sectionsHtml}
        <tr>
          <td style="background:#f9fafb;padding:18px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <div style="display:inline-flex;gap:0;border-radius:6px;overflow:hidden;margin-bottom:8px;">
              <div style="width:20px;height:4px;background:#1a1a1a;"></div>
              <div style="width:20px;height:4px;background:#f5a623;"></div>
              <div style="width:20px;height:4px;background:#e63946;"></div>
            </div>
            <p style="color:#9ca3af;font-size:11px;margin:0;">© ${new Date().getFullYear()} Sewar Rijbewijs Online · sewarrijbewijs@gmail.com</p>
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
 * إرسال إيميل تنبيه للأدمن عند تعليق مشترك تلقائياً
 */
export async function sendAdminAlertEmail(params: {
  userName: string;
  userEmail: string;
  userPhone: string | null;
  attemptCount: number;
  page: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = createTransporter();
    const { userName, userEmail, userPhone, attemptCount, page } = params;

    // استخراج اسم القسم من الـ URL
    const sectionMap: Record<string, string> = {
      "/theorie": "Theorie / النظرية",
      "/examen": "Examen / الامتحانات",
      "/gratis": "Gratis / مجاني",
      "/praktical": "Praktijk / العملي",
      "/lessons": "Lessen / الدروس",
    };
    const section = Object.entries(sectionMap).find(([k]) => page.includes(k))?.[1] || page;

    const dateNL = new Date().toLocaleDateString("nl-BE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
    const dateAR = new Date().toLocaleDateString("ar-EG", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

    const subject = `🚨 Sewar Admin Alert – ${userName} opgeschort wegens ${attemptCount} screenshots / تم تعليق ${userName}`;

    const html = `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#dc2626,#991b1b);padding:24px 36px;text-align:center;">
            <div style="font-size:40px;margin-bottom:8px;">🚨</div>
            <h1 style="color:#fff;margin:0;font-size:20px;font-weight:900;">Admin Beveiligingsalert</h1>
            <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">Sewar Rijbewijs Online — Automatische opschorting</p>
          </td>
        </tr>

        <!-- NL Section -->
        <tr>
          <td style="padding:28px 36px 20px;" dir="ltr">
            <p style="color:#374151;font-size:15px;margin:0 0 16px;">Beste <strong>Sewar</strong>,</p>
            <p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 16px;">
              Een abonnee heeft <strong style="color:#dc2626;">${attemptCount} pogingen</strong> gedaan om schermafbeeldingen te maken van beschermde inhoud.
              Het account is <strong>automatisch opgeschort</strong>.
            </p>

            <!-- Subscriber Info Box -->
            <div style="background:#fef2f2;border:2px solid #fecaca;border-radius:12px;padding:20px;margin-bottom:16px;">
              <p style="color:#991b1b;font-size:14px;font-weight:900;margin:0 0 12px;">👤 Abonneegegevens:</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color:#6b7280;font-size:13px;padding:4px 0;width:120px;">Naam:</td>
                  <td style="color:#111827;font-size:13px;font-weight:700;">${userName}</td>
                </tr>
                <tr>
                  <td style="color:#6b7280;font-size:13px;padding:4px 0;">E-mail:</td>
                  <td style="color:#2563eb;font-size:13px;font-weight:700;">
                    <a href="mailto:${userEmail}" style="color:#2563eb;">${userEmail}</a>
                  </td>
                </tr>
                <tr>
                  <td style="color:#6b7280;font-size:13px;padding:4px 0;">Telefoon:</td>
                  <td style="color:#111827;font-size:13px;font-weight:700;">${userPhone || "Niet opgegeven"}</td>
                </tr>
                <tr>
                  <td style="color:#6b7280;font-size:13px;padding:4px 0;">Sectie:</td>
                  <td style="color:#dc2626;font-size:13px;font-weight:700;">${section}</td>
                </tr>
                <tr>
                  <td style="color:#6b7280;font-size:13px;padding:4px 0;">Pogingen:</td>
                  <td style="color:#dc2626;font-size:14px;font-weight:900;">${attemptCount} ×</td>
                </tr>
                <tr>
                  <td style="color:#6b7280;font-size:13px;padding:4px 0;">Datum/tijd:</td>
                  <td style="color:#111827;font-size:13px;">${dateNL}</td>
                </tr>
              </table>
            </div>

            <div style="background:#eff6ff;border:2px solid #bfdbfe;border-radius:10px;padding:14px;margin-bottom:16px;">
              <p style="color:#1d4ed8;font-size:13px;font-weight:700;margin:0 0 4px;">✅ Automatisch uitgevoerde acties:</p>
              <ul style="color:#1e40af;font-size:13px;margin:0;padding-left:18px;line-height:1.8;">
                <li>Account opgeschort (status = suspended)</li>
                <li>Sessietoken verwijderd</li>
                <li>Waarschuwings-e-mail verzonden naar abonnee (4 talen)</li>
              </ul>
            </div>

            <p style="color:#6b7280;font-size:13px;margin:0;">
              Beheer: <a href="https://www.sewarrijbewijsonline.be/admin/subscribers" style="color:#2563eb;">Admin Dashboard</a>
            </p>
          </td>
        </tr>

        <!-- Divider -->
        <tr><td style="padding:0 36px;"><hr style="border:none;border-top:3px dashed #e5e7eb;margin:0;"/></td></tr>

        <!-- AR Section -->
        <tr>
          <td style="padding:28px 36px 20px;" dir="rtl">
            <p style="color:#374151;font-size:15px;margin:0 0 16px;">مرحباً <strong>سوار</strong>،</p>
            <p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 16px;">
              قام أحد المشتركين بـ <strong style="color:#dc2626;">${attemptCount} محاولة</strong> لتصوير المحتوى المحمي.
              تم <strong>تعليق حسابه تلقائياً</strong>.
            </p>

            <!-- بيانات المشترك -->
            <div style="background:#fef2f2;border:2px solid #fecaca;border-radius:12px;padding:20px;margin-bottom:16px;">
              <p style="color:#991b1b;font-size:14px;font-weight:900;margin:0 0 12px;">👤 بيانات المشترك:</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color:#6b7280;font-size:13px;padding:4px 0;width:120px;">الاسم:</td>
                  <td style="color:#111827;font-size:13px;font-weight:700;">${userName}</td>
                </tr>
                <tr>
                  <td style="color:#6b7280;font-size:13px;padding:4px 0;">البريد:</td>
                  <td style="color:#2563eb;font-size:13px;font-weight:700;">
                    <a href="mailto:${userEmail}" style="color:#2563eb;">${userEmail}</a>
                  </td>
                </tr>
                <tr>
                  <td style="color:#6b7280;font-size:13px;padding:4px 0;">الهاتف:</td>
                  <td style="color:#111827;font-size:13px;font-weight:700;">${userPhone || "غير محدد"}</td>
                </tr>
                <tr>
                  <td style="color:#6b7280;font-size:13px;padding:4px 0;">القسم:</td>
                  <td style="color:#dc2626;font-size:13px;font-weight:700;">${section}</td>
                </tr>
                <tr>
                  <td style="color:#6b7280;font-size:13px;padding:4px 0;">المحاولات:</td>
                  <td style="color:#dc2626;font-size:14px;font-weight:900;">${attemptCount} ×</td>
                </tr>
                <tr>
                  <td style="color:#6b7280;font-size:13px;padding:4px 0;">التاريخ:</td>
                  <td style="color:#111827;font-size:13px;">${dateAR}</td>
                </tr>
              </table>
            </div>

            <div style="background:#eff6ff;border:2px solid #bfdbfe;border-radius:10px;padding:14px;margin-bottom:16px;">
              <p style="color:#1d4ed8;font-size:13px;font-weight:700;margin:0 0 4px;">✅ الإجراءات المنفذة تلقائياً:</p>
              <ul style="color:#1e40af;font-size:13px;margin:0;padding-right:18px;line-height:1.8;">
                <li>تم تعليق الحساب (status = suspended)</li>
                <li>تم حذف رمز الجلسة</li>
                <li>تم إرسال إيميل تحذير للمشترك (4 لغات)</li>
              </ul>
            </div>

            <p style="color:#6b7280;font-size:13px;margin:0;">
              لوحة التحكم: <a href="https://www.sewarrijbewijsonline.be/admin/subscribers" style="color:#2563eb;">Admin Dashboard</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:16px 36px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="color:#9ca3af;font-size:11px;margin:0;">© ${new Date().getFullYear()} Sewar Rijbewijs Online — Automatisch gegenereerd bericht</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await transporter.sendMail({
      from: `"Sewar Rijbewijs Online – Alert" <${process.env.SMTP_USER}>`,
      to: "sewarrijbewijs@gmail.com",
      subject,
      html,
    });

    console.log(`✅ Admin alert email sent for ${userEmail}`);
    return { success: true };
  } catch (error: any) {
    console.error(`❌ Admin alert email failed:`, error.message);
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
