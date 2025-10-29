# Speaker Asset Manager - Setup Guide

## 🚀 Quick Deploy Your Own Version

This guide will help you create your own independent Speaker Asset Manager in about 10 minutes.

## Step 1: Get the Code

**Option A: Fork (if you have GitHub)**
1. Go to https://github.com/jroushny1/speaker-asset-manager
2. Click "Fork" to create your own copy

**Option B: Download**
1. Click "Code" → "Download ZIP"
2. Extract and upload to your own GitHub repository

## Step 2: Set Up Services

### 2.1 Create Cloudflare R2 Bucket (Free Storage)

1. **Sign up** at [cloudflare.com](https://cloudflare.com)
2. **Go to R2** Object Storage in the dashboard
3. **Create a bucket** (name it something like `your-name-speaker-assets`)
4. **Get API credentials**:
   - Go to "Manage R2 API Tokens"
   - Create token with "Object Read & Write" permissions
   - Save: Account ID, Access Key, Secret Key
5. **Set up public access** (optional but recommended):
   - Go to your bucket settings
   - Enable public access or set up custom domain

### 2.2 Create Airtable Base

1. **Sign up** at [airtable.com](https://airtable.com)
2. **Create new base** from scratch
3. **Create table** called "Speaking Assets"
4. **Add these fields** to your table:
   ```
   filename (Single line text)
   originalFilename (Single line text)
   url (URL)
   publicUrl (URL)
   fileType (Single select: Image, Video)
   mimeType (Single line text)
   size (Number)
   width (Number)
   height (Number)
   duration (Number)
   uploadedAt (Date)
   event (Single line text)
   date (Date)
   photographer (Single line text)
   tags (Multiple select)
   description (Long text)
   ```

5. **Add tag options** to the tags field:
   ```
   Headshot, Keynote, Presentation, Networking, Panel,
   Workshop, Conference, Speaking, Audience, Backstage,
   Award, Group Photo, Candid
   ```

6. **Get API credentials**:
   - Go to account settings → Create Personal Access Token
   - Give it access to your base
   - Get Base ID from the API documentation page

## Step 3: Deploy to Vercel (Free Hosting)

1. **Sign up** at [vercel.com](https://vercel.com) with GitHub
2. **Import your repository**
3. **Add environment variables** in the Vercel dashboard:

```
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_SECRET_ACCESS_KEY=your_secret_key
CLOUDFLARE_BUCKET_NAME=your_bucket_name
CLOUDFLARE_PUBLIC_URL=https://your-bucket-url.r2.dev

AIRTABLE_ACCESS_TOKEN=pat...your_token
AIRTABLE_BASE_ID=app...your_base_id
AIRTABLE_TABLE_NAME=Speaking Assets
```

4. **Deploy!** Vercel will build and deploy automatically

## Step 4: Test Your Setup

1. Visit your deployed URL
2. Go to `/setup` page to test connections
3. Try uploading a test photo
4. Check your gallery!

## 🔧 Customization Ideas

- Change the app name in `src/app/layout.tsx`
- Update colors in `tailwind.config.js`
- Modify available tags in `src/app/upload/page.tsx`
- Add your own logo/branding

## 💡 Tips

- **Free tier limits**:
  - Cloudflare R2: 10GB free storage
  - Airtable: 1,200 records free
  - Vercel: Unlimited for personal projects

- **Security**: Your environment variables are secure in Vercel
- **Updates**: You can pull changes from the original repo anytime
- **Independence**: Your data stays completely separate

## 🆘 Need Help?

If you get stuck:
1. Check the `/setup` page for connection issues
2. Verify all environment variables are set correctly
3. Make sure Airtable field names match exactly (case-sensitive!)

## 🎉 You're Done!

You now have your own independent Speaker Asset Manager that's completely separate from the original!