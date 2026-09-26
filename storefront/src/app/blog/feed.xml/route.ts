import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

export async function GET() {
  try {
    const res = await fetch(`${API_BASE_URL}/blog/feed.xml`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/xml, text/xml',
      },
    });

    if (!res.ok) {
      return new NextResponse('Failed to generate RSS feed', { status: 500 });
    }

    const xmlText = await res.text();

    return new NextResponse(xmlText, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (err) {
    return new NextResponse('Internal server error fetching RSS feed', { status: 500 });
  }
}
