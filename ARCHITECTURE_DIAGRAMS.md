# Push Notifications Architecture

## System Overview

```
┌────────────────────────────────────────────────────────────────────────────┐
│                          RESTAURANT MANAGEMENT APP                         │
└────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────┐    ┌──────────────────────────────────┐
│       CUSTOMER BROWSER/APP          │    │      ADMIN DASHBOARD             │
├─────────────────────────────────────┤    ├──────────────────────────────────┤
│                                     │    │                                  │
│  ┌──────────────────────────────┐   │    │  ┌──────────────────────────┐   │
│  │  App Loaded (App.jsx)        │   │    │  │ Admin Panel              │   │
│  │                              │   │    │  │ - View Orders            │   │
│  │  1. useNotifications() runs  │   │    │  │ - Change Status          │   │
│  │  2. Requests permission      │   │    │  │   to "Ready to Serve"    │   │
│  │  3. Gets FCM token          │   │    │  └──────────────────────────┘   │
│  │  4. Sends to backend         │   │    │           │                      │
│  └────────────┬─────────────────┘   │    │           │                      │
│               │                      │    │           │ Triggers             │
│  ┌────────────▼─────────────────┐   │    │           │ Notification         │
│  │  Service Worker Running      │   │    │           │                      │
│  │  (firebase-messaging-sw.js)  │   │    │           │                      │
│  │  - Listens for background   │   │    │           │                      │
│  │    notifications            │   │    │           │                      │
│  │  - Shows notifications      │   │    │           │                      │
│  │  - Handles clicks           │   │    │           │                      │
│  └──────────────────────────────┘   │    └───────────┼──────────────────────┘
│               ▲                       │                │
│               │ Foreground            │                │
│               │ Notifications         │                │
│  ┌────────────┴─────────────────┐   │    ┌───────────▼──────────────────┐
│  │  Toast Notification UI       │   │    │  Backend (Node.js)           │
│  │  (React Hot Toast)           │   │    ├──────────────────────────────┤
│  │  - Shows notifications       │   │    │                              │
│  │  - User friendly messages    │   │    │  API Routes                  │
│  │  - Auto-dismiss              │   │    │  ├─ POST /api/order/:id      │
│  └──────────────────────────────┘   │    │  │   (update status)         │
│                                     │    │  └─ POST /api/notification/  │
│  ┌──────────────────────────────┐   │    │      token (save token)     │
│  │  Local Storage               │   │    │                              │
│  │  - Stores JWT token          │   │    │  Controllers                 │
│  │  - Stores user info          │   │    │  ├─ orderController         │
│  └──────────────────────────────┘   │    │  │   (updateOrderStatus)    │
│                                     │    │  ├─ notificationController  │
└─────────────────────────────────────┘    │  │   (saveFcmToken)         │
                │                           │  └─ Models                  │
                │                           │     ├─ User (fcmTokens[])   │
                │ HTTP/HTTPS                │     ├─ Order                │
                │ Requests & Responses       │     └─ Cart                │
                │                           │                              │
                │ API Calls:                 │  Utils                       │
                │ 1. POST /notification/     │  ├─ fcm.js                  │
                │    token (save token)      │  │  ├─ initFCM()           │
                │ 2. PATCH /order/:id        │  │  ├─ sendToUserTokens()  │
                │    (update status)         │  │  └─ sendOrderReady...() │
                │                           │  └─ cloudinary.js            │
                ▼                           │     db.js                     │
┌────────────────────────────────────┐    └──────────────────────────────┘
│    FIREBASE CLOUD MESSAGING        │              │
│    (FCM)                           │              │ Uses
│                                    │              │
│  - Receives message from backend   │              ▼
│  - Routes to registered devices    │    ┌──────────────────────────┐
│  - Manages subscriptions           │    │  Firebase Admin SDK      │
│  - Handles multicast delivery      │    ├──────────────────────────┤
└────────────┬───────────────────────┘    │                          │
             │                            │  - auth credentials      │
             │ Delivers                   │  - sendEachForMulticast()│
             │ Notifications              │  - Token validation      │
             │                            │  - Error handling        │
             ▼                            └──────────────────────────┘
┌────────────────────────────────────┐              │
│  DEVICE NOTIFICATION SYSTEMS       │              │
│                                    │              │ Manages
│  ┌──────────────────────────────┐  │              │
│  │ Web Notification API         │  │              ▼
│  │ (Browser notifications)      │  │    ┌──────────────────────────┐
│  └──────────────────────────────┘  │    │  MongoDB Database        │
│                                    │    ├──────────────────────────┤
│  ┌──────────────────────────────┐  │    │                          │
│  │ OS Notifications             │  │    │  Collections:            │
│  │ (Windows/Mac/Linux)          │  │    │  - users                 │
│  │ When browser is closed       │  │    │    └─ fcmTokens: []      │
│  └──────────────────────────────┘  │    │  - orders                │
│                                    │    │    └─ status field       │
│  ┌──────────────────────────────┐  │    │  - other collections     │
│  │ Phone Notifications          │  │    │                          │
│  │ (iOS Safari, Android)        │  │    └──────────────────────────┘
│  └──────────────────────────────┘  │
│                                    │
│  Shows: ✅ Order is ready!        │
│          Order #123456             │
│          is Ready To Serve          │
└────────────────────────────────────┘
```

## Data Flow: Order Ready Notification

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: USER LOGIN & REGISTRATION                             │
├─────────────────────────────────────────────────────────────────┤

User Browser                          Backend
    │                                    │
    ├─ User enters credentials          │
    │                                    │
    └─────────────────────────────────────→ POST /api/auth/login
                                         │
                                         ├─ Verify credentials
                                         │
                                         ├─ Generate JWT
                                         │
                                         └─────────────────────────┐
    ┌────────────────────────────────────────────────────────────┘
    │
    ├─ App mounts useNotifications() hook
    │
    ├─ Browser asks for notification permission
    │
    ├─ User clicks "Allow"
    │
    ├─ Service worker registers
    │
    ├─ Get FCM token from Firebase
    │
    └──────────────────────────────────────→ POST /api/notification/token
                                          {
                                            token: "fcm_token_xyz"
                                          }
                                           │
                                           ├─ Find user by JWT
                                           │
                                           ├─ user.fcmTokens.push(token)
                                           │
                                           └─ user.save()
                                           │
    ┌────────────────────────────────────────────────────────────┘
    │
    └─ Token saved! Ready to receive notifications


┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: USER PLACES ORDER                                      │
├─────────────────────────────────────────────────────────────────┤

    ├─ User adds items to cart
    │
    ├─ User clicks "Checkout" → "Place Order"
    │
    └─────────────────────────────────────→ POST /api/order
                                          {
                                            tableNumber: 5,
                                            items: [...],
                                            totalAmount: 500
                                          }
                                           │
                                           ├─ Create new order
                                           │
                                           ├─ Clear cart
                                           │
                                           └─ Save to database
                                           │
    ┌────────────────────────────────────────────────────────────┘
    │
    └─ Order created successfully


┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: ADMIN MARKS ORDER "READY TO SERVE"                    │
├─────────────────────────────────────────────────────────────────┤

Admin Browser                          Backend
    │                                    │
    ├─ Admin opens Orders page          │
    │                                    │
    ├─ Admin finds the order             │
    │                                    │
    ├─ Admin changes status dropdown     │
    │ from "Approved" to "Ready to Serve"│
    │                                    │
    └──────────────────────────────────→ PATCH /api/order/{orderId}
                                        {
                                          status: "Ready to Serve"
                                        }
                                         │
                                         ├─ Find order by ID
                                         │
                                         ├─ Check status changed
                                         │ from something else to
                                         │ "Ready to Serve"
                                         │
                                         ├─ Call sendOrderReadyNotification()
                                         │
                                         └─ Enter FCM utility...


┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: FCM UTILITY SENDS NOTIFICATION                         │
├─────────────────────────────────────────────────────────────────┤

Backend FCM Utility (fcm.js)
    │
    ├─ sendOrderReadyNotification(order)
    │
    ├─ Extract user ID from order
    │
    ├─ Call sendToUserTokens(userId, payload)
    │
    ├─ Query User document
    │
    ├─ Get all fcmTokens for this user
    │
    ├─ Build message object:
    │  {
    │    tokens: ["token1", "token2"],
    │    notification: {
    │      title: "✅ Your order is ready!",
    │      body: "Order #123456 is Ready To Serve"
    │    },
    │    data: {
    │      type: "ORDER_READY",
    │      orderId: "60d5ec49...",
    │      status: "Ready to Serve"
    │    }
    │  }
    │
    ├─ Call Firebase Admin SDK:
    │  admin.messaging().sendEachForMulticast(message)
    │
    └─────────────────────────────→ Firebase Cloud Messaging


┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: FIREBASE DELIVERS NOTIFICATION                         │
├─────────────────────────────────────────────────────────────────┤

Firebase Cloud Messaging
    │
    ├─ Validate message
    │
    ├─ For each token:
    │  ├─ Route to subscribed device
    │  ├─ Deliver notification
    │  └─ Confirm delivery
    │
    ├─ Check for invalid tokens
    │ (if token is registered-token-not-registered)
    │
    ├─ Return response with success/failure for each token
    │
    └──────────────────────────────→ Back to Backend


┌─────────────────────────────────────────────────────────────────┐
│ STEP 6: BACKEND CLEANUP (Invalid Tokens)                       │
├─────────────────────────────────────────────────────────────────┤

Backend FCM Utility
    │
    ├─ Check responses from Firebase
    │
    ├─ For each failed response:
    │  ├─ Check error code
    │  ├─ If "registration-token-not-registered"
    │  │  or "invalid-argument"
    │  ├─ Add to invalidTokens list
    │  │
    │  └─ Remove from user.fcmTokens
    │
    ├─ If any invalid tokens:
    │  ├─ user.fcmTokens = user.fcmTokens.filter(...)
    │  ├─ user.save()
    │  └─ Log cleanup
    │
    └─ Complete!


┌─────────────────────────────────────────────────────────────────┐
│ STEP 7: CUSTOMER RECEIVES NOTIFICATION                         │
├─────────────────────────────────────────────────────────────────┤

Customer Device                    Customer Browser
    │                                    │
    │ ◄──────────────────────────────────┤ Notification delivered
    │                                    │ to service worker
    │ Firebase Cloud Messaging           │
    │ sends notification                 │
    │                                    ├─ firebase-messaging-sw.js
    │                                    │  activated
    │                                    │
    │                                    ├─ Handles notification
    │                                    │
    │                                    ├─ Calls self.registration
    │                                    │  .showNotification()
    │                                    │
    ┌────────────────────────────────────┤
    │                                    │
    ▼                                    ▼
┌──────────────────────────┐   ┌──────────────────────────┐
│ Foreground (Tab Active)  │   │ Background/Closed Tab    │
│                          │   │                          │
│ App is open & visible    │   │ App is not visible or    │
│                          │   │ tab is closed            │
│ onMessage handler runs   │   │                          │
│ in App component         │   │ Service worker handles   │
│                          │   │ Shows system             │
│ Shows TOAST:             │   │ notification             │
│ ┌────────────────────┐   │   │                          │
│ │ ✅ Order Ready!    │   │   │ ┌────────────────────┐   │
│ │                    │   │   │ │ NOTIFICATION       │   │
│ │ Order #123456      │   │   │ │ ✅ Order Ready!    │   │
│ │ is Ready to Serve  │   │   │ │ Order #123456      │   │
│ │                    │   │   │ │ is Ready to Serve  │   │
│ │ [Click to dismiss] │   │   │ │                    │   │
│ └────────────────────┘   │   │ │ [Click here]       │   │
│                          │   │ └────────────────────┘   │
│ Auto-dismiss in 5 sec    │   │                          │
└──────────────────────────┘   └──────────────────────────┘
           │                              │
           │ User sees notification       │ User sees system
           │ and responds immediately     │ notification even
           │                              │ if browser closed
           │                              │
           └──────────────┬───────────────┘
                          │
                          ▼
                ┌──────────────────────┐
                │ User Clicks          │
                │ Notification         │
                └──────────────────────┘
                          │
                          │ Service worker notificationclick
                          │ event fires
                          │
                          ├─ Close notification
                          │
                          ├─ Find open window/tab
                          │
                          ├─ Focus window or
                          │  Open app at "/"
                          │
                          ▼
                ┌──────────────────────┐
                │ ✅ App Opens/Focuses │
                │ User returns to app  │
                └──────────────────────┘

```

## Technology Stack

```
┌───────────────────────────────────────────────────────────────┐
│                    FRONTEND STACK                             │
├───────────────────────────────────────────────────────────────┤
│ • React 19                   (UI Framework)                   │
│ • Vite                       (Build tool)                     │
│ • Firebase JS SDK            (Messaging client)               │
│ • React Hot Toast            (Toast notifications)            │
│ • Axios                      (API calls)                      │
│ • React Router               (Navigation)                     │
│ • Service Worker API         (Background notifications)       │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│                    BACKEND STACK                              │
├───────────────────────────────────────────────────────────────┤
│ • Node.js                    (Runtime)                        │
│ • Express                    (Web framework)                  │
│ • Firebase Admin SDK         (Server-side messaging)          │
│ • MongoDB                    (Database)                       │
│ • Mongoose                   (Database ODM)                   │
│ • Socket.io                  (Real-time updates)              │
│ • JWT                        (Authentication)                 │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                           │
├───────────────────────────────────────────────────────────────┤
│ • Firebase Cloud Messaging   (Notification delivery)          │
│ • Firebase Console           (Configuration & monitoring)     │
│ • Google Cloud               (Infrastructure)                 │
└───────────────────────────────────────────────────────────────┘
```

## Component Interactions

```
App.jsx (Main Component)
    │
    ├─ useNotifications() hook
    │   │
    │   ├─ setupMessaging() [firebase.js]
    │   │   ├─ Requests notification permission
    │   │   ├─ Registers service worker
    │   │   └─ Setup onMessage listener
    │   │
    │   └─ initializeNotifications() [notificationService.js]
    │       ├─ getFCMToken()
    │       └─ registerFCMToken()
    │
    ├─ Navbar/Routes
    │
    └─ Toast Provider (React Hot Toast)
        └─ Displays notifications

Order Component (Admin)
    │
    ├─ Calls updateOrderStatus()
    │   │
    │   ├─ PATCH /api/order/:id
    │   │
    │   └─ Backend:
    │       ├─ Updates order
    │       ├─ Detects status change
    │       └─ Calls sendOrderReadyNotification()
    │
    └─ Emits Socket.io event (real-time update)
```

---

This architecture ensures:
✅ Real-time notifications via Firebase
✅ Background delivery via service workers
✅ Graceful degradation if features unavailable
✅ Automatic token management
✅ Error resilience and recovery
