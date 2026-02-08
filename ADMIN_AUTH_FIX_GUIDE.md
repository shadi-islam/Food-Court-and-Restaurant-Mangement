# Admin Logo Upload Issues - Troubleshooting & Solutions

## What Was Wrong

Your backend had **two issues**:

### 1. **"Not Authorised" Error**
- **Root Cause**: The branding update endpoint (`PUT /api/config/branding`) required `superAdminOnly` permissions
- **Impact**: Even regular admins couldn't update branding/logos
- **Solution**: ✅ Changed permission to `adminOnly` (both admin and super_admin can now update)

### 2. **Logo Not Loading from Database**
- **Root Cause**: Since admins couldn't save the logo due to auth errors, the database had no logo data
- **Impact**: No logo was available to display on the frontend
- **Solution**: ✅ Admins can now save logos after fixing permission issue

### 3. **Missing Environment Variables on Render**
- **Root Cause**: Your Render backend is missing critical environment variables
- **Impact**: Admin login fails if variables aren't set correctly
- **Required Variables**:
  ```
  JWT_SECRET
  ADMIN_EMAIL
  ADMIN_PASSWORD
  SUPER_ADMIN_EMAIL (optional)
  SUPER_ADMIN_PASSWORD (optional)
  MONGODB_URI
  NODE_ENV=production
  ```

## Changes Made

### File: `backend/routes/brandingRoutes.js`
```javascript
// BEFORE: Only super_admin could update branding
brandingRoutes.put("/", superAdminOnly, updateBranding);

// AFTER: Both admin and super_admin can update branding
brandingRoutes.put("/", adminOnly, updateBranding);
```

### File: `backend/middlewares/authMiddleware.js`
- Added debug logging to help troubleshoot auth issues
- Logs user info when token verification fails

## Step-by-Step Fix for Your Live Server

### Step 1: Push the Updated Code
```bash
git add remote/src/
git commit -m "Fix: Allow admin users to update branding/logos"
git push
```

### Step 2: Configure Environment Variables on Render
Go to https://dashboard.render.com/

1. Click your **backend service**
2. Click **Settings** (or **Environment** tab)
3. Add/update these variables:

```
JWT_SECRET=your_32_char_secret_key
ADMIN_EMAIL=your_admin_email@example.com
ADMIN_PASSWORD=your_strong_password
SUPER_ADMIN_EMAIL=super_admin@example.com (optional)
SUPER_ADMIN_PASSWORD=super_strong_password (optional)
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
```

4. Click **Redeploy** (or deploy new commit)
5. Wait 2-3 minutes for service to restart

### Step 3: Test Admin Login
1. Go to your admin login page
2. Login with credentials from Step 2 (ADMIN_EMAIL and ADMIN_PASSWORD)
3. Navigate to **Branding Settings**
4. Try uploading/updating logo
5. Should see success message ✅

### Step 4: Verify Logo Display
1. Go to frontend homepage
2. Logo should now display (if you uploaded it)
3. Check browser DevTools → Network tab to see logo URL being fetched

## Debug Checklist

If you still see "Not Authorized":

- [ ] Did you redeploy the service after adding env variables? (give it 5 min)
- [ ] Did you clear browser cookies/cache? (Ctrl+Shift+Delete)
- [ ] Is the admin email EXACTLY matching ADMIN_EMAIL in env vars?
- [ ] Is the password EXACTLY the same as ADMIN_PASSWORD?
- [ ] Did you logout and login again after changes?
- [ ] Check Render logs for error messages:
  - Click backend service → Logs
  - Search for "adminOnly" or "Not Authorized"

## Code Changes Summary

| File | Change | Why |
|------|--------|-----|
| `backend/routes/brandingRoutes.js` | Removed `superAdminOnly`, added `adminOnly` | Allow regular admins to manage logos |
| `backend/middlewares/authMiddleware.js` | Added debug logging | Help identify auth issues in logs |

## What Stays the Same

- Logo upload functionality remains unchanged
- Database schema remains the same
- Frontend code works as-is
- CORS and cookie settings remain secure

## Next Steps

1. **Update environment variables** on Render (CRITICAL)
2. **Redeploy** your backend
3. **Test admin login** and logo upload
4. **Check Render logs** if issues persist

---

**Questions?**
- Check Render service logs: Dashboard → Services → Your Backend → Logs
- Admin auth logs should show why "Not Authorized" is happening
- Look for "[adminOnly]" messages in logs
