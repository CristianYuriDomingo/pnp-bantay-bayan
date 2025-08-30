// app/api/test/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  console.log('🧪 Test API route called');
  
  try {
    return NextResponse.json({
      success: true,
      message: 'Test API route working',
      timestamp: new Date().toISOString(),
      data: {
        test: 'data'
      }
    });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test API failed',
      data: null
    }, { status: 500 });
  }
}

export async function DELETE() {
  console.log('🧪 Test DELETE API route called');
  
  try {
    return NextResponse.json({
      success: true,
      message: 'Test DELETE route working',
      timestamp: new Date().toISOString(),
      data: null
    });
  } catch (error) {
    console.error('Test DELETE API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test DELETE API failed',
      data: null
    }, { status: 500 });
  }
}