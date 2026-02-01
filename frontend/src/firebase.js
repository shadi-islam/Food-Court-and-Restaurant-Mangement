import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

// Firebase web config (set these in frontend .env)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseApp = initializeApp(firebaseConfig);

export async function initMessaging() {
  const supported = await isSupported();
  if (!supported) return null;
  return getMessaging(firebaseApp);
}

export async function requestAndGetFcmToken() {
  console.log("[FCM] Starting token request...");
  
  try {
    const supported = await isSupported();
    console.log("[FCM] Browser support:", supported);
    if (!supported) {
      console.warn("[FCM] Push notifications not supported in this browser");
      return null;
    }

    const messaging = await initMessaging();
    console.log("[FCM] Messaging instance:", !!messaging);
    if (!messaging) {
      console.warn("[FCM] Failed to initialize messaging");
      return null;
    }

    console.log("[FCM] Requesting notification permission...");
    const permission = await Notification.requestPermission();
    console.log("[FCM] Notification permission:", permission);
    if (permission !== "granted") {
      console.warn("[FCM] Notification permission denied by user");
      return null;
    }

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    console.log("[FCM] VAPID key present:", !!vapidKey);
    if (!vapidKey) {
      console.error("[FCM] Missing VITE_FIREBASE_VAPID_KEY in .env");
      return null;
    }

    console.log("[FCM] Waiting for service worker...");
    const swReg = await navigator.serviceWorker.ready;
    console.log("[FCM] Service worker ready:", !!swReg);

    console.log("[FCM] Getting token from Firebase...");
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: swReg,
    });

    console.log("[FCM] ✅ Token obtained successfully:", token);
    return token;
  } catch (error) {
    console.error("[FCM] ❌ Token request error:", error);
    return null;
  }
}

// Foreground message listener
export async function listenToForegroundMessages(onNotify) {
  console.log("[FCM] Setting up foreground message listener...");
  const messaging = await initMessaging();
  if (!messaging) {
    console.warn("[FCM] Cannot set up listener: messaging not initialized");
    return () => {};
  }

  const unsubscribe = onMessage(messaging, (payload) => {
    console.log("[FCM] 📬 Foreground message received:", payload);
    onNotify?.(payload);
  });

  console.log("[FCM] ✅ Foreground listener active");
  return unsubscribe;
}
