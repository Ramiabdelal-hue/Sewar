/**
 * Subscription Guard
 * يتحقق من أن المستخدم لديه اشتراك نشط
 */
import { SessionUser } from "@/lib/auth/session";

export class SubscriptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SubscriptionError";
  }
}

/**
 * يرمي خطأ إذا لم يكن للمستخدم اشتراك نشط
 */
export function requireSubscription(user: SessionUser): void {
  const now = new Date();
  const hasActiveSub = user.subscriptions.some(
    (s) => s.isActive && new Date(s.expiryDate) > now
  );
  const primaryActive = new Date(user.expiryDate) > now;

  if (!hasActiveSub && !primaryActive) {
    throw new SubscriptionError("لا يوجد اشتراك نشط");
  }
}

/**
 * يتحقق من أن المستخدم مشترك في فئة معينة (A, B, C)
 */
export function requireCategorySubscription(user: SessionUser, category: string): void {
  const now = new Date();
  const hasCategorySub = user.subscriptions.some(
    (s) =>
      s.isActive &&
      new Date(s.expiryDate) > now &&
      s.category.toUpperCase() === category.toUpperCase()
  );

  if (!hasCategorySub) {
    throw new SubscriptionError(`لا يوجد اشتراك نشط للفئة ${category}`);
  }
}

/**
 * يتحقق من نوع الاشتراك (theorie, examen, praktijk)
 */
export function requireSubscriptionType(user: SessionUser, type: string): void {
  const now = new Date();
  const hasTypeSub = user.subscriptions.some(
    (s) =>
      s.isActive &&
      new Date(s.expiryDate) > now &&
      s.subscriptionType === type
  );

  if (!hasTypeSub) {
    throw new SubscriptionError(`لا يوجد اشتراك من نوع ${type}`);
  }
}
