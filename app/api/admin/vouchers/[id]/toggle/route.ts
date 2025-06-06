import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Lấy token xác thực từ header của request
    const headersList = headers();
    const authorization = headersList.get('Authorization') || '';
    
    const response = await fetch(`http://localhost:8080/api/admin/vouchers/${id}/toggle`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authorization,
      },
    });

    if (!response.ok) {
      console.error('Backend API error:', await response.text());
      return NextResponse.json({ error: 'Failed to toggle voucher status' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in voucher toggle API route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 