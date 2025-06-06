import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const params = {
            orderId: searchParams.get("orderId"),
            requestId: searchParams.get("requestId"),
            amount: searchParams.get("amount"),
            orderInfo: searchParams.get("orderInfo"),
            orderType: searchParams.get("orderType"),
            transId: searchParams.get("transId"),
            resultCode: searchParams.get("resultCode"),
            message: searchParams.get("message"),
            payType: searchParams.get("payType"),
            responseTime: searchParams.get("responseTime"),
            extraData: searchParams.get("extraData") || "",
            signature: searchParams.get("signature")
        };

        // Kiểm tra các tham số bắt buộc
        const requiredParams = ["orderId", "requestId", "amount", "signature"];
        for (const param of requiredParams) {
            if (!params[param as keyof typeof params]) {
                return NextResponse.json(
                    { error: `Thiếu tham số ${param}` },
                    { status: 400 }
                );
            }
        }

        await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/payments/momo/notify`,
            null,
            { params }
        );

        return NextResponse.json({ message: "OK" });
    } catch (error: any) {
        console.error("Error processing MoMo callback:", error);
        return NextResponse.json(
            { error: error.response?.data?.message || "Có lỗi xảy ra" },
            { status: error.response?.status || 500 }
        );
    }
} 