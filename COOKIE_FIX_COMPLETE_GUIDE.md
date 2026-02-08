# Authentication Cookie Fix - Complete Implementation Guide

## 🎯 What Was Fixed

Your authentication cookies weren't being sent from the backend to the frontend because of:
1. Missing `path: "/"` in cookie options
2. CORS not properly configured for credentials
3. Inconsistent `secure` and `sameSite` settings between login endpoints
4. No request logging to debug issues

## ✅ Changes Made

### 1. **Backend Cookie Configuration** (`backend/controllers/authController.js`)
```javascript
// ALL login endpoints now use:
const cookieOptions = {
  httpOnly: true,      // Prevent JavaScript access
  secure: true,        // CRITICAL: Required for sameSite: "none"
  sameSite: "none",    // CRITICAL: Allow cross-site cookie sharing
  path: "/",           // CRITICAL: Make cookie available to all routes
  maxAge: 24 * 60 * 60 * 1000,
};
res.cookie("token", token, cookieOptions);
```

### 2. **Backend CORS Configuration** (`backend/index.js`)
```javascript
// Now uses dynamic origin checking with credentials enabled
cors({
  credentials: true,   // CRITICAL: Allow credentials
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
})
```

### 3. **Frontend Axios Configuration** (`frontend/src/context/AppContext.jsx`)
```javascript
axios.defaults.baseURL = "https://food-court-and-restaurant-backend.onrender.com";
axios.defaults.withCredentials = true;  // Already configured ✓
```

## 📋 Deployment Checklist

### Step 1: Verify Environment Variables on Render
Make sure your backend has these set:
```
NODE_ENV=production
JWT_SECRET=<your_secret>
ADMIN_EMAIL=<email>
ADMIN_PASSWORD=<password>
MONGO_URI=<connection_string>
```

### Step 2: Deploy Backend Code
```bash
git add backend/
git commit -m "Fix: Complete authentication cookie implementation for cross-domain"
git push origin main
```

### Step 3: Verify Deployment
- Dashboard → Your Backend Service → Logs
- Wait for "Build succeeded" message
- Should show: `[CORS] Configured for cross-domain cookie sharing`

### Step 4: Test Admin Login
```
URL: https://food-court-and-restaurant-mangement-1.onrender.com/admin/login
Email: [Your ADMIN_EMAIL]
Password: [Your ADMIN_PASSWORD]
```

### Step 5: Check Browser DevTools
```
1. Open DevTools (F12)
2. Login to admin panel
3. Check Network tab:
   - Click on admin login POST request
   - Response Headers should include: Set-Cookie: token=...
   - Cookie should have: Path=/; Secure; SameSite=None
4. Check Application tab:
   - Cookies section
   - Should see "token" cookie for the backend domain
5. Check Console for logs:
   - [adminLogin] Admin authenticated
   - [adminLogin] Setting cookie with options
   - [adminLogin] Cookie set successfully
```

## 🔍 Debug Logging

The backend now logs cookie operations:

### In Terminal (Render Logs):
```
[CORS] Configured for cross-domain cookie sharing
[REQUEST] POST /api/auth/admin/login - Cookie: ✗ Missing, Origin: https://food-court-and-restaurant-mangement-1.onrender.com
[adminLogin] Admin login attempt for email: admin@example.com
[adminLogin] Admin authenticated: admin@example.com
[adminLogin] Setting cookie with options: {secure: true, sameSite: "none", httpOnly: true, path: "/"}
[adminLogin] Cookie set successfully for: admin@example.com
[REQUEST] GET /api/config/branding - Cookie: ✓ Present, Origin: https://food-court-and-restaurant-mangement-1.onrender.com
[protect] Checking auth - Token present: true
```

### What Each Log Means:
- `Cookie: ✓ Present` - Browser sent the cookie ✓
- `Token present: true` - Middleware found the token ✓
- `Admin authenticated` - Credentials matched ✓

## ⚠️ Common Issues & Solutions

### Issue: "Token present: false" after login
**Solution:**
1. Check Response Headers in Network tab - do you see `Set-Cookie`?
2. If no `Set-Cookie` header:
   - Backend didn't receive the request (check CORS)
   - Cookie wasn't set on response (check logs)
3. If `Set-Cookie` exists but cookie still missing:
   - Check cookie attributes: should be `Secure; SameSite=None`
   - Clear all cookies and try again
   - Check if domain matches

### Issue: "CORS not allowed" error in browser console
**Solution:**
1. Frontend domain must be in allowed list:
   - `http://localhost:5173` (development)
   - `https://food-court-and-restaurant-mangement-1.onrender.com` (production)
2. Check backend logs for CORS errors
3. Verify `credentials: true` is set in CORS config

### Issue: Cookie is set but not being sent on subsequent requests
**Solution:**
1. Check cookie attributes in DevTools:
   - Should have `Secure` ✓
   - Should have `SameSite=None` ✓
   - Should have `Path=/` ✓
2. Verify `withCredentials: true` in frontend axios
3. Clear cookies and login again

### Issue: "Not Authorized" on protected routes after login
**Solution:**
1. Check if cookie is being sent: Look for `[protect] Token present: true`
2. If token is present, check middleware logs for validation errors
3. Verify JWT_SECRET is the same on backend and matches login

## 📊 What Should Happen (Step by Step)

### 1. User Clicks "Login"
```
Frontend sends POST /api/auth/admin/login with credentials
```

### 2. Backend Processes Login
```
[adminLogin] Admin login attempt for email: admin@example.com
[adminLogin] Admin authenticated: admin@example.com
[adminLogin] Cookie set successfully for: admin@example.com
→ Response includes Set-Cookie header
```

### 3. Browser Receives Response
```
DevTools → Network → See Set-Cookie header
DevTools → Application → Cookies shows token with attributes
```

### 4. User Navigates to Protected Route
```
Frontend GET /api/config/branding
Browser automatically includes cookie (withCredentials: true)
```

### 5. Backend Receives Request with Cookie
```
[REQUEST] GET /api/config/branding - Cookie: ✓ Present
[protect] Token present: true
[protect] Token verified successfully
→ Route executes and returns data
```

### 6. Route Works Without "Not Authorized"
```
Frontend displays data / admin dashboard loads
```

## 🧪 Manual Test Cases

### Test Case 1: Admin Login Should Set Cookie
```bash
# Terminal 1: Watch logs
tail -f render-logs.txt

# Terminal 2: Make login request
curl -X POST https://food-court-and-restaurant-backend.onrender.com/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  -v

# Expected: Response includes Set-Cookie header
```

### Test Case 2: Protected Route With Cookie
```bash
# After getting token from login above
curl -X GET https://food-court-and-restaurant-backend.onrender.com/api/config/branding \
  -H "Cookie: token=<TOKEN_FROM_LOGIN>" \
  -v

# Expected: 200 OK with branding data
```

### Test Case 3: Protected Route Without Cookie
```bash
curl -X GET https://food-court-and-restaurant-backend.onrender.com/api/config/branding \
  -v

# Expected: 401 Not Authorized
```

## 🚀 Expected Result After Deployment

✅ Admin can login without "Not Authorized" error
✅ Token cookie is set and sent automatically
✅ Admin can navigate to protected routes
✅ Logo upload works without auth errors
✅ Logout clears the cookie
✅ Logs show `Token present: true` on protected routes

## 📝 Files Modified

| File | Changes |
|------|---------|
| `backend/controllers/authController.js` | Fixed all cookie options: secure: true, sameSite: "none", path: "/" |
| `backend/index.js` | Updated CORS config with dynamic origins and credentials |
| `backend/middlewares/authMiddleware.js` | Added detailed logging |

## ✨ Key Points

🔐 **Security:**
- Cookies are httpOnly (cannot be accessed by JavaScript)
- Cookies are secure (only sent over HTTPS)
- sameSite: "none" allows cross-domain sharing safely

📡 **Cross-Domain:**
- Path: "/" makes cookies available to all routes
- CORS credentials: true enables credential sharing
- axios.defaults.withCredentials = true sends cookies

🐛 **Debugging:**
- All cookie operations are logged
- Request logging shows if cookie is sent
- Check Render logs for detailed debug messages
