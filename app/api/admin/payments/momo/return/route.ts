import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const orderId = searchParams.get('orderId');
  const resultCode = searchParams.get('resultCode');
  const message = searchParams.get('message');

  try {
    // Nếu thanh toán thành công, tự động mô phỏng callback để cập nhật trạng thái
    if (resultCode === '0' && orderId) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/payments/momo/simulate-success/${orderId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        console.log('Auto-simulated successful payment for orderId:', orderId);
      } catch (error) {
        console.error('Error auto-simulating payment:', error);
      }
    }

    // Lấy thông tin payment để biết invoice ID
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/payments/momo/status/${orderId}`);
    const data = await response.json();
    
    if (data.success && data.invoiceId) {
      // Redirect về trang chi tiết hóa đơn với thông báo kết quả
      const redirectUrl = new URL(`/admin/invoices/${data.invoiceId}/detail`, request.url);
      
      if (resultCode === '0') {
        redirectUrl.searchParams.set('success', 'true');
        redirectUrl.searchParams.set('message', 'Thanh toán MoMo thành công');
      } else {
        redirectUrl.searchParams.set('error', 'true');
        redirectUrl.searchParams.set('message', message || 'Thanh toán MoMo thất bại');
      }
      
      return NextResponse.redirect(redirectUrl);
    }
  } catch (error) {
    console.error('Error getting payment info:', error);
  }

  // Fallback: redirect về trang danh sách hóa đơn nếu có lỗi
  const fallbackUrl = new URL('/admin/invoices', request.url);
  if (resultCode !== '0') {
    fallbackUrl.searchParams.set('error', 'true');
    fallbackUrl.searchParams.set('message', 'Có lỗi xảy ra với thanh toán MoMo');
  }
  
  return NextResponse.redirect(fallbackUrl);
} 