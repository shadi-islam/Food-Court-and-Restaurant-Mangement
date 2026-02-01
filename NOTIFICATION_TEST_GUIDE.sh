#!/bin/bash
# Notification System Testing Script

echo "======================================"
echo "🔧 Restaurant Notification Test Suite"
echo "======================================"
echo ""

echo "📋 Step 1: Check Backend Logs"
echo "================================"
echo "To check if Firebase Admin is initialized:"
echo "1. Look for '[FirebaseAdmin]' messages in backend server logs"
echo "2. Should see: '[FirebaseAdmin] ✅ Firebase Admin SDK initialized successfully'"
echo "3. If missing, check: backend/config/firebaseServiceAccount.json exists"
echo ""

echo "📋 Step 2: Check Frontend Token Registration (In Browser Console)"
echo "================================"
echo "Run these commands in browser DevTools console while logged in:"
echo ""
echo '1. Check if tokens are being registered:'
echo '   - Filter console for: "[AppContext]" and "[FCM]"'
echo '   - Should see: "[FCM] ✅ Token obtained successfully: ..."'
echo '   - Then: "[AppContext] ✅ Token registered successfully: ..."'
echo ""
echo '2. Check service worker status:'
echo '   navigator.serviceWorker.getRegistrations().then(r => console.log("SWs:", r))'
echo ""
echo '3. Check notification permission:'
echo '   Notification.permission'
echo '   (should return: "granted")'
echo ""

echo "📋 Step 3: Check Database for Stored Tokens"
echo "================================"
echo "In MongoDB Atlas or local MongoDB client:"
echo ""
echo "use restaurant_database_name"
echo "db.notificationtokens.find().pretty()"
echo ""
echo "Expected output:"
echo '{
  "_id": ObjectId(...),
  "user": ObjectId("user_id_here"),
  "token": "long_fcm_token_string",
  "platform": "web",
  "lastSeenAt": ISODate(...),
  "createdAt": ISODate(...),
  "updatedAt": ISODate(...)
}'
echo ""

echo "📋 Step 4: Send Test Notification from Admin"
echo "================================"
echo "1. Login as admin"
echo "2. Go to /admin/orders"
echo "3. Find an order and expand it"
echo "4. Scroll to 'Custom Notification' section"
echo "5. Enter a test message"
echo "6. Click 'Send Update'"
echo ""
echo "Watch the browser console for:"
echo "  - '[NotificationController]' messages from backend logs"
echo "  - Look for: '[NotificationService] ✅ Notification sent successfully'"
echo ""

echo "📋 Step 5: Common Issues & Fixes"
echo "================================"
echo ""
echo "❌ 'No device tokens' error"
echo "   → Make sure user is LOGGED IN before notification permission is requested"
echo "   → Hard refresh (Ctrl+Shift+R) to reset service worker"
echo ""
echo "❌ 'FCM not configured' error"
echo "   → Check backend/config/firebaseServiceAccount.json EXISTS"
echo "   → Check .env has: FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebaseServiceAccount.json"
echo "   → Restart backend server"
echo ""
echo "❌ Notification appears in DevTools but not on screen"
echo "   → Browser tab needs focus for desktop notifications"
echo "   → Click on the browser window"
echo ""
echo "❌ Service worker not registering"
echo "   → Ensure firebase-messaging-sw.js is in public/ folder"
echo "   → Check main.jsx has: navigator.serviceWorker.register('./firebase-messaging-sw.js')"
echo ""

echo "📋 Step 6: Debug Full Flow"
echo "================================"
echo "Open browser console with timestamps and follow this flow:"
echo ""
echo "1. **User Login:**"
echo "   Filter for: [AppContext] Skipping FCM setup: no user"
echo "   Then after login: [AppContext] Setting up FCM for user:"
echo ""
echo "2. **Token Request:**"
echo "   Filter for: [FCM]"
echo "   Should see:"
echo "   - [FCM] Starting token request..."
echo "   - [FCM] Browser support: true"
echo "   - [FCM] Messaging instance: true"
echo "   - [FCM] Requesting notification permission..."
echo "   - [FCM] Notification permission: granted"
echo "   - [FCM] ✅ Token obtained successfully: ..."
echo ""
echo "3. **Token Registration:**"
echo "   Should see:"
echo "   - [AppContext] Registering token on backend..."
echo "   - [AppContext] ✅ Token registered successfully: {success: true, ...}"
echo ""
echo "4. **Send Notification (Admin Side):**"
echo "   Server logs should show:"
echo "   - [NotificationController] Send notification request:"
echo "   - [NotificationController] Order found, user:"
echo "   - [NotificationService] Sending notification to user:"
echo "   - [NotificationService] Found tokens: 1"
echo "   - [NotificationService] Valid tokens: 1"
echo "   - [NotificationService] Sending message via FCM to 1 token(s)..."
echo "   - [NotificationService] ✅ Notification sent successfully"
echo ""
echo "5. **Receive Notification (User Side):**
echo "   Browser console (with focus) should show:"
echo "   - [FCM] 📬 Foreground message received: {...}"
echo "   - Notification toast appears on screen"
echo ""
echo "   If browser not in focus, service worker logs:"
echo "   - [ServiceWorker] 📬 Background message received:"
echo "   - [ServiceWorker] ✅ Notification displayed"
echo ""

echo "======================================"
echo "✅ Testing complete!"
echo "======================================"
