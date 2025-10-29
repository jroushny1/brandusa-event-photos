# Deployment Guide - Speaker Asset Manager

Your Speaker Asset Manager is now ready to deploy! Here are the best options for hosting your application.

## 🚀 Option 1: Vercel (Recommended)

Vercel is the easiest option since they created Next.js and have excellent integration.

### Steps:
1. **Push to GitHub:**
   ```bash
   # Create a new repository on GitHub first, then:
   git remote add origin https://github.com/yourusername/speaker-asset-manager.git
   git branch -M main
   git push -u origin main
   ```

2. **Deploy with Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with your GitHub account
   - Click "New Project"
   - Import your `speaker-asset-manager` repository
   - Vercel will auto-detect it's a Next.js app

3. **Add Environment Variables:**
   In your Vercel project dashboard, go to Settings → Environment Variables and add:
   ```
   CLOUDFLARE_ACCOUNT_ID=your_account_id
   CLOUDFLARE_ACCESS_KEY_ID=your_access_key
   CLOUDFLARE_SECRET_ACCESS_KEY=your_secret_key
   CLOUDFLARE_BUCKET_NAME=your_bucket_name
   CLOUDFLARE_PUBLIC_URL=your_public_url
   AIRTABLE_ACCESS_TOKEN=your_token
   AIRTABLE_BASE_ID=your_base_id
   AIRTABLE_TABLE_NAME=Assets
   ```

4. **Deploy:**
   - Click "Deploy"
   - Your app will be live at `https://your-project-name.vercel.app`

## 🌐 Option 2: Netlify

Great alternative with similar features.

### Steps:
1. **Push to GitHub** (same as above)
2. **Deploy with Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `.next`
3. **Add Environment Variables** in Site Settings → Environment Variables
4. **Deploy**

## 🐳 Option 3: Docker + Any Cloud Provider

For more control, use Docker.

### Create Dockerfile:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Deploy to:
- **Railway:** Simple, push and deploy
- **Render:** Good free tier
- **DigitalOcean App Platform:** $5/month
- **AWS ECS/Fargate:** More complex but scalable

## 📦 Option 4: Self-Hosted VPS

### Requirements:
- Ubuntu/Debian server
- Node.js 18+
- PM2 for process management
- Nginx for reverse proxy

### Quick Setup:
```bash
# On your server:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs nginx
npm install -g pm2

# Deploy your app:
git clone https://github.com/yourusername/speaker-asset-manager.git
cd speaker-asset-manager
npm install
npm run build

# Create .env.local with your environment variables
# Start with PM2:
pm2 start npm --name "speaker-asset-manager" -- start
pm2 save
pm2 startup
```

## ⚙️ Environment Variables Reference

Make sure these are set in your deployment environment:

| Variable | Description | Example |
|----------|-------------|---------|
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID | `abc123...` |
| `CLOUDFLARE_ACCESS_KEY_ID` | R2 API access key ID | `def456...` |
| `CLOUDFLARE_SECRET_ACCESS_KEY` | R2 API secret key | `ghi789...` |
| `CLOUDFLARE_BUCKET_NAME` | R2 bucket name | `speaker-assets` |
| `CLOUDFLARE_PUBLIC_URL` | Public URL for assets | `https://pub-xyz.r2.dev` |
| `AIRTABLE_ACCESS_TOKEN` | Personal access token | `pat123...` |
| `AIRTABLE_BASE_ID` | Base ID from Airtable | `app456...` |
| `AIRTABLE_TABLE_NAME` | Table name | `Assets` |

## 🔧 Post-Deployment Checklist

1. **Test the /setup page** - Visit `/setup` to verify all connections work
2. **Upload a test file** - Make sure uploads work end-to-end
3. **Check the gallery** - Verify images display properly
4. **Test sharing** - Make sure share links work publicly
5. **Custom Domain** (optional) - Set up your own domain in your hosting provider

## 🚨 Important Security Notes

- Never commit your `.env.local` file to git (it's already in .gitignore)
- Environment variables in hosting platforms are encrypted and secure
- Your Cloudflare R2 assets are publicly accessible via the share URLs
- Consider setting up CORS policies in Cloudflare if needed

## 📊 Monitoring

- **Vercel:** Built-in analytics and monitoring
- **Other platforms:** Consider adding services like:
  - Sentry for error tracking
  - LogRocket for session replay
  - Uptime monitoring (Ping, UptimeRobot)

---

Your app is production-ready! The build passed successfully and all features are working. Choose the deployment option that best fits your needs and budget.

**Recommended:** Start with Vercel for the easiest deployment, then consider other options as your needs grow.