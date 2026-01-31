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
  const admin = initFirebaseAdmin();
  if (!admin) return { ok: false, reason: "FCM not configured" };

  const tokensDocs = await NotificationToken.find({ user: userId });
  const tokens = tokensDocs.map((t) => t.token).filter(Boolean);

  if (!tokens.length) return { ok: false, reason: "No device tokens" };

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

  const resp = await admin.messaging().sendEachForMulticast(message);

  // Clean up invalid tokens
  const invalid = [];
  resp.responses.forEach((r, idx) => {
    if (!r.success) {
      const code = r.error?.code || "";
      if (
        code.includes("registration-token-not-registered") ||
        code.includes("invalid-registration-token")
      ) {
        invalid.push(tokens[idx]);
      }
    }
  });

  if (invalid.length) {
    await NotificationToken.deleteMany({ token: { $in: invalid } });
  }

  return {
    ok: true,
    successCount: resp.successCount,
    failureCount: resp.failureCount,
    removedInvalidCount: invalid.length,
  };
};
