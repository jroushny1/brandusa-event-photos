# Brand USA Event Photos - Setup Guide

This is the Brand USA internal version of the event photo management system. It uses Box for file storage and Google Sheets for metadata.

## Overview

- **File Storage**: Box (enterprise file storage)
- **Metadata Storage**: Google Sheets (event info, photographer, tags, etc.)
- **Authentication**: To be configured for Brand USA internal access

## Prerequisites

1. **Box Developer Account**
   - Go to https://developer.box.com
   - Create a new Custom App
   - Choose "Server Authentication (with JWT)"
   - Note down: Client ID, Client Secret, Enterprise ID

2. **Google Cloud Project**
   - Go to https://console.cloud.google.com
   - Create a new project (or use existing)
   - Enable Google Sheets API
   - Create Service Account credentials
   - Download the JSON key file

3. **Google Sheet Setup**
   - Create a new Google Sheet
   - Share it with the service account email (from step 2)
   - Give it "Editor" permissions
   - Note the Sheet ID from the URL

## Environment Variables

Create a `.env.local` file with:

```env
# Box Configuration
BOX_CLIENT_ID=your_box_client_id
BOX_CLIENT_SECRET=your_box_client_secret
BOX_ENTERPRISE_ID=your_box_enterprise_id
BOX_PUBLIC_KEY_ID=your_box_public_key_id
BOX_PRIVATE_KEY=your_box_private_key
BOX_PASSPHRASE=your_box_passphrase
BOX_FOLDER_ID=0  # 0 for root, or specific folder ID

# Google Sheets Configuration
GOOGLE_SHEETS_ID=your_google_sheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key\n-----END PRIVATE KEY-----\n"

# Next.js
NEXT_PUBLIC_APP_NAME="Brand USA Event Photos"
```

## Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Install Additional Packages**
   ```bash
   npm install box-node-sdk googleapis
   ```

3. **Set Up Box**
   - Create a Box Custom App at https://developer.box.com
   - Generate JWT configuration
   - Copy the config values to `.env.local`
   - Create a dedicated folder for event photos (or use root)

4. **Set Up Google Sheets**
   - Create Google Cloud service account
   - Share your Google Sheet with the service account
   - Add the credentials to `.env.local`

5. **Initialize Google Sheet Structure**
   The sheet should have these columns:
   - `id` (unique identifier)
   - `filename` (Box file name)
   - `originalFilename` (original upload name)
   - `boxFileId` (Box file ID)
   - `url` (Box shared link)
   - `fileType` (image or video)
   - `mimeType`
   - `size` (in bytes)
   - `event` (event name)
   - `date` (event date)
   - `location` (event location)
   - `photographer`
   - `tags` (comma-separated)
   - `description`
   - `uploadedAt` (timestamp)

6. **Run Development Server**
   ```bash
   npm run dev
   ```

## Box API Setup Details

### Creating a Box Custom App

1. Go to https://app.box.com/developers/console
2. Click "Create New App"
3. Select "Custom App"
4. Select "Server Authentication (with JWT)"
5. Name it "Brand USA Event Photos"

### Generating JWT Configuration

1. In your Box app settings, go to "Configuration"
2. Under "App Access Level", select "App + Enterprise Access"
3. Under "Application Scopes", enable:
   - Read all files and folders
   - Write all files and folders
   - Manage users
4. Click "Generate a Public/Private Keypair"
5. Download the JSON config file
6. Extract values for `.env.local`

### Authorizing the App

1. Go to Box Admin Console
2. Navigate to "Apps" → "Custom Apps"
3. Authorize your new app
4. This allows the app to access your Box enterprise

## Google Sheets API Setup

### Creating Service Account

1. Go to https://console.cloud.google.com
2. Select your project (or create new)
3. Navigate to "IAM & Admin" → "Service Accounts"
4. Click "Create Service Account"
5. Name it "brandusa-event-photos"
6. Grant it "Editor" role
7. Click "Create Key" → JSON
8. Download the key file

### Extracting Credentials

From the downloaded JSON file, extract:
- `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `private_key` → `GOOGLE_PRIVATE_KEY`

### Creating the Google Sheet

1. Create a new Google Sheet
2. Name it "Brand USA Event Photos"
3. Add column headers (see step 5 above)
4. Share with service account email (Editor access)
5. Copy Sheet ID from URL:
   `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`

## Deployment

### Vercel Deployment

1. Push to GitHub
2. Import in Vercel
3. Add all environment variables
4. Deploy

### Internal Hosting

For Brand USA internal hosting:
1. Build the app: `npm run build`
2. Host on internal server
3. Configure authentication (SSO/SAML if needed)

## Features

- **Mobile Upload**: International offices can upload from phones
- **Event Organization**: Group photos by event, date, location
- **Search & Filter**: Find photos by event, photographer, tags
- **Download**: Design team can download for reports
- **Security**: Box enterprise security + Google Workspace integration

## Support

For questions or issues, contact the development team.
