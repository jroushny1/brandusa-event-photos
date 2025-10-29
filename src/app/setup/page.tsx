'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react'

interface ConnectionStatus {
  name: string
  description: string
  status: 'checking' | 'success' | 'error' | 'warning'
  error?: string
  details?: string
}

export default function SetupPage() {
  const [checking, setChecking] = useState(false)
  const [connections, setConnections] = useState<ConnectionStatus[]>([
    {
      name: 'Environment Variables',
      description: 'Check if all required environment variables are set',
      status: 'checking'
    },
    {
      name: 'Box',
      description: 'Test connection to Box API',
      status: 'checking'
    },
    {
      name: 'Google Sheets',
      description: 'Test connection to Google Sheets API',
      status: 'checking'
    }
  ])

  const checkConnections = async () => {
    setChecking(true)

    // Reset all statuses
    setConnections(prev => prev.map(conn => ({ ...conn, status: 'checking', error: undefined, details: undefined })))

    try {
      // Check environment variables via API
      try {
        const envResponse = await fetch('/api/test/env')
        const envResult = await envResponse.json()

        setConnections(prev => prev.map(conn =>
          conn.name === 'Environment Variables'
            ? {
                ...conn,
                status: envResult.success ? 'success' : 'error',
                error: envResult.success ? undefined : envResult.message,
                details: envResult.success ? 'All required environment variables are properly configured' : undefined
              }
            : conn
        ))
      } catch (error) {
        setConnections(prev => prev.map(conn =>
          conn.name === 'Environment Variables'
            ? {
                ...conn,
                status: 'error',
                error: 'Failed to check environment variables'
              }
            : conn
        ))
      }

      // Test Box connection
      try {
        const boxResponse = await fetch('/api/test/box')
        const boxResult = await boxResponse.json()

        setConnections(prev => prev.map(conn =>
          conn.name === 'Box'
            ? {
                ...conn,
                status: boxResult.success ? 'success' : (boxResult.warning ? 'warning' : 'error'),
                error: boxResult.error,
                details: boxResult.success ? boxResult.message : undefined
              }
            : conn
        ))
      } catch (error) {
        setConnections(prev => prev.map(conn =>
          conn.name === 'Box'
            ? {
                ...conn,
                status: 'error',
                error: 'Failed to test Box connection'
              }
            : conn
        ))
      }

      // Test Google Sheets connection
      try {
        const sheetsResponse = await fetch('/api/test/googlesheets')
        const sheetsResult = await sheetsResponse.json()

        setConnections(prev => prev.map(conn =>
          conn.name === 'Google Sheets'
            ? {
                ...conn,
                status: sheetsResult.success ? 'success' : 'error',
                error: sheetsResult.error,
                details: sheetsResult.success ? sheetsResult.message : undefined
              }
            : conn
        ))
      } catch (error) {
        setConnections(prev => prev.map(conn =>
          conn.name === 'Google Sheets'
            ? {
                ...conn,
                status: 'error',
                error: 'Failed to test Google Sheets connection'
              }
            : conn
        ))
      }

    } finally {
      setChecking(false)
    }
  }

  const getStatusIcon = (status: ConnectionStatus['status']) => {
    switch (status) {
      case 'checking':
        return <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: ConnectionStatus['status']) => {
    switch (status) {
      case 'checking':
        return <Badge variant="secondary">Checking...</Badge>
      case 'success':
        return <Badge className="bg-green-500">Connected</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      case 'warning':
        return <Badge className="bg-yellow-500">Warning</Badge>
    }
  }

  const allConnected = connections.every(conn => conn.status === 'success')
  const hasErrors = connections.some(conn => conn.status === 'error')

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Setup & Configuration</h1>
        <p className="text-gray-600">
          Verify that all API connections are working properly
        </p>
      </div>

      {/* Overall Status */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Connection Status</CardTitle>
            <Button
              onClick={checkConnections}
              disabled={checking}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
              {checking ? 'Checking...' : 'Test Connections'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {allConnected && (
            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-green-700 font-medium">
                All connections are working properly! You're ready to use the application.
              </span>
            </div>
          )}

          {hasErrors && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-700 font-medium">
                Some connections have errors. Please check your configuration.
              </span>
            </div>
          )}

          {!allConnected && !hasErrors && !checking && (
            <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-500" />
              <span className="text-blue-700 font-medium">
                Click "Test Connections" to verify your setup.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Individual Connection Status */}
      <div className="space-y-4 mb-8">
        {connections.map((connection) => (
          <Card key={connection.name}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getStatusIcon(connection.status)}
                  <div>
                    <h3 className="font-semibold text-lg">{connection.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{connection.description}</p>

                    {connection.details && (
                      <p className="text-green-700 text-sm">{connection.details}</p>
                    )}

                    {connection.error && (
                      <p className="text-red-600 text-sm">{connection.error}</p>
                    )}
                  </div>
                </div>
                {getStatusBadge(connection.status)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Configuration Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Environment Variables</h3>
            <p className="text-sm text-gray-600 mb-3">
              Create a <code className="bg-gray-100 px-1 py-0.5 rounded">.env.local</code> file in your project root with these variables:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg text-sm font-mono">
              {`# Box Configuration
BOX_CLIENT_ID=your_box_client_id
BOX_CLIENT_SECRET=your_box_client_secret
BOX_ENTERPRISE_ID=your_box_enterprise_id
BOX_PUBLIC_KEY_ID=your_box_public_key_id
BOX_PRIVATE_KEY="-----BEGIN ENCRYPTED PRIVATE KEY-----
your_private_key_here
-----END ENCRYPTED PRIVATE KEY-----"
BOX_PASSPHRASE=your_box_passphrase
BOX_FOLDER_ID=0

# Google Sheets Configuration
GOOGLE_SHEETS_ID=your_google_sheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
your_private_key
-----END PRIVATE KEY-----"

# Next.js
NEXT_PUBLIC_APP_NAME="Brand USA Event Photos"`}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Box Setup</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>1. Create a Box app with JWT authentication at app.box.com</p>
              <p>2. Generate a keypair and download the config JSON</p>
              <p>3. Contact your Box administrator to authorize the app in the Admin Console</p>
              <p>4. Copy the credentials from the config JSON to your .env.local file</p>
            </div>
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <a href="https://developer.box.com/guides/authentication/jwt/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" />
                Box JWT Documentation
              </a>
            </Button>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Google Sheets Setup</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>1. Create a Google Cloud project and enable the Google Sheets API</p>
              <p>2. Create a service account and download the JSON key file</p>
              <p>3. Create a new Google Sheet and share it with your service account email</p>
              <p>4. Copy the Sheet ID from the URL and add credentials to .env.local</p>
            </div>
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <a href="https://developers.google.com/sheets/api/guides/authorizing" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" />
                Google Sheets API Docs
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}