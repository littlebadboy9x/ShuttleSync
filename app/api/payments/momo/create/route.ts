import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
    try {
        const { invoiceId } = await req.json();

        if (!invoiceId) {
            return NextResponse.json(
                { error: "Thiếu thông tin hóa đơn" },
                { status: 400 }
            );
        }

        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/payments/momo/create`,
            null,
            {
                params: { invoiceId }
            }
        );

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error("Error creating MoMo payment:", error);
        return NextResponse.json(
            { error: error.response?.data?.message || "Có lỗi xảy ra" },
            { status: error.response?.status || 500 }
        );
    }
} 