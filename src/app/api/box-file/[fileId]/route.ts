import { NextRequest, NextResponse } from 'next/server'
import BoxSDK from 'box-node-sdk'

// Initialize Box SDK
const sdk = new BoxSDK({
  clientID: process.env.BOX_CLIENT_ID!,
  clientSecret: process.env.BOX_CLIENT_SECRET!,
  appAuth: {
    keyID: process.env.BOX_PUBLIC_KEY_ID!,
    privateKey: process.env.BOX_PRIVATE_KEY!.includes('\\n')
      ? process.env.BOX_PRIVATE_KEY!.replace(/\\n/g, '\n')
      : process.env.BOX_PRIVATE_KEY!,
    passphrase: process.env.BOX_PASSPHRASE!,
  },
  enterpriseID: process.env.BOX_ENTERPRISE_ID!,
})

function getBoxClient() {
  return sdk.getAppAuthClient('enterprise')
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params
    const client = getBoxClient()

    // Get file content as a stream
    const stream = await client.files.getReadStream(fileId, {})

    // Get file info to determine content type
    const fileInfo = await client.files.get(fileId, { fields: 'name,extension' })

    // Determine content type based on file extension
    const extension = fileInfo.name.split('.').pop()?.toLowerCase()
    let contentType = 'application/octet-stream'

    if (extension) {
      const contentTypes: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
        mp4: 'video/mp4',
        mov: 'video/quicktime',
        avi: 'video/x-msvideo',
        wmv: 'video/x-ms-wmv',
      }
      contentType = contentTypes[extension] || contentType
    }

    // Convert Node.js stream to Web ReadableStream
    const webStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk: Buffer) => {
          controller.enqueue(new Uint8Array(chunk))
        })
        stream.on('end', () => {
          controller.close()
        })
        stream.on('error', (err) => {
          controller.error(err)
        })
      },
    })

    // Return the file stream with proper headers
    return new NextResponse(webStream, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error fetching file from Box:', error)
    return NextResponse.json(
      { error: 'Failed to fetch file from Box' },
      { status: 500 }
    )
  }
}
