// eslint-disable-next-line no-undef
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
// eslint-disable-next-line no-undef
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

// Initialize Firebase in service worker
firebase.initializeApp({
  apiKey: "AIzaSyCKXrwHwexCQwMnSoHKL0ED2DwHTpcqchA",
  authDomain: "restaurant-management-4cd3e.firebaseapp.com",
  projectId: "restaurant-management-4cd3e",
  storageBucket: "restaurant-management-4cd3e.firebasestorage.app",
  messagingSenderId: "667580011318",
  appId: "1:667580011318:web:4f55dfec3adce1920d1997",
});

// Get messaging instance
const messaging = firebase.messaging();

// Handle background notifications
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);

  const notificationTitle = payload.notification?.title || "Notification";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new notification",
    icon: "/restaurant-icon.png",
    badge: "/restaurant-icon.png",
    tag: "restaurant-notification",
    requireInteraction: false,
  };

  // Show notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("[firebase-messaging-sw.js] Notification clicked", event);
  event.notification.close();

  // Open the app or focus the window
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === "/" && "focus" in client) {
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow("/");
      }
    })
  );
});
