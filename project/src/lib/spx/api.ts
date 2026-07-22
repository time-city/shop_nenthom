import crypto from "crypto";

// Environment variables
const SPX_CLIENT_ID = process.env.SPX_CLIENT_ID || "";
const SPX_SECRET_KEY = process.env.SPX_SECRET_KEY || "";
const SPX_API_URL = process.env.SPX_API_URL || "https://api.spx.vn"; // e.g., sandbox or production URL

/**
 * Generate HMAC-SHA256 signature for SPX requests
 * Based on SPX Open API specifications.
 */
export function generateSPXSignature(payloadString: string): string {
  if (!SPX_SECRET_KEY) {
    throw new Error("Missing SPX_SECRET_KEY environment variable");
  }
  
  return crypto
    .createHmac("sha256", SPX_SECRET_KEY)
    .update(payloadString)
    .digest("hex");
}

/**
 * Validate incoming SPX Webhook signature
 */
export function validateSPXWebhookSignature(payloadString: string, signature: string): boolean {
  const expectedSignature = generateSPXSignature(payloadString);
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  );
}

/**
 * A robust wrapper for making outbound SPX API requests.
 * Uses AbortController to enforce an 8-second timeout, preventing 
 * serverless function (Vercel) timeouts if SPX is down.
 */
export async function fetchSPX(endpoint: string, payload: any) {
  if (!SPX_CLIENT_ID) {
    throw new Error("Missing SPX_CLIENT_ID environment variable");
  }

  const url = `${SPX_API_URL}${endpoint}`;
  
  // Format the payload as required by SPX
  const payloadString = JSON.stringify(payload);
  
  // Generate signature
  const signature = generateSPXSignature(payloadString);

  const headers = {
    "Content-Type": "application/json",
    "x-spx-client-id": SPX_CLIENT_ID,
    "x-spx-signature": signature,
    // Add timestamp or other required headers based on strict SPX specs if needed
  };

  // Implement strict 8-second timeout to avoid Vercel 15s/504 errors
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: payloadString,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`SPX API error (${response.status}): ${errorData}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === "AbortError") {
      throw new Error("SPX API request timed out after 8 seconds");
    }
    
    throw error;
  }
}
