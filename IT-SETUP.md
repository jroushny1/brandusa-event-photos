# IT Setup Guide - Brand USA Event Photos

This guide provides step-by-step instructions for IT administrators to configure and deploy the Brand USA Event Photos application with OneLogin SSO authentication.

## Overview

The Brand USA Event Photos application is a digital asset management system that allows international offices to upload, organize, and share event photos. The application requires:

- **Box Enterprise** for secure file storage
- **Google Sheets** for metadata storage
- **OneLogin SSO** for authentication
- **Vercel or internal hosting** for deployment

## Prerequisites

- Box Enterprise account with admin access
- Google Cloud Platform project
- OneLogin admin access
- Deployment platform (Vercel recommended)

---

## 1. Box Configuration

### 1.1 Create a Box Custom App

1. Log in to the [Box Developer Console](https://app.box.com/developers/console)
2. Click **Create New App**
3. Select **Custom App**
4. Choose **Server Authentication (with JWT)**
5. Name the app: `Brand USA Event Photos`
6. Click **Create App**

### 1.2 Configure Application Settings

1. In the **Configuration** tab:
   - Under **Application Scopes**, enable:
     - Read and write all files and folders
     - Manage users
   - Under **Advanced Features**, enable:
     - Generate user access tokens
   - Under **App Access Level**, select:
     - App + Enterprise Access
2. Click **Save Changes**

### 1.3 Generate Public/Private Keypair

1. In the **Configuration** tab, scroll to **Add and Manage Public Keys**
2. Click **Generate a Public/Private Keypair**
3. A JSON configuration file will download automatically
4. **Save this file securely** - you'll need values from it for environment variables

### 1.4 Authorize the Application

1. In the Box Admin Console, go to **Apps** → **Custom Apps Manager**
2. Click **Authorize New App**
3. Enter the **Client ID** from the JSON file
4. Click **Authorize**

### 1.5 Create Upload Folder

1. In Box, create a folder for event photos (e.g., "Brand USA Event Photos")
2. Add the service account as **Editor** to this folder:
   - Service account email format: `AutomationUser_[ID]_[random]@boxdevedition.com`
   - Find this in the Box Admin Console under the app's details
3. Note the **Folder ID** from the URL (e.g., `https://app.box.com/folder/348316309950` → ID is `348316309950`)

### 1.6 Environment Variables from Box

From the downloaded JSON file, extract these values:

```
BOX_CLIENT_ID=<boxAppSettings.clientID>
BOX_CLIENT_SECRET=<boxAppSettings.clientSecret>
BOX_ENTERPRISE_ID=<enterpriseID>
BOX_PUBLIC_KEY_ID=<boxAppSettings.appAuth.publicKeyID>
BOX_PRIVATE_KEY=<boxAppSettings.appAuth.privateKey>
BOX_PASSPHRASE=<boxAppSettings.appAuth.passphrase>
BOX_FOLDER_ID=<folder ID from step 1.5>
```

---

## 2. Google Sheets Configuration

### 2.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Name it: `Brand USA Event Photos`

### 2.2 Enable Google Sheets API

1. In the Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for "Google Sheets API"
3. Click **Enable**

### 2.3 Create a Service Account

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **Service Account**
3. Enter details:
   - Name: `brandusa-event-photos`
   - Description: `Service account for Brand USA Event Photos app`
4. Click **Create and Continue**
5. Skip optional steps and click **Done**

### 2.4 Create Service Account Key

1. Click on the newly created service account
2. Go to the **Keys** tab
3. Click **Add Key** → **Create New Key**
4. Select **JSON** format
5. Click **Create**
6. A JSON file will download - **save it securely**

### 2.5 Create Google Sheet

1. Create a new Google Sheet
2. Name it: `Brand USA Event Photos - Assets`
3. Share it with the service account email (from the JSON file)
4. Grant **Editor** access
5. Note the **Sheet ID** from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`

### 2.6 Environment Variables from Google

From the service account JSON file:

```
GOOGLE_SHEETS_ID=<sheet ID from step 2.5>
GOOGLE_SERVICE_ACCOUNT_EMAIL=<client_email>
GOOGLE_PRIVATE_KEY=<private_key>
```

**Note:** The private key will include newlines (`\n`). Keep these as-is and wrap the entire value in double quotes.

---

## 3. OneLogin SSO Configuration

### 3.1 Create OIDC Application in OneLogin

1. Log in to [OneLogin Admin Portal](https://thebrandusa.onelogin.com/admin)
2. Go to **Applications** → **Applications**
3. Click **Add App**
4. Search for "OpenId Connect (OIDC)"
5. Select the generic **OpenId Connect (OIDC)** connector
6. Click **Save**

### 3.2 Configure Application Details

1. In the **Configuration** tab:
   - **Display Name**: `Brand USA Event Photos`
   - **Description**: `Digital asset management for event photos`
   - **Login URL**: `https://your-domain.vercel.app/auth/signin` (update after deployment)
   - **Redirect URI**: `https://your-domain.vercel.app/api/auth/callback/onelogin`
2. Click **Save**

### 3.3 Get Application Credentials

1. Go to the **SSO** tab
2. Note these values:
   - **Client ID**
   - **Client Secret** (click **Show Client Secret**)
   - **Issuer URL** (format: `https://thebrandusa.onelogin.com/oidc/2`)

### 3.4 Configure Access

1. Go to the **Access** tab
2. Assign roles/users who should have access to the application
   - Recommended: Assign to all Brand USA employees

### 3.5 Environment Variables from OneLogin

```
ONELOGIN_ISSUER=https://thebrandusa.onelogin.com/oidc/2
ONELOGIN_CLIENT_ID=<client ID from step 3.3>
ONELOGIN_CLIENT_SECRET=<client secret from step 3.3>
```

---

## 4. NextAuth Configuration

### 4.1 Generate Auth Secret

Generate a random secret for NextAuth JWT encryption:

```bash
openssl rand -base64 32
```

Or use an online generator: https://generate-secret.vercel.app/32

### 4.2 Environment Variables

```
AUTH_SECRET=<generated secret from step 4.1>
NEXTAUTH_URL=https://your-domain.vercel.app
```

**Note:** For local development, use `NEXTAUTH_URL=http://localhost:3000`

---

## 5. Deployment

### Option A: Deploy to Vercel (Recommended)

1. **Fork or Push Repository to GitHub**
   - Ensure the repository is pushed to GitHub

2. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com/)
   - Sign up with your Brand USA GitHub account

3. **Import Project**
   - Click **Add New** → **Project**
   - Import the GitHub repository
   - Configure project:
     - Framework Preset: **Next.js**
     - Root Directory: `./`

4. **Add Environment Variables**
   - In project settings, go to **Environment Variables**
   - Add all variables from sections 1-4 above
   - Make sure to add them for **Production**, **Preview**, and **Development** environments

5. **Deploy**
   - Click **Deploy**
   - Wait for build to complete (2-5 minutes)
   - Note the deployment URL (e.g., `https://brandusa-event-photos.vercel.app`)

6. **Update OneLogin Redirect URIs**
   - Go back to OneLogin application settings
   - Update **Login URL**: `https://[your-vercel-url]/auth/signin`
   - Update **Redirect URI**: `https://[your-vercel-url]/api/auth/callback/onelogin`
   - Click **Save**

7. **Update Environment Variables**
   - In Vercel project settings, update:
     - `NEXTAUTH_URL=https://[your-vercel-url]`
   - Redeploy the application

8. **Custom Domain (Optional)**
   - In Vercel project settings, go to **Domains**
   - Add custom domain: `event-photos.thebrandusa.com`
   - Follow DNS configuration instructions
   - Update OneLogin URIs and `NEXTAUTH_URL` accordingly

### Option B: Deploy to Internal Servers

If deploying to Brand USA's internal infrastructure:

1. **Build the Application**
   ```bash
   npm install
   npm run build
   ```

2. **Set Environment Variables**
   - Add all environment variables to your server's environment
   - Ensure `NEXTAUTH_URL` points to your production URL

3. **Run the Application**
   ```bash
   npm start
   ```

4. **Configure Reverse Proxy**
   - Set up nginx or Apache to proxy requests to the Node.js application
   - Ensure SSL/TLS is properly configured

5. **Update OneLogin**
   - Update redirect URIs in OneLogin to match your production URL

---

## 6. Verification and Testing

### 6.1 Verify API Connections

1. Navigate to `/setup` on the deployed application
2. All checks should show green:
   - ✅ Box Configuration
   - ✅ Google Sheets Configuration
   - ✅ Authentication Configuration

### 6.2 Test Authentication Flow

1. Go to the application URL
2. You should be redirected to `/auth/signin`
3. Click **Sign in with OneLogin**
4. Complete OneLogin authentication
5. You should be redirected to `/gallery`
6. User name should appear in the navigation bar

### 6.3 Test Upload

1. Navigate to `/upload`
2. Drag and drop a test image
3. Fill in metadata
4. Click **Upload Assets**
5. Verify file appears in:
   - Box folder
   - Google Sheet
   - Application gallery

---

## 7. Troubleshooting

### Box Issues

**Error: "404 Not Found" when uploading**
- Ensure the service account has Editor access to the upload folder
- Verify `BOX_FOLDER_ID` is correct

**Error: "401 Unauthorized"**
- Check that the Box app is authorized in Admin Console
- Verify JWT credentials are correct in environment variables
- Ensure keypair hasn't expired

### Google Sheets Issues

**Error: "Permission denied"**
- Ensure the service account has Editor access to the Google Sheet
- Verify `GOOGLE_SHEETS_ID` is correct

**Error: "API not enabled"**
- Enable Google Sheets API in Google Cloud Console

### OneLogin Issues

**Error: "Redirect URI mismatch"**
- Ensure redirect URI in OneLogin exactly matches: `https://[your-domain]/api/auth/callback/onelogin`
- Check for trailing slashes

**Error: "Invalid client"**
- Verify `ONELOGIN_CLIENT_ID` and `ONELOGIN_CLIENT_SECRET` are correct
- Ensure `ONELOGIN_ISSUER` format is correct

**Users can't sign in**
- Verify users are assigned to the application in OneLogin Access tab

### NextAuth Issues

**Error: "Invalid secret"**
- Regenerate `AUTH_SECRET` using `openssl rand -base64 32`

**Sessions not persisting**
- Ensure `NEXTAUTH_URL` matches your actual deployment URL
- Check browser cookies are enabled

---

## 8. Maintenance

### Rotating Credentials

**Box Credentials**
1. In Box Developer Console, go to your app
2. Generate new public/private keypair
3. Update environment variables
4. Redeploy application

**Google Credentials**
1. Create new service account key in Google Cloud Console
2. Update environment variables
3. Revoke old key
4. Redeploy application

**OneLogin Credentials**
1. In OneLogin, regenerate client secret
2. Update `ONELOGIN_CLIENT_SECRET` environment variable
3. Redeploy application

### Monitoring

- **Check Box storage usage**: Monitor folder size in Box Admin Console
- **Check Google Sheets rows**: Sheet supports up to 10 million cells
- **Monitor application logs**: Check Vercel/server logs for errors

---

## Support

For technical issues:
- Box: [Box Support](https://support.box.com/)
- Google Cloud: [Google Cloud Support](https://cloud.google.com/support)
- OneLogin: [OneLogin Support](https://support.onelogin.com/)
- Application Issues: Contact development team

---

## Security Notes

- **Never commit `.env.local` to version control**
- Store credentials securely (use a password manager)
- Rotate credentials regularly (every 90 days recommended)
- Limit OneLogin application access to authorized users only
- Enable MFA for all administrative accounts
- Regularly review Box and Google Sheets access logs
