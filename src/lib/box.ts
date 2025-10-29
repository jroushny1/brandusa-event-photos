import BoxSDK from 'box-node-sdk'

// Initialize Box SDK with JWT authentication
const sdk = new BoxSDK({
  clientID: process.env.BOX_CLIENT_ID!,
  clientSecret: process.env.BOX_CLIENT_SECRET!,
  appAuth: {
    keyID: process.env.BOX_PUBLIC_KEY_ID!,
    privateKey: process.env.BOX_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    passphrase: process.env.BOX_PASSPHRASE!,
  },
  enterpriseID: process.env.BOX_ENTERPRISE_ID!,
})

// Get a service account client
function getBoxClient() {
  return sdk.getAppAuthClient('enterprise')
}

/**
 * Upload a file to Box
 * @param key - Unique file identifier (path/filename)
 * @param file - File buffer to upload
 * @param contentType - MIME type of the file
 * @returns Object with Box file ID and shared link URL
 */
export async function uploadToBox(
  key: string,
  file: Buffer,
  contentType: string
): Promise<{ fileId: string; url: string }> {
  const client = getBoxClient()
  const folderId = process.env.BOX_FOLDER_ID || '0' // '0' is root folder

  // Extract filename from key (e.g., "assets/123-abc.jpg" -> "123-abc.jpg")
  const filename = key.split('/').pop() || key

  try {
    console.log('Box upload - Attempting to upload file:', filename, 'to folder:', folderId)

    // Upload the file
    const uploadedFile = await client.files.uploadFile(folderId, filename, file)
    console.log('Box upload - File uploaded successfully:', uploadedFile.entries[0].id)

    const fileId = uploadedFile.entries[0].id

    // Try to create a shared link - if this fails due to permissions, return the file ID instead
    try {
      console.log('Box upload - Creating shared link for file:', fileId)
      const sharedLink = await client.files.update(fileId, {
        shared_link: {
          access: 'company', // Company access (more permissive than 'open' in enterprise settings)
          permissions: {
            can_download: true,
            can_preview: true,
          },
        },
      })

      console.log('Box upload - Shared link created:', sharedLink.shared_link.url)
      // Return both the file ID and shared link
      return {
        fileId,
        url: sharedLink.shared_link.download_url || sharedLink.shared_link.url
      }
    } catch (linkError) {
      console.warn('Box upload - Could not create shared link, using file ID:', linkError)
      // If shared link creation fails, return file ID and a Box file URL
      return {
        fileId,
        url: `https://app.box.com/file/${fileId}`
      }
    }
  } catch (error: any) {
    console.error('Error uploading to Box:', error)
    console.error('Error details:', {
      message: error?.message,
      statusCode: error?.statusCode,
      response: error?.response?.body
    })

    // Provide more specific error messages
    if (error?.statusCode === 403) {
      throw new Error(`Box permission denied. Please ensure the app has "Write all files and folders" permission and is authorized by your Box administrator.`)
    }

    throw new Error(`Failed to upload file to Box: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Get a shared link for an existing Box file
 * @param fileId - Box file ID
 * @returns Public shared link URL
 */
export async function getBoxSharedLink(fileId: string): Promise<string> {
  const client = getBoxClient()

  try {
    const file = await client.files.get(fileId, { fields: 'shared_link' })

    // If shared link doesn't exist, create one
    if (!file.shared_link) {
      const updatedFile = await client.files.update(fileId, {
        shared_link: {
          access: 'open',
          permissions: {
            can_download: true,
            can_preview: true,
          },
        },
      })
      return updatedFile.shared_link.download_url || updatedFile.shared_link.url
    }

    return file.shared_link.download_url || file.shared_link.url
  } catch (error) {
    console.error('Error getting Box shared link:', error)
    throw new Error(`Failed to get shared link: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Get a direct download URL for a Box file
 * @param fileId - Box file ID
 * @returns Direct download URL that can be used in video/image tags
 */
export async function getBoxDownloadUrl(fileId: string): Promise<string> {
  const client = getBoxClient()

  try {
    // Get the file info including shared link
    const file = await client.files.get(fileId, { fields: 'shared_link' })

    // If file has a shared link with download URL, use it
    if (file.shared_link && file.shared_link.download_url) {
      return file.shared_link.download_url
    }

    // If no shared link exists, create one
    if (!file.shared_link) {
      const updatedFile = await client.files.update(fileId, {
        shared_link: {
          access: 'company',
          permissions: {
            can_download: true,
            can_preview: true,
          },
        },
      })

      if (updatedFile.shared_link && updatedFile.shared_link.download_url) {
        return updatedFile.shared_link.download_url
      }
    }

    // Fallback: return the shared link URL (not ideal but better than nothing)
    if (file.shared_link && file.shared_link.url) {
      return file.shared_link.url
    }

    // Last resort: return Box web URL
    return `https://app.box.com/file/${fileId}`
  } catch (error) {
    console.error('Error getting Box download URL:', error)
    throw new Error(`Failed to get download URL: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Delete a file from Box
 * @param fileId - Box file ID to delete
 */
export async function deleteFromBox(fileId: string): Promise<void> {
  const client = getBoxClient()

  try {
    await client.files.delete(fileId)
  } catch (error) {
    console.error('Error deleting from Box:', error)
    throw new Error(`Failed to delete file from Box: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Search for files in Box by name
 * @param filename - Filename to search for
 * @returns Array of matching files with their IDs and shared links
 */
export async function searchBoxFiles(filename: string): Promise<Array<{ id: string; name: string; url: string }>> {
  const client = getBoxClient()

  try {
    const results = await client.search.query(filename, {
      type: 'file',
      content_types: ['name'],
    })

    return await Promise.all(
      results.entries.map(async (file: any) => {
        const sharedLink = await getBoxSharedLink(file.id)
        return {
          id: file.id,
          name: file.name,
          url: sharedLink,
        }
      })
    )
  } catch (error) {
    console.error('Error searching Box files:', error)
    throw new Error(`Failed to search Box files: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generate a unique asset key for file storage
 * @param filename - Original filename
 * @returns Unique key in format "assets/timestamp-random.ext"
 */
export function generateAssetKey(filename: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = filename.split('.').pop()
  return `assets/${timestamp}-${randomString}.${extension}`
}

/**
 * Test Box connection
 * @returns Success message if connection works
 */
export async function testBoxConnection(): Promise<string> {
  const client = getBoxClient()

  try {
    // Try to get the service account user info (simpler check than enterprise.getUsers)
    const currentUser = await client.users.get('me')
    return `Connected to Box successfully. Service Account: ${currentUser.name} (ID: ${currentUser.id})`
  } catch (error: any) {
    console.error('Box connection test failed:', error)

    // Check for authorization error
    if (error?.message?.includes('not authorized') || error?.statusCode === 400) {
      throw new Error(`Box app is not authorized. Your Box administrator must go to https://app.box.com/master/custom-apps and authorize the app with Client ID: ${process.env.BOX_CLIENT_ID}`)
    }

    throw new Error(`Box connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
