import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(request: Request) {
  try {
    // Lấy token xác thực từ header của request
    const headersList = headers();
    const authorization = headersList.get('Authorization') || '';
    
    // Gọi API từ backend với token xác thực
    const response = await fetch('http://localhost:8080/api/admin/vouchers', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authorization,
      },
    });

    // Kiểm tra nếu response không thành công
    if (!response.ok) {
      console.error('Backend API error:', await response.text());
      return NextResponse.json({ error: 'Failed to fetch vouchers' }, { status: response.status });
    }

    // Chuyển đổi response thành JSON
    const data = await response.json();
    
    // Trả về dữ liệu cho client
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in vouchers API route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Lấy token xác thực từ header của request
    const headersList = headers();
    const authorization = headersList.get('Authorization') || '';
    
    const response = await fetch('http://localhost:8080/api/admin/vouchers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authorization,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error('Backend API error:', await response.text());
      return NextResponse.json({ error: 'Failed to create voucher' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in vouchers API route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 