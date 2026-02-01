# Notification Debug Guide

## Problem
Custom notifications sent from admin are not appearing to users.

## Diagnostic Checklist

### 1. Frontend Token Registration
**Check if tokens are being registered:**

1. Open your app in browser
2. Go to **DevTools → Application → Service Workers**
   - Confirm `firebase-messaging-sw.js` is registered ✓
   
3. Go to **DevTools → Console**
   - Look for any FCM-related errors
   - Check if `requestAndGetFcmToken()` is being called

4. Open **DevTools → Application → IndexedDB → firebaseLocalStorageDb**
   - Should see `firebase:authUser:...` entries if firebase is initialized

5. **Check notification permission:**
   - In DevTools, go to **Application → Manifest**
   - Check Site Settings → Notifications (should be "Allow")
   - If blocked, click the lock icon and allow notifications

### 2. Backend Verification
**Check if FCM is initialized properly:**

```bash
# In backend folder
npm start
# Look for: "[FCM] Firebase Admin initialized"
# If you see: "[FCM] Service account file not found..." → Firebase SDK not configured
```

**Check if tokens are being saved to database:**

```javascript
// Run this in MongoDB Atlas or local mongo client
db.notificationtokens.find().pretty()
// Should show documents with user IDs, tokens, and platform='web'
```

### 3. Send Test Notification from Admin
1. Login to admin panel
2. Go to **Orders** page
3. Click to expand an order
4. Scroll to **Custom Notification** section
5. Enter message and click **"Send Update"**
6. Check browser console for response

### 4. Verify Notification API Response
**Check network tab:**
1. Open **DevTools → Network** tab
2. Filter for: `send/order` 
3. Click to send notification
4. Check the response:
   - Should return: `{ success: true, message: "Notification sent", result: { ok: true, successCount: 1, ... } }`
   - If `ok: false`, check the reason (e.g., "No device tokens")

### 5. Check for Common Issues

#### Issue A: "No device tokens"
- **Cause:** Token not registered or user not logged in
- **Fix:** 
  1. Make sure user is logged in before service worker initializes
  2. Check DevTools Console → look for token registration logs
  3. Manually trigger: `await requestAndGetFcmToken()` in console

#### Issue B: Firebase SDK initialization failed
- **Cause:** Service account JSON file missing or malformed
- **Fix:**
  1. Verify `backend/config/firebaseServiceAccount.json` exists
  2. Check `.env` has `FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebaseServiceAccount.json`
  3. Restart backend server

#### Issue C: Tokens in database but still "No device tokens"
- **Cause:** userId mismatch or wrong user being queried
- **Fix:**
  1. In MongoDB, verify token document has correct `user` ObjectId
  2. Verify `order.user._id` matches the token's `user` field

#### Issue D: Notification sent but not appearing
- **Cause:** Service worker not handling background messages properly
- **Fix:**
  1. Check `firebase-messaging-sw.js` is at `public/` folder
  2. Verify service worker shows in DevTools → Application → Service Workers
  3. Try restarting app with hard refresh (Ctrl+Shift+R)

### 6. Enhanced Logging Steps

**Add logging to AppContext (frontend):**
```javascript
// In AppContext.jsx, find the FCM setup effect
useEffect(() => {
  const setup = async () => {
    if (!user) {
      console.log("[FCM] Skipping: no user");
      return;
    }
    try {
      console.log("[FCM] Requesting token for user:", user._id);
      const token = await requestAndGetFcmToken();
      console.log("[FCM] Token received:", token);
      
      if (!token) {
        console.warn("[FCM] Token is null or empty");
        return;
      }
      
      const resp = await axios.post("/api/notification/register-token", {
        token,
        platform: "web",
      });
      console.log("[FCM] Registration response:", resp.data);
    } catch (err) {
      console.error("[FCM] Setup failed:", err);
    }
  };
  setup();
}, [user]);
```

**Add logging to firebase.js:**
```javascript
export async function requestAndGetFcmToken() {
  console.log("[Firebase] Getting FCM token...");
  const supported = await isSupported();
  console.log("[Firebase] Supported:", supported);
  if (!supported) {
    console.warn("[Firebase] Push notifications not supported");
    return null;
  }
  
  const messaging = await initMessaging();
  console.log("[Firebase] Messaging initialized:", !!messaging);
  if (!messaging) return null;

  try {
    const permission = await Notification.requestPermission();
    console.log("[Firebase] Notification permission:", permission);
    if (permission !== "granted") return null;

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    console.log("[Firebase] VAPID key configured:", !!vapidKey);
    if (!vapidKey) {
      console.warn("[Firebase] Missing VITE_FIREBASE_VAPID_KEY");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: await navigator.serviceWorker.ready,
    });
    console.log("[Firebase] Token obtained:", token);
    return token;
  } catch (error) {
    console.error("[Firebase] Token request failed:", error);
    return null;
  }
}
```

### 7. Quick Test Commands

**In browser console, test FCM directly:**
```javascript
// Check if service worker is active
navigator.serviceWorker.ready.then(reg => console.log("SW active:", reg))

// Manually request token
const { requestAndGetFcmToken } = await import('/src/firebase.js')
const token = await requestAndGetFcmToken()
console.log("Token:", token)

// Test sending a notification (backend only)
// The backend would do: admin.messaging().sendEachForMulticast(...)
```

## Step-by-Step Debugging Path

1. **Backend working?** → Check MongoDB for stored tokens
2. **Tokens exist?** → Check admin panel sends request successfully
3. **Request succeeds?** → Check Firebase response (successCount > 0?)
4. **Firebase fails?** → Check backend logs for `[FCM]` messages
5. **Everything passes?** → Check if notifications appear in browser (may need click focus)

## Common Solutions

| Symptom | Solution |
|---------|----------|
| "No device tokens" error | Ensure user logs in before notifications enabled |
| Notification sent but not visible | Click the browser window to bring focus |
| Firebase not initialized | Check firebaseServiceAccount.json exists |
| Token in DB but not found | Verify user._id matches order.user._id |
| Service worker not registering | Hard refresh browser (Ctrl+Shift+R) |

