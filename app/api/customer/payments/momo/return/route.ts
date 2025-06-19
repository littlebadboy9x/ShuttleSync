import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const orderId = url.searchParams.get('orderId');
        const resultCode = url.searchParams.get('resultCode');
        const message = url.searchParams.get('message');
        
        console.log('MoMo return callback:', { orderId, resultCode, message });
        
        // Nếu thanh toán thành công, tự động mô phỏng callback để cập nhật trạng thái
        if (resultCode === '0' && orderId) {
            try {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/payments/momo/simulate-success/${orderId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                console.log('Auto-simulated successful payment for customer orderId:', orderId);
            } catch (error) {
                console.error('Error auto-simulating customer payment:', error);
            }
        }
        
        // Redirect về trang customer payment với parameters
        const customerPaymentUrl = new URL('/customer/payment', 'http://localhost:3000');
        if (orderId) customerPaymentUrl.searchParams.set('orderId', orderId);
        if (resultCode) customerPaymentUrl.searchParams.set('resultCode', resultCode);
        if (message) customerPaymentUrl.searchParams.set('message', message);
        
        return NextResponse.redirect(customerPaymentUrl.toString());
    } catch (error) {
        console.error('Error in MoMo return callback:', error);
        
        // Trong trường hợp lỗi, vẫn redirect về customer payment
        return NextResponse.redirect('http://localhost:3000/customer/payment');
    }
} 