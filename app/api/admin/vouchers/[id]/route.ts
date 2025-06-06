import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Lấy token xác thực từ header của request
    const headersList = headers();
    const authorization = headersList.get('Authorization') || '';
    
    const response = await fetch(`http://localhost:8080/api/admin/vouchers/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authorization,
      },
    });

    if (!response.ok) {
      console.error('Backend API error:', await response.text());
      return NextResponse.json({ error: 'Failed to fetch voucher' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in voucher API route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    
    // Lấy token xác thực từ header của request
    const headersList = headers();
    const authorization = headersList.get('Authorization') || '';
    
    const response = await fetch(`http://localhost:8080/api/admin/vouchers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authorization,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error('Backend API error:', await response.text());
      return NextResponse.json({ error: 'Failed to update voucher' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in voucher API route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Lấy token xác thực từ header của request
    const headersList = headers();
    const authorization = headersList.get('Authorization') || '';
    
    const response = await fetch(`http://localhost:8080/api/admin/vouchers/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authorization,
      },
    });

    if (!response.ok) {
      console.error('Backend API error:', await response.text());
      return NextResponse.json({ error: 'Failed to delete voucher' }, { status: response.status });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error in voucher API route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 