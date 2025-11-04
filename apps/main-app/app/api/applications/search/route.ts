import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get('name') || '';
    const sectors = searchParams.get('sectors')?.split(',').filter(Boolean) || [];
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause with fuzzy name search
    const whereClause: any = {};

    if (name.trim()) {
      whereClause.OR = [
        { personalInfo: { firstName: { contains: name, mode: 'insensitive' } } },
        { personalInfo: { lastName: { contains: name, mode: 'insensitive' } } },
        { personalInfo: { email: { contains: name, mode: 'insensitive' } } }
      ];
    }

    if (sectors.length > 0) {
      whereClause.sectors = {
        some: {
          sectorId: {
            in: sectors.map(Number)
          }
        }
      };
    }

    // Get total count for pagination
    const totalCount = await prisma.application.count({
      where: whereClause
    });

    // Get applications with pagination
    const applications = await prisma.application.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        sectors: {
          include: {
            sector: true
          }
        },
        documents: true,
        personalInfo: true
      }
    });

    return NextResponse.json({
      applications,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: skip + limit < totalCount,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Arama sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}