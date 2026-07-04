import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { OrderService } from "@/src/lib/services/order.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SepayWebhookPayload = {
  [key: string]: unknown;
  id?: number | string;
  gateway?: string;
  transactionDate?: string;
  accountNumber?: string;
  subAccount?: string | null;
  amountIn?: number;
  amountOut?: number;
  transferAmount?: number;
  accumulated?: number;
  code?: string | null;
  transactionContent?: string;
  referenceNumber?: string;
  referenceCode?: string;
  body?: string;
  content?: string;
  description?: string;
  paymentContent?: string;
  transferContent?: string;
  transactionDesc?: string;
};

function normalizeSepaySignature(signature: string | null) {
  if (!signature) return "";

  return signature.trim().toLowerCase().replace(/^sha256=/, "");
}

function createSepaySignaturePayloads(rawBody: string, timestamp: string | null) {
  return [
    rawBody,
    timestamp ? `${timestamp}.${rawBody}` : null,
    timestamp ? `${timestamp}${rawBody}` : null,
  ].filter((payload): payload is string => Boolean(payload));
}

function isValidSepaySignature(
  rawBody: string,
  signature: string,
  timestamp: string | null,
) {
  const secret = process.env.SEPAY_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("Thiếu cấu hình xác thực SePay.");
  }

  if (!/^[a-f0-9]+$/i.test(signature)) return false;

  const actualBuffer = Buffer.from(signature, "hex");
  const signaturePayloads = createSepaySignaturePayloads(rawBody, timestamp);

  return signaturePayloads.some((payload) => {
    const expected = createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    const expectedBuffer = Buffer.from(expected, "hex");

    if (actualBuffer.length !== expectedBuffer.length) return false;

    return timingSafeEqual(actualBuffer, expectedBuffer);
  });
}

function collectPayloadText(value: unknown): string[] {
  if (value == null) return [];

  if (typeof value === "string" || typeof value === "number") {
    return [String(value)];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectPayloadText(item));
  }

  if (typeof value === "object") {
    return Object.values(value).flatMap((item) => collectPayloadText(item));
  }

  return [];
}

function extractOrderNumber(payload: SepayWebhookPayload, rawBody: string) {
  const explicitCode = payload.code?.trim();
  if (explicitCode) return explicitCode.toUpperCase();

  const rawText = [
    payload.transactionContent,
    payload.body,
    payload.content,
    payload.description,
    payload.paymentContent,
    payload.transferContent,
    payload.transactionDesc,
    ...collectPayloadText(payload),
    rawBody,
  ].filter(Boolean).join(" ");

  const match = rawText.match(/\b(?:DH|CC)[-\sA-Z0-9]{4,}\b/i);
  return match?.[0]?.replace(/\s+/g, "").toUpperCase() ?? null;
}

function getTransactionId(payload: SepayWebhookPayload) {
  return String(
    payload.referenceNumber ||
    payload.referenceCode ||
    payload.id ||
    `${payload.gateway ?? "SEPAY"}-${Date.now()}`,
  );
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = normalizeSepaySignature(
    request.headers.get("x-sepay-signature"),
  );
  const timestamp = request.headers.get("x-sepay-timestamp");

  try {
    if (!signature || !isValidSepaySignature(rawBody, signature, timestamp)) {
      console.warn("[sepay-webhook] Chữ ký không hợp lệ.", {
        hasTimestamp: Boolean(timestamp),
        signatureLength: signature.length,
      });

      return NextResponse.json(
        { error: "Chữ ký SePay không hợp lệ." },
        { status: 401 },
      );
    }

    const payload = JSON.parse(rawBody) as SepayWebhookPayload;
    const amountIn = Number(payload.amountIn ?? payload.transferAmount ?? 0);

    if (!Number.isFinite(amountIn) || amountIn <= 0) {
      return NextResponse.json({
        ignored: true,
        message: "Giao dịch không phải tiền vào.",
      });
    }

    const orderNumber = extractOrderNumber(payload, rawBody);
    if (!orderNumber) {
      console.warn("[sepay-webhook] Không tìm thấy mã đơn hàng.", {
        hasCode: Boolean(payload.code),
        hasBody: Boolean(payload.body),
        hasTransactionContent: Boolean(payload.transactionContent),
        payloadKeys: Object.keys(payload),
      });

      return NextResponse.json(
        { error: "Không tìm thấy mã đơn hàng trong giao dịch." },
        { status: 400 },
      );
    }

    const result = await OrderService.confirmSepayPayment({
      amountIn,
      orderNumber,
      transactionDate: payload.transactionDate,
      transactionId: getTransactionId(payload),
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("[sepay-webhook] Không thể xử lý giao dịch:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Chưa thể xác nhận thanh toán.",
      },
      { status: 400 },
    );
  }
}
