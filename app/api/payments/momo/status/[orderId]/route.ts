import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(
    req: NextRequest,
    { params }: { params: { orderId: string } }
) {
    try {
        const { orderId } = params;

        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/payments/momo/status/${orderId}`
        );

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error("Error checking MoMo payment status:", error);
        return NextResponse.json(
            { error: error.response?.data?.message || "Có lỗi xảy ra" },
            { status: error.response?.status || 500 }
        );
    }
} 