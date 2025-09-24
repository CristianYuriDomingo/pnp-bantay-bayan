import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET - Fetch all domain templates
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const templates = await prisma.subjectDomainTemplate.findMany({
      where: { isActive: true },
      orderBy: { domainName: 'asc' }
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching domain templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create domain template (placeholder for future implementation)
export async function POST(request: NextRequest) {
  return NextResponse.json({ message: 'Domain template creation not yet implemented' }, { status: 501 });
}