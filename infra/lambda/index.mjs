import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import https from "https";
import crypto from "crypto";

const client = new BedrockRuntimeClient({
  region: process.env.BEDROCK_REGION || "us-east-1",
});

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "prog8111-f830f";
const GOOGLE_CERTS_URL =
  "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

// Cache Google public certs (refreshed every 60 minutes)
let cachedCerts = null;
let certsCachedAt = 0;
const CACHE_TTL_MS = 60 * 60 * 1000;

/**
 * Fetches Google's public certificates for Firebase token verification.
 */
function fetchGoogleCerts() {
  return new Promise((resolve, reject) => {
    https
      .get(GOOGLE_CERTS_URL, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            reject(new Error("Failed to parse Google certs"));
          }
        });
      })
      .on("error", reject);
  });
}

/**
 * Gets (cached) Google public certs.
 */
async function getGoogleCerts() {
  if (cachedCerts && Date.now() - certsCachedAt < CACHE_TTL_MS) {
    return cachedCerts;
  }
  cachedCerts = await fetchGoogleCerts();
  certsCachedAt = Date.now();
  return cachedCerts;
}

/**
 * Base64url decode helper.
 */
function base64urlDecode(str) {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(padded, "base64");
}

/**
 * Verifies a Firebase ID Token using Google's public certificates.
 * Returns the decoded payload if valid, throws if invalid.
 */
async function verifyFirebaseToken(idToken) {
  // 1. Decode header and payload without verification first
  const parts = idToken.split(".");
  if (parts.length !== 3) throw new Error("Invalid token format");

  const header = JSON.parse(base64urlDecode(parts[0]).toString("utf8"));
  const payload = JSON.parse(base64urlDecode(parts[1]).toString("utf8"));

  // 2. Check algorithm
  if (header.alg !== "RS256") throw new Error("Invalid algorithm: " + header.alg);

  // 3. Check standard claims
  const now = Math.floor(Date.now() / 1000);
  if (!payload.exp || payload.exp < now) throw new Error("Token expired");
  if (!payload.iat || payload.iat > now + 300) throw new Error("Token issued in the future");
  if (payload.iss !== `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`)
    throw new Error("Invalid issuer");
  if (payload.aud !== FIREBASE_PROJECT_ID) throw new Error("Invalid audience");
  if (!payload.sub || typeof payload.sub !== "string") throw new Error("Invalid subject");

  // 4. Verify signature with Google's public cert
  const certs = await getGoogleCerts();
  const cert = certs[header.kid];
  if (!cert) throw new Error("Unknown key ID: " + header.kid);

  const signatureInput = parts[0] + "." + parts[1];
  const signature = base64urlDecode(parts[2]);
  const verifier = crypto.createVerify("RSA-SHA256");
  verifier.update(signatureInput);

  if (!verifier.verify(cert, signature)) {
    throw new Error("Invalid signature");
  }

  return payload; // Contains uid, email, etc.
}

const SYSTEM_PROMPT = `You are a personal finance assistant.
Extract the financial transaction from the user's input text.
Respond with ONLY a JSON object (no markdown, no explanation, no code fences).
The JSON must contain exactly these keys:
- "title": (string) short description of the transaction
- "amount": (number) the dollar amount
- "category": (string) one of: Food, Shopping, Transport, Fun, Bills, Salary, Invest, Gift, Bonus, Freelance, Others
- "type": (string) exactly "Income" or "Expense"

If the input is not a valid financial transaction, respond with:
{"title":"Unknown","amount":0,"category":"Others","type":"Expense"}`;

/**
 * Validates and sanitizes the parsed AI response.
 */
function validateParsed(parsed) {
  const validCategories = [
    "Food", "Shopping", "Transport", "Fun", "Bills",
    "Salary", "Invest", "Gift", "Bonus", "Freelance", "Others",
  ];
  const validTypes = ["Income", "Expense"];

  return {
    title: typeof parsed.title === "string" && parsed.title ? parsed.title : "Unknown",
    amount: typeof parsed.amount === "number" && parsed.amount >= 0 ? parsed.amount : 0,
    category: validCategories.includes(parsed.category) ? parsed.category : "Others",
    type: validTypes.includes(parsed.type) ? parsed.type : "Expense",
  };
}

/**
 * Lambda handler — verifies Firebase token, calls Bedrock, returns structured JSON.
 */
export const handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    // ---- Firebase Token Verification ----
    const authHeader = event.headers?.Authorization || event.headers?.authorization || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");

    if (!token) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ success: false, error: "Missing Authorization header." }),
      };
    }

    let firebaseUser;
    try {
      firebaseUser = await verifyFirebaseToken(token);
    } catch (authErr) {
      console.error("Auth failed:", authErr.message);
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ success: false, error: "Invalid or expired token." }),
      };
    }

    console.log("Authenticated user:", firebaseUser.sub);

    // ---- Parse request ----
    const body = JSON.parse(event.body || "{}");
    const { inputText, imageBase64 } = body;

    if (!imageBase64 && (!inputText || typeof inputText !== "string" || inputText.trim() === "")) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Either inputText or imageBase64 is required.",
        }),
      };
    }

    // Build Bedrock payload
    const content = [];
    if (imageBase64) {
      content.push({
        image: {
          format: "jpeg",
          source: { bytes: imageBase64 }
        }
      });
      content.push({ text: "Please extract the transaction details from this receipt/image. If text is also provided, consider it: " + (inputText || "") });
    } else {
      content.push({ text: inputText.trim() });
    }

    const payload = {
      messages: [{ role: "user", content }],
      system: [{ text: SYSTEM_PROMPT }],
      inferenceConfig: {
        temperature: 0.0,
        maxTokens: 256,
      },
    };

    // Invoke Bedrock Nova 2 Lite
    const command = new InvokeModelCommand({
      modelId: process.env.MODEL_ID || "us.amazon.nova-2-lite-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(payload),
    });

    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const outputText = responseBody.output?.message?.content?.[0]?.text || "";

    // Parse model output
    let parsed;
    try {
      const cleaned = outputText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { title: "Unknown", amount: 0, category: "Others", type: "Expense" };
    }

    // Validate and return
    const data = validateParsed(parsed);
    const isValid = data.title !== "Unknown";

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: isValid,
        data,
        ...(!isValid && {
          error: "Could not extract a valid financial transaction from input.",
        }),
      }),
    };
  } catch (err) {
    console.error("Lambda error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: "Internal server error.",
      }),
    };
  }
};
