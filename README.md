# Speaker Asset Manager

A professional digital asset management system for conference speakers to organize, store, and share photos and videos from their speaking events. Built with Next.js 14, Cloudflare R2, and Airtable.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fjroushny1%2Fspeaker-asset-manager&env=CLOUDFLARE_ACCOUNT_ID,CLOUDFLARE_ACCESS_KEY_ID,CLOUDFLARE_SECRET_ACCESS_KEY,CLOUDFLARE_BUCKET_NAME,CLOUDFLARE_PUBLIC_URL,AIRTABLE_ACCESS_TOKEN,AIRTABLE_BASE_ID,AIRTABLE_TABLE_NAME&project-name=speaker-asset-manager&repository-name=speaker-asset-manager)

## 🚀 Quick Setup for Colleagues

Want to share this with a colleague? They can get their own independent version in 10 minutes:

1. **[Click here for step-by-step setup guide →](SETUP_GUIDE.md)**
2. **One-click deploy**: Use the "Deploy with Vercel" button above
3. **They need**: Their own Cloudflare R2 bucket and Airtable base (both free)

Their version will be completely separate from yours - no shared data!

## Features

### 📸 Smart Upload System
- **Drag & Drop Interface**: Intuitive file upload supporting photos and videos up to 2GB
- **Batch Upload Mode**: Apply the same metadata to multiple files at once
- **Real-time Progress**: Visual upload progress indicators
- **Auto File Processing**: Automatic upload to Cloudflare R2 with metadata storage

### 🎯 Powerful Organization
- **Event-based Organization**: Group assets by speaking events
- **Rich Metadata**: Track photographer, date, tags, and descriptions
- **Smart Search**: Find assets by event, photographer, tags, or description
- **Advanced Filters**: Filter by date range, file type, and more

### 🖼️ Professional Gallery
- **Masonry Grid Layout**: Beautiful responsive photo gallery
- **Detail View**: Full-screen asset viewing with complete metadata
- **Quick Actions**: One-click download and view options
- **Mobile Optimized**: Works perfectly on all devices

### 📊 Insights Dashboard
- **Usage Statistics**: Total assets, events covered, top photographers
- **Recent Uploads**: Quick access to your latest additions
- **Storage Tracking**: Monitor your asset collection growth

### 🔧 Easy Setup
- **Setup Verification**: Built-in connection testing for all services
- **Environment Check**: Automatic validation of configuration
- **Step-by-step Guide**: Clear instructions for API setup

## Tech Stack

- **Frontend**: Next.js 14 with App Router, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Storage**: Cloudflare R2 (S3-compatible object storage)
- **Database**: Airtable (metadata and organization)
- **Deployment**: Vercel (recommended)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/speaker-asset-manager.git
cd speaker-asset-manager
npm install
```

### 2. Environment Setup

Copy the environment template:

```bash
cp .env.example .env.local
```

Fill in your API credentials (see setup guides below):

```env
# Cloudflare R2 Configuration
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
CLOUDFLARE_ACCESS_KEY_ID=your_access_key_id_here
CLOUDFLARE_SECRET_ACCESS_KEY=your_secret_access_key_here
CLOUDFLARE_BUCKET_NAME=your_bucket_name_here
CLOUDFLARE_PUBLIC_URL=https://your-bucket.r2.dev

# Airtable Configuration
AIRTABLE_ACCESS_TOKEN=your_access_token_here
AIRTABLE_BASE_ID=your_base_id_here
AIRTABLE_TABLE_NAME=Assets
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and visit `/setup` to verify your configuration.

## Service Setup Guides

### Cloudflare R2 Setup

1. **Create Account**: Sign up at [Cloudflare](https://dash.cloudflare.com/sign-up)

2. **Create R2 Bucket**:
   - Go to R2 Object Storage in your dashboard
   - Click "Create bucket"
   - Choose a unique name for your bucket
   - Select a region close to your users

3. **Generate API Token**:
   - Go to "Manage R2 API tokens"
   - Click "Create API token"
   - Choose "Custom token"
   - Set permissions to "Object Read & Write"
   - Note down your Access Key ID and Secret Access Key

4. **Set up Public URL** (optional but recommended):
   - In your bucket settings, go to "Settings"
   - Set up a custom domain or use the default R2.dev URL
   - Update `CLOUDFLARE_PUBLIC_URL` with your domain

### Airtable Setup

1. **Create Account**: Sign up at [Airtable](https://airtable.com/signup)

2. **Create Base**:
   - Create a new base or use the template below
   - Name your table "Assets" (or update `AIRTABLE_TABLE_NAME`)

3. **Get API Credentials**:
   - Go to [Account Settings](https://airtable.com/account)
   - In the "API" section, create a Personal Access Token
   - Copy your token to `AIRTABLE_ACCESS_TOKEN`

4. **Get Base ID**:
   - Go to your base
   - Click "Help" > "API documentation"
   - Your base ID is shown in the URL and documentation
   - Copy to `AIRTABLE_BASE_ID`

### Airtable Base Template

Create a table called "Assets" with these fields:

| Field Name | Type | Description |
|------------|------|-------------|
| filename | Single line text | Internal filename in R2 |
| originalFilename | Single line text | Original upload filename |
| url | Single line text | Private R2 URL |
| publicUrl | Single line text | Public access URL |
| fileType | Single select | "image" or "video" |
| mimeType | Single line text | File MIME type |
| size | Number | File size in bytes |
| width | Number | Image/video width |
| height | Number | Image/video height |
| duration | Number | Video duration (seconds) |
| uploadedAt | Date & time | Upload timestamp |
| event | Single line text | Event name |
| date | Date | Event date |
| photographer | Single line text | Photographer name |
| tags | Long text | Comma-separated tags |
| description | Long text | Asset description |

## Deployment

### Deploy to Vercel (Recommended)

1. **One-Click Deploy**:

   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Fspeaker-asset-manager&env=CLOUDFLARE_ACCOUNT_ID,CLOUDFLARE_ACCESS_KEY_ID,CLOUDFLARE_SECRET_ACCESS_KEY,CLOUDFLARE_BUCKET_NAME,CLOUDFLARE_PUBLIC_URL,AIRTABLE_ACCESS_TOKEN,AIRTABLE_BASE_ID,AIRTABLE_TABLE_NAME&project-name=speaker-asset-manager&repository-name=speaker-asset-manager)

2. **Manual Deploy**:
   ```bash
   npm install -g vercel
   vercel
   ```

3. **Environment Variables**:
   - In your Vercel dashboard, go to Settings > Environment Variables
   - Add all the variables from your `.env.local`
   - Redeploy your application

## Usage

### Uploading Assets

1. **Single Upload**:
   - Visit `/upload`
   - Drag & drop or select files
   - Fill in event metadata
   - Click upload

2. **Batch Upload**:
   - Select multiple files
   - Check "Apply same metadata to all files"
   - Fill in shared metadata
   - Upload all at once

### Managing Assets

1. **Browse Gallery**: Visit `/gallery` to see all assets
2. **Search & Filter**: Use the search bar and filters to find specific assets
3. **View Details**: Click any asset for full metadata and download options
4. **Download**: Click the download button to get the original file

### Dashboard

Visit `/dashboard` for:
- Collection statistics
- Recent uploads
- Top photographers
- Quick action buttons

## Development

### Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── actions/           # Server actions
│   ├── api/              # API routes
│   ├── dashboard/        # Dashboard page
│   ├── gallery/          # Gallery page
│   ├── setup/            # Setup verification page
│   └── upload/           # Upload page
├── components/            # React components
│   ├── gallery/          # Gallery-specific components
│   ├── layout/           # Layout components
│   ├── ui/               # shadcn/ui components
│   └── upload/           # Upload components
├── lib/                  # Utility libraries
│   ├── airtable.ts      # Airtable client
│   ├── r2.ts            # Cloudflare R2 client
│   └── utils.ts         # General utilities
└── types/               # TypeScript definitions
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks
```

---

**Built for speakers, by speakers.** 📸✨
