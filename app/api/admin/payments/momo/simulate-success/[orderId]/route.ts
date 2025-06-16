import { NextRequest, NextResponse } from "next/server";

export async function POST(
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

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/payments/momo/simulate-success/${orderId}`, {
            method: 'POST',
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
        console.error("Error simulating Momo payment success:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Có lỗi xảy ra khi mô phỏng thanh toán" },
            { status: 500 }
        );
    }
} 