import { NextResponse } from 'next/server'
import Airtable from 'airtable'

export async function GET() {
  try {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_ACCESS_TOKEN }).base(
      process.env.AIRTABLE_BASE_ID!
    )

    const table = base(process.env.AIRTABLE_TABLE_NAME!)

    // Try to fetch just one record to test the connection
    await table.select({ maxRecords: 1 }).firstPage()

    return NextResponse.json({
      success: true,
      message: 'Successfully connected to Airtable',
      tableName: process.env.AIRTABLE_TABLE_NAME
    })
  } catch (error) {
    console.error('Airtable connection test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to connect to Airtable'
    }, { status: 500 })
  }
}