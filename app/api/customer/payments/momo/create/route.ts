import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { invoiceId } = body;

        if (!invoiceId) {
            return NextResponse.json(
                { success: false, message: "Invoice ID is required" },
                { status: 400 }
            );
        }

        // Gọi API backend admin endpoint (tạm thời để test)
        // TODO: Tạo customer endpoint riêng không cần auth
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/payments/momo/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Tạm thời không gửi auth header để test
            },
            body: JSON.stringify({ invoiceId, source: "customer" }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Backend error response:', errorText);
            
            try {
                const errorData = JSON.parse(errorText);
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            } catch (jsonError) {
                // If response is not JSON (e.g., HTML error page)
                throw new Error(`Backend error (${response.status}): ${errorText.substring(0, 200)}...`);
            }
        }

        const responseText = await response.text();
        console.log('Raw backend response:', responseText);
        
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (jsonError) {
            console.error('Failed to parse JSON response:', responseText);
            throw new Error('Backend returned invalid JSON response');
        }
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Error creating Momo payment:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Có lỗi xảy ra khi tạo thanh toán Momo" },
            { status: 500 }
        );
    }
} 