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

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/payments/momo/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ invoiceId }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Error creating Momo payment:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Có lỗi xảy ra khi tạo thanh toán" },
            { status: 500 }
        );
    }
} 