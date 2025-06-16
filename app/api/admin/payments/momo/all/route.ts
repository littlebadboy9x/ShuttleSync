import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/payments/momo/all`, {
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
        console.error("Error fetching Momo payments:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Có lỗi xảy ra" },
            { status: 500 }
        );
    }
} 