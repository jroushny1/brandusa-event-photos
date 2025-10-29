import { NextResponse } from 'next/server'
import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3'

export async function GET() {
  try {
    const r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
        secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
      },
    })

    const command = new HeadBucketCommand({
      Bucket: process.env.CLOUDFLARE_BUCKET_NAME!,
    })

    await r2Client.send(command)

    return NextResponse.json({
      success: true,
      message: 'Successfully connected to Cloudflare R2'
    })
  } catch (error) {
    console.error('R2 connection test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to connect to Cloudflare R2'
    }, { status: 500 })
  }
}