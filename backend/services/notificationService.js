import NotificationToken from "../models/notificationTokenModel.js";
import { initFirebaseAdmin } from "../config/firebaseAdmin.js";

// Send an FCM push notification to all registered tokens for a user.
// Works for web (desktop) and mobile if those apps register their FCM tokens.
export const sendNotificationToUser = async ({
  userId,
  title,
  body,
  data = {},
}) => {
  console.log("[NotificationService] Sending notification to user:", userId);
  
  const admin = initFirebaseAdmin();
  if (!admin) {
    console.error("[NotificationService] ❌ FCM not configured - Firebase Admin not initialized");
    return { ok: false, reason: "FCM not configured" };
  }

  console.log("[NotificationService] Looking for tokens for user:", userId);
  const tokensDocs = await NotificationToken.find({ user: userId });
  console.log("[NotificationService] Found tokens:", tokensDocs.length);
  
  const tokens = tokensDocs.map((t) => t.token).filter(Boolean);
  console.log("[NotificationService] Valid tokens:", tokens.length);

  if (!tokens.length) {
    console.warn("[NotificationService] ❌ No device tokens found for user:", userId);
    console.log("[NotificationService] All tokens in DB:", await NotificationToken.find().lean());
    return { ok: false, reason: "No device tokens" };
  }

  const message = {
    tokens,
    notification: {
      title,
      body,
    },
    data: Object.fromEntries(
      Object.entries(data).map(([k, v]) => [String(k), String(v)])
    ),
  };

  console.log("[NotificationService] Sending message via FCM to", tokens.length, 'token(s)...');
  const resp = await admin.messaging().sendEachForMulticast(message);

  console.log("[NotificationService] FCM response:", {
    successCount: resp.successCount,
    failureCount: resp.failureCount,
    responses: resp.responses.map(r => ({ success: r.success, code: r.error?.code }))
  });

  // Clean up invalid tokens
  const invalid = [];
  resp.responses.forEach((r, idx) => {
    if (!r.success) {
      const code = r.error?.code || "";
      if (
        code.includes("registration-token-not-registered") ||
        code.includes("invalid-registration-token")
      ) {
        console.warn("[NotificationService] Removing invalid token:", tokens[idx]);
        invalid.push(tokens[idx]);
      }
    }
  });

  if (invalid.length) {
    console.log("[NotificationService] Cleaning up", invalid.length, 'invalid token(s)');
    await NotificationToken.deleteMany({ token: { $in: invalid } });
  }

  console.log("[NotificationService] ✅ Notification sent successfully");
  return {
    ok: true,
    successCount: resp.successCount,
    failureCount: resp.failureCount,
    removedInvalidCount: invalid.length,
  };
};
