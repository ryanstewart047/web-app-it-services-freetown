import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    url: 'https://www.itservicesfreetown.com/privacy',
    confirmation_code: 'freetown-it-delete-confirmation',
  });
}

export async function GET() {
  return NextResponse.json({
    url: 'https://www.itservicesfreetown.com/privacy',
    confirmation_code: 'freetown-it-delete-confirmation',
  });
}
