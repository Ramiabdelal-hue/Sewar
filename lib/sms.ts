import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const senderName = process.env.TWILIO_SENDER_ID || "SewRijbewijs"; // max 11 chars, no spaces

/**
 * إرسال SMS تحذيري للمشترك الذي تجاوز حد محاولات Screenshot
 */
export async function sendScreenshotWarningSMS(
  phone: string,
  userName: string,
  attemptCount: number
): Promise<{ success: boolean; error?: string }> {
  if (!accountSid || !authToken) {
    console.warn("⚠️ Twilio credentials not configured. Skipping SMS.");
    return { success: false, error: "Twilio not configured" };
  }

  // تنظيف رقم الهاتف وتحويله لصيغة دولية
  const cleanPhone = formatPhoneNumber(phone);
  if (!cleanPhone) {
    return { success: false, error: "Invalid phone number" };
  }

  const client = twilio(accountSid, authToken);

  // نص الرسالة بالعربية والهولندية
  const message = [
    `⚠️ Sewar RijbewijsOnline`,
    ``,
    `Beste ${userName},`,
    ``,
    `We hebben ${attemptCount} schermafbeeldingspogingen gedetecteerd op uw account.`,
    ``,
    `Het kopiëren van beschermde inhoud is niet toegestaan en kan leiden tot opschorting van uw abonnement.`,
    ``,
    `عزيزي ${userName}،`,
    `تم رصد ${attemptCount} محاولة لأخذ لقطات شاشة على حسابك.`,
    `نسخ المحتوى المحمي غير مسموح به وقد يؤدي إلى إيقاف اشتراكك.`,
    ``,
    `Sewar RijbewijsOnline`,
  ].join("\n");

  try {
    const result = await client.messages.create({
      body: message,
      from: senderName,
      to: cleanPhone,
    });

    console.log(`✅ SMS sent to ${cleanPhone} - SID: ${result.sid}`);
    return { success: true };
  } catch (error: any) {
    console.error(`❌ SMS failed to ${cleanPhone}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * تحويل رقم الهاتف لصيغة E.164 الدولية
 * يدعم الأرقام البلجيكية والدولية
 */
function formatPhoneNumber(phone: string): string | null {
  if (!phone) return null;

  // إزالة المسافات والشرطات والأقواس
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, "");

  // إذا كان يبدأ بـ 0 (رقم محلي بلجيكي) → حوله لـ +32
  if (cleaned.startsWith("0") && !cleaned.startsWith("00")) {
    cleaned = "+32" + cleaned.slice(1);
  }

  // إذا كان يبدأ بـ 00 → حوله لـ +
  if (cleaned.startsWith("00")) {
    cleaned = "+" + cleaned.slice(2);
  }

  // إذا لم يبدأ بـ + → أضف +32 (افتراضي بلجيكا)
  if (!cleaned.startsWith("+")) {
    cleaned = "+32" + cleaned;
  }

  // تحقق من الطول المعقول (7-15 رقم بعد كود الدولة)
  const digits = cleaned.replace("+", "");
  if (digits.length < 7 || digits.length > 15) {
    console.warn(`⚠️ Phone number seems invalid: ${phone} → ${cleaned}`);
    return null;
  }

  return cleaned;
}
