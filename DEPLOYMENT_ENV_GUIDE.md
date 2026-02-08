# Environment Variables Setup Guide for Render Deployment

## Required Backend Environment Variables

Your Render backend needs these environment variables configured:

### Authentication & Admin Credentials
```
JWT_SECRET=your_jwt_secret_key_here_min_32_chars

# Super Admin (can access all admin features)
SUPER_ADMIN_EMAIL=admin@example.com
SUPER_ADMIN_PASSWORD=super_secure_password_here

# Regular Admin (can manage most features except some admin settings)
ADMIN_EMAIL=admin2@example.com
ADMIN_PASSWORD=admin_secure_password_here

NODE_ENV=production
```

### Database
```
MONGODB_URI=your_mongodb_connection_string_here
```

### Files & Storage (Cloudinary)
```
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Email (Nodemailer - for contact forms)
```
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password_here
```

### Firebase (Optional - for notifications)
```
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
```

## Steps to Configure on Render

### 1. Go to Render Dashboard
- Navigate to https://dashboard.render.com/
- Click on your backend service

### 2. Navigate to Environment
- Click on **Environment** tab (usually left sidebar)
- Or click **Settings** → scroll to **Environment Variables**

### 3. Add Each Variable
For each variable above:
1. Click "Add Environment Variable"
2. Enter the **Key** (e.g., `JWT_SECRET`)
3. Enter the **Value** (e.g., your actual secret)
4. Click Save

### 4. Redeploy Service
- After adding all variables, click **Manual Deploy** or **Deploy latest commit**
- Wait for the service to rebuild and start

## ⚠️ Important Security Notes

1. **Never commit .env files** - They're in .gitignore for a reason
2. **Use strong passwords** for admin credentials (min 12 characters, mix of uppercase, lowercase, numbers, symbols)
3. **Keep credentials private** - Don't share them or post them online
4. **Rotate passwords periodically** - Change admin passwords every 3 months
5. **For production**, use strong, unique values:
   - Generate JWT_SECRET: Use `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - Create strong passwords: Use a password manager or generator

## Testing After Deployment

1. **Test Super Admin Login**:
   ```
   Email: admin@example.com
   Password: super_secure_password_here
   ```

2. **Test Branding Upload**:
   - Go to Admin Dashboard
   - Navigate to Branding Settings
   - Try uploading/updating logo
   - Should see success message

3. **Check Console Logs** (Render Dashboard → Logs):
   - No "Not Authorized" errors should appear
   - Should see "Branding updated successfully" messages

## Troubleshooting

### Issue: "Not Authorized" when uploading logo
- ✅ Check that ADMIN_EMAIL and ADMIN_PASSWORD are correctly set
- ✅ Check that JWT_SECRET is consistent
- ✅ Redeploy after adding environment variables
- ✅ Clear cookies in browser and login again

### Issue: Logo still not displaying
- ✅ Make sure you've uploaded a logo in the branding settings
- ✅ Check that the logoUrl is being saved (check MongoDB)
- ✅ Verify Cloudinary credentials if using image upload

### Issue: Firebase notifications not working
- ✅ Verify all FIREBASE_* variables are set correctly
- ✅ Check that firebase service account JSON is valid

## Local Development Setup

For local development, create a `.env` file in the `backend/` folder:

```
JWT_SECRET=dev_secret_key_12345678901234567890
SUPER_ADMIN_EMAIL=dev@example.com
SUPER_ADMIN_PASSWORD=dev_password
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin_password
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/restaurant-db
CLOUDINARY_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

Then start the server:
```bash
cd backend
npm run server
```

**DO NOT commit the .env file to git!**
