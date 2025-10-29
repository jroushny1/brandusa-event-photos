# Deployment Guide - Brand USA Event Photos

## What's Already Done ✅

The application is **fully configured and working locally**:
- ✅ Box integration configured and tested
- ✅ Google Sheets integration configured and tested
- ✅ File uploads working
- ✅ Image and video playback working
- ✅ Authentication system configured (needs OneLogin credentials)

## What IT Needs to Do

### Step 1: Create OneLogin OIDC Application (5 minutes)

1. Log in to [OneLogin Admin Portal](https://thebrandusa.onelogin.com/admin)
2. Go to **Applications** → **Add App**
3. Search for "OpenId Connect" and select the generic **OpenId Connect (OIDC)** connector
4. Configure:
   - **Display Name**: `Brand USA Event Photos`
   - **Redirect URI**: `https://your-app-url.vercel.app/api/auth/callback/onelogin`
     - (Use `http://localhost:3000/api/auth/callback/onelogin` for testing first)
5. Go to **SSO** tab and copy:
   - **Client ID**
   - **Client Secret**
6. Go to **Access** tab and assign to Brand USA employees

### Step 2: Add Missing Environment Variables

The application needs these 3 additional environment variables:

```bash
# Generate this secret with: openssl rand -base64 32
AUTH_SECRET=<paste_generated_secret_here>

# From OneLogin SSO tab
ONELOGIN_CLIENT_ID=<paste_from_onelogin>
ONELOGIN_CLIENT_SECRET=<paste_from_onelogin>
```

**Note:** All other environment variables (Box, Google Sheets) are already in `.env.local` and working.

### Step 3: Deploy to Vercel (10 minutes)

**Option A: Vercel (Recommended - Easiest)**

1. Push code to GitHub (if not already there)
2. Go to [vercel.com](https://vercel.com/) and sign in
3. Click **Add New** → **Project**
4. Import the GitHub repository
5. In **Environment Variables**, add **ALL** variables from `.env.local`:
   - Copy the entire contents of `.env.local`
   - Add the 3 new variables from Step 2 above
6. Click **Deploy**
7. Once deployed, note the URL (e.g., `https://brandusa-event-photos.vercel.app`)
8. Go back to OneLogin and update the **Redirect URI** to use the production URL
9. In Vercel, update `NEXTAUTH_URL` environment variable to the production URL
10. Redeploy (Vercel will automatically redeploy when you update environment variables)

**Option B: Internal Servers**

If deploying to Brand USA's own servers:

```bash
# On your server
npm install
npm run build
npm start
```

Add all environment variables to your server environment and configure SSL/TLS.

### Step 4: Optional - Custom Domain

In Vercel project settings → **Domains**, add:
- `event-photos.thebrandusa.com` (or whatever you prefer)
- Follow DNS instructions
- Update OneLogin redirect URI and `NEXTAUTH_URL` to use custom domain

---

## Testing After Deployment

1. Visit your deployed URL
2. You should see the sign-in page
3. Click **Sign in with OneLogin**
4. Complete OneLogin authentication
5. You should be redirected to the gallery
6. Test uploading a file
7. Verify it appears in Box folder and Google Sheets

---

## Making Future Changes

### For Janette (Non-Technical Changes)

**Super Easy** - You can make these changes yourself:

1. **Update text, styling, or UI**:
   - Edit files locally
   - Push to GitHub
   - Vercel automatically redeploys (30-60 seconds)
   - Changes are live!

2. **Common changes you can make**:
   - Update page titles or descriptions
   - Change button text
   - Modify form fields
   - Update colors/styling
   - Add/remove navigation items

**Example workflow**:
```bash
# Make changes to files in VS Code
git add .
git commit -m "Update upload form labels"
git push
# Vercel auto-deploys in ~1 minute
```

### For Technical Changes

If you need new features or functionality:
- Contact development team
- Or use Claude Code to make changes
- Push to GitHub
- Vercel auto-deploys

**The deployment is completely automated** - just push to GitHub and it updates automatically!

---

## Sharing the Project with IT

### Method 1: GitHub (Recommended)

If the code is already on GitHub:
1. Share the repository URL with IT
2. Share this DEPLOYMENT-GUIDE.md file
3. IT can clone and deploy

### Method 2: Zip File

If not on GitHub yet:
```bash
cd /Users/janetteroush/brandusa-event-photos
# Create a zip excluding node_modules
zip -r brandusa-event-photos.zip . -x "node_modules/*" ".next/*" "*.log"
```

Then share:
- The zip file
- This DEPLOYMENT-GUIDE.md
- The current `.env.local` file (securely - it contains credentials!)

---

## Maintenance

### Regular Maintenance
- **None required** - Application runs automatically
- Box and Google Sheets have no usage limits for your scale
- No database to maintain

### When to Contact IT
- Rotating credentials (recommended every 90 days)
- Adding new users to OneLogin application
- Domain changes

### Monitoring
- Check Vercel dashboard for error logs
- Monitor Box folder storage usage

---

## Cost

- **Vercel**: Free tier supports your needs (unless you get massive traffic)
- **Box**: Already included in your enterprise plan
- **Google Sheets**: Free
- **OneLogin**: Already included in your company plan

**Total additional cost: $0** (unless you exceed Vercel free tier)

---

## Support Contacts

- **Application Issues**: Contact development team or use Claude Code
- **OneLogin Issues**: Brand USA IT team
- **Box Issues**: Brand USA IT team
- **Deployment Issues**: Vercel support (excellent docs at vercel.com/docs)

---

## Summary for IT

**What you're deploying**: A fully-functional Next.js application that's already configured and tested locally. Box and Google Sheets are already working.

**What you need to add**:
1. OneLogin OIDC app (5 min)
2. Three environment variables
3. Deploy to Vercel (10 min)

**Total time**: ~15-20 minutes

**Maintenance**: Nearly zero - automated deployments via GitHub push
