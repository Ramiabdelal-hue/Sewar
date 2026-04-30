/**
 * Email Service — re-export من lib/email.ts
 * نقطة دخول موحدة لكل عمليات الإيميل
 */
export {
  sendScreenshotWarningEmail,
  sendSuspensionEmail,
  sendSubscriptionConfirmationEmail,
} from "@/lib/email";
