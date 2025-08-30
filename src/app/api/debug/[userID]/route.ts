// src/app/api/debug/[userId]/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  console.log('DEBUG GET called for userId:', params.userId);
  
  return NextResponse.json({
    success: true,
    message: 'Debug GET route working!',
    userId: params.userId,
    method: 'GET',
    path: request.nextUrl.pathname,
    timestamp: new Date().toISOString()
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  console.log('DEBUG DELETE called for userId:', params.userId);
  
  return NextResponse.json({
    success: true,
    message: 'Debug DELETE route working!',
    userId: params.userId,
    method: 'DELETE',
    path: request.nextUrl.pathname,
    timestamp: new Date().toISOString()
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  console.log('DEBUG PATCH called for userId:', params.userId);
  
  const body = await request.json().catch(() => ({}));
  
  return NextResponse.json({
    success: true,
    message: 'Debug PATCH route working!',
    userId: params.userId,
    method: 'PATCH',
    body,
    path: request.nextUrl.pathname,
    timestamp: new Date().toISOString()
  });
}