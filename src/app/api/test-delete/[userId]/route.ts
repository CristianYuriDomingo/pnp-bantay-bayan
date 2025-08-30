// Create this file: app/api/test-delete/[userId]/route.ts

import { NextRequest, NextResponse } from 'next/server'

interface RouteContext {
  params: { userId: string }
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  console.log('🧪 TEST GET called for userId:', context.params.userId);
  
  return NextResponse.json({
    message: 'Test GET working!',
    userId: context.params.userId,
    method: 'GET'
  });
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  console.log('🧪 TEST DELETE called for userId:', context.params.userId);
  
  return NextResponse.json({
    message: 'Test DELETE working!',
    userId: context.params.userId,
    method: 'DELETE'
  });
}