// eslint-disable-next-line no-undef
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
// eslint-disable-next-line no-undef
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

console.log("[ServiceWorker] Firebase Messaging Service Worker loaded");

// Initialize Firebase in service worker
firebase.initializeApp({
  apiKey: "AIzaSyCKXrwHwexCQwMnSoHKL0ED2DwHTpcqchA",
  authDomain: "restaurant-management-4cd3e.firebaseapp.com",
  projectId: "restaurant-management-4cd3e",
  storageBucket: "restaurant-management-4cd3e.firebasestorage.app",
  messagingSenderId: "667580011318",
  appId: "1:667580011318:web:4f55dfec3adce1920d1997",
});

console.log("[ServiceWorker] Firebase initialized");

// Get messaging instance
const messaging = firebase.messaging();

console.log("[ServiceWorker] Messaging instance created");

// Handle background notifications
messaging.onBackgroundMessage((payload) => {
  console.log("[ServiceWorker] 📬 Background message received:", {
    title: payload.notification?.title,
    body: payload.notification?.body,
    data: payload.data,
  });

  const notificationTitle = payload.notification?.title || "Notification";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new notification",
    icon: "/restaurant-icon.png",
    badge: "/restaurant-icon.png",
    tag: "restaurant-notification",
    requireInteraction: false,
    data: payload.data || {},
  };

  // Show notification
  self.registration.showNotification(notificationTitle, notificationOptions);
  console.log("[ServiceWorker] ✅ Notification displayed");
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("[ServiceWorker] 🖱️ Notification clicked:", event.notification.tag);
  event.notification.close();

  // Open the app or focus the window
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      console.log("[ServiceWorker] Found', clientList.length, 'windows");
      
      // Check if there's already a window open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === "/" && "focus" in client) {
          console.log("[ServiceWorker] Focusing existing window");
          return client.focus();
        }
      }
      
      // If no window is open, open a new one
      if (clients.openWindow) {
        console.log("[ServiceWorker] Opening new window");
        return clients.openWindow("/");
      }
    })
  );
});
