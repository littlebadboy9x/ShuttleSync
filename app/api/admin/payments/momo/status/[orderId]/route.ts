import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: { orderId: string } }
) {
    try {
        const { orderId } = params;

        if (!orderId) {
            return NextResponse.json(
                { success: false, message: "Order ID is required" },
                { status: 400 }
            );
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/payments/momo/status/${orderId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Error checking Momo payment status:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Có lỗi xảy ra khi kiểm tra trạng thái thanh toán" },
            { status: 500 }
        );
    }
} 