import admin from "firebase-admin";
import fs from "fs";
import path from "path";

// Initialize Firebase Admin SDK for FCM.
//
// Prefer setting FIREBASE_SERVICE_ACCOUNT_PATH in backend/.env
// If not set, it will try ./config/firebaseServiceAccount.json (bundled in this zip).
export const initFirebaseAdmin = () => {
  if (admin.apps.length) return admin;

  const configuredPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const defaultPath = new URL("./firebaseServiceAccount.json", import.meta.url).pathname;
  const serviceAccountPath = configuredPath
    ? path.resolve(configuredPath)
    : defaultPath;

  if (!fs.existsSync(serviceAccountPath)) {
    console.warn(
      `[FCM] Service account file not found at ${serviceAccountPath}. Notifications will be disabled.`
    );
    return null;
  }

  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("[FCM] Firebase Admin initialized");
  return admin;
};

export default admin;
