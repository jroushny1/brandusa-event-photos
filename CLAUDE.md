# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Brand USA Event Photos is an internal digital asset management system for Brand USA. It allows international offices to upload, organize, search, and share photos from Brand USA events. The design team can access these photos for annual reports and other internal needs.

## Commands

### Development
- `npm run dev` - Start the development server with Turbo
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality
- `npm run typecheck` - Run TypeScript type checking

### Testing & Verification
- Visit `/setup` to verify all API connections are working
- Check environment variables are properly configured
- Test uploads with small files first

## Architecture

### Tech Stack
- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **Storage**: Box for secure file storage with JWT authentication
- **Database**: Google Sheets for metadata and organization
- **Upload**: React Dropzone with server actions

### Project Structure
```
src/
├── app/                    # Next.js app router pages
│   ├── actions/           # Server actions (upload.ts)
│   ├── api/              # API routes (test connections)
│   ├── dashboard/        # Dashboard with stats
│   ├── gallery/          # Gallery view with search/filters
│   ├── setup/            # Setup verification page
│   └── upload/           # Upload page with dropzone
├── components/            # React components
│   ├── gallery/          # Gallery components (grid, modal, filters)
│   ├── layout/           # Navigation and layout
│   ├── ui/               # shadcn/ui components
│   └── upload/           # Upload components (dropzone)
├── lib/                  # Core utilities
│   ├── googlesheets.ts  # Google Sheets client and operations
│   ├── box.ts           # Box SDK client and operations
│   └── utils.ts         # General utilities (cn, etc.)
└── types/               # TypeScript type definitions
```

### Key Features
1. **Upload System**: Drag-and-drop upload with batch mode support
2. **Asset Storage**: Files stored in Box with JWT authentication, metadata in Google Sheets
3. **Gallery**: Responsive grid with search, filtering, and modal detail view
4. **Dashboard**: Statistics and quick actions
5. **Setup Verification**: Built-in API connection testing

### Data Flow
1. User uploads files via `/upload` page
2. Files processed by server action in `src/app/actions/upload.ts`
3. Files uploaded to Box using SDK in `src/lib/box.ts`
4. Metadata saved to Google Sheets using client in `src/lib/googlesheets.ts`
5. Assets displayed in gallery, fetched from Google Sheets with Box shared links

### Environment Variables Required
- `BOX_CLIENT_ID` - Box app client ID
- `BOX_CLIENT_SECRET` - Box app client secret
- `BOX_ENTERPRISE_ID` - Box enterprise ID
- `BOX_PUBLIC_KEY_ID` - Box JWT public key ID
- `BOX_PRIVATE_KEY` - Box JWT encrypted private key
- `BOX_PASSPHRASE` - Box JWT passphrase
- `BOX_FOLDER_ID` - Box folder ID (0 for root)
- `GOOGLE_SHEETS_ID` - Google Sheets spreadsheet ID
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` - Google service account email
- `GOOGLE_PRIVATE_KEY` - Google service account private key

### Important Implementation Notes
- Server actions are used for file uploads to handle large files securely
- Images are displayed using Next.js Image component with proper optimization
- Asset metadata includes event name, photographer, date, location, tags, and description
- Search functionality works across all text fields and tags
- Download functionality uses Box shared links for access
- Batch upload mode allows applying same metadata to multiple files
- All API connections can be tested via the `/setup` page
- Box app must be authorized by administrator in Box Admin Console before use
- Google Sheets is automatically initialized with proper headers on first use

### Development Workflow
1. Set up environment variables in `.env.local`
2. Run `npm run dev` to start development server
3. Visit `/setup` to verify all connections work
4. Test upload functionality with small files first
5. Use `/dashboard` to monitor application statistics
6. Check `/gallery` for asset management features