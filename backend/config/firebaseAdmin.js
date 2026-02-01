import admin from "firebase-admin";
import fs from "fs";
import path from "path";

// Initialize Firebase Admin SDK for FCM.
//
// Prefer setting FIREBASE_SERVICE_ACCOUNT_PATH in backend/.env
// If not set, it will try ./config/firebaseServiceAccount.json (bundled in this zip).
export const initFirebaseAdmin = () => {
  if (admin.apps.length) {
    console.log("[FirebaseAdmin] Already initialized, returning existing instance");
    return admin;
  }

  const configuredPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const defaultPath = new URL("./firebaseServiceAccount.json", import.meta.url).pathname;
  const serviceAccountPath = configuredPath
    ? path.resolve(configuredPath)
    : defaultPath;

  console.log("[FirebaseAdmin] Service account path:", serviceAccountPath);

  if (!fs.existsSync(serviceAccountPath)) {
    console.error(
      `[FirebaseAdmin] ❌ Service account file NOT FOUND at ${serviceAccountPath}`
    );
    console.warn(`[FirebaseAdmin] Notifications will be DISABLED`);
    console.log(`[FirebaseAdmin] Please ensure firebaseServiceAccount.json exists`);
    return null;
  }

  console.log("[FirebaseAdmin] ✅ Service account file found, initializing...");

  try {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
    console.log("[FirebaseAdmin] Service account loaded, project ID:", serviceAccount.project_id);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("[FirebaseAdmin] ✅ Firebase Admin SDK initialized successfully");
    return admin;
  } catch (error) {
    console.error("[FirebaseAdmin] ❌ Failed to initialize Firebase Admin:", error);
    return null;
  }
};

export default admin;
