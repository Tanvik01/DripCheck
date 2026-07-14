// api/style.js — Vercel Serverless Function
// Uses Google Gemini API (gemini-2.5-flash) with vision to analyze clothing photos.

import { GoogleGenAI } from '@google/genai';

const SYSTEM_PROMPT = `You are a fashion stylist. You will be shown photos of clothing items and a desired vibe/aesthetic.
Identify each item (type, color, pattern, formality).
Then select the best combination of items from what was provided to match the requested vibe — do not invent items that were not shown.
You MUST respond with ONLY a raw JSON object. No markdown, no code fences, no explanation before or after. Just the JSON.
Use this exact shape:
{"chosen_items":[{"image_index":0,"role":"top"}],"explanation":"...","vibe_match_score":8,"missing_pieces":""}
Valid roles: top, bottom, shoes, outerwear, accessory.
vibe_match_score must be an integer from 1 to 10.
missing_pieces is a string (empty string if nothing is missing).`;

/**
 * Robustly extract the first valid JSON object from a string.
 * Handles cases where Gemini wraps JSON in markdown fences or adds preamble text.
 */
function extractJSON(text) {
  if (!text) return null;

  // 1. Try direct parse first (ideal case — clean JSON)
  try {
    return JSON.parse(text.trim());
  } catch (_) { /* fall through */ }

  // 2. Strip markdown code fences (```json ... ``` or ``` ... ```)
  const fenceStripped = text
    .replace(/^[\s\S]*?```(?:json)?\s*/i, '')
    .replace(/\s*```[\s\S]*$/i, '')
    .trim();

  try {
    return JSON.parse(fenceStripped);
  } catch (_) { /* fall through */ }

  // 3. Find the first { ... } block using brace matching
  const start = text.indexOf('{');
  if (start === -1) return null;

  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(text.slice(start, i + 1));
        } catch (_) { /* fall through */ }
      }
    }
  }

  return null;
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { images, vibe, regenerate } = req.body;

    // ── Validate inputs ──────────────────────────────────────────
    if (!images || !Array.isArray(images)) {
      return res.status(400).json({ error: 'Images array is required' });
    }
    if (images.length < 2) {
      return res.status(400).json({
        error: 'Please upload at least 2 clothing items to get styled.',
        code: 'TOO_FEW_IMAGES',
      });
    }
    if (images.length > 6) {
      return res.status(400).json({
        error: 'Maximum 6 clothing items allowed.',
        code: 'TOO_MANY_IMAGES',
      });
    }
    if (!vibe || typeof vibe !== 'string' || vibe.trim().length === 0) {
      return res.status(400).json({ error: 'A vibe description is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY environment variable is not set');
      return res.status(500).json({ error: 'Server configuration error.' });
    }

    const ai = new GoogleGenAI({ apiKey });

    // ── Build content parts ──────────────────────────────────────
    const parts = [];

    images.forEach((imageData, index) => {
      let base64Data = imageData;
      let mimeType = 'image/jpeg';

      if (imageData.startsWith('data:')) {
        const match = imageData.match(/^data:([^;]+);base64,(.+)$/s);
        if (match) {
          mimeType = match[1];
          base64Data = match[2];
        }
      }

      parts.push({ text: `[Item ${index}]` });
      parts.push({ inlineData: { mimeType, data: base64Data } });
    });

    const vibePrompt = regenerate
      ? `Vibe: "${vibe.trim()}". Give a DIFFERENT valid outfit combination from the same items if one exists.`
      : `Vibe: "${vibe.trim()}". Select the best outfit combination from the items above.`;

    parts.push({ text: vibePrompt });

    // ── Call Gemini ──────────────────────────────────────────────
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts }],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: regenerate ? 0.9 : 0.4,
        maxOutputTokens: 1024,
        // Ask Gemini to respond with JSON directly
        responseMimeType: 'application/json',
      },
    });

    // ── Extract text from response ───────────────────────────────
    let rawText = '';
    try {
      // @google/genai v2 — response.text is a getter
      rawText = (typeof response.text === 'function' ? response.text() : response.text) ?? '';
    } catch {
      // Fallback: dig into candidates manually
      rawText =
        response?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    }

    console.log('Gemini raw response:', rawText.slice(0, 500));

    // ── Parse JSON (robust) ──────────────────────────────────────
    const parsed = extractJSON(rawText);

    if (!parsed) {
      console.error('Could not extract JSON from:', rawText);
      return res.status(502).json({
        error: 'AI returned an unexpected format. Please try again.',
        code: 'PARSE_ERROR',
      });
    }

    // ── Validate structure ───────────────────────────────────────
    if (
      !parsed.chosen_items ||
      !Array.isArray(parsed.chosen_items) ||
      parsed.chosen_items.length === 0
    ) {
      return res.status(502).json({
        error: 'Could not identify a valid outfit combination. Try different images or vibe.',
        code: 'NO_OUTFIT',
      });
    }

    // Clamp score to 1-10
    if (typeof parsed.vibe_match_score === 'number') {
      parsed.vibe_match_score = Math.min(10, Math.max(1, Math.round(parsed.vibe_match_score)));
    } else {
      parsed.vibe_match_score = 7;
    }

    parsed.missing_pieces = parsed.missing_pieces ?? '';
    parsed.explanation = parsed.explanation ?? '';

    return res.status(200).json(parsed);

  } catch (err) {
    console.error('Gemini API error:', err?.message ?? err);

    if (err.name === 'AbortError' || err.message?.includes('timeout') || err.code === 'ETIMEDOUT') {
      return res.status(504).json({
        error: "Gemini's in the dressing room — took too long. Try again! ⏱️",
        code: 'TIMEOUT',
      });
    }
    if (err.status === 429 || err.message?.includes('quota') || err.message?.includes('rate')) {
      return res.status(429).json({
        error: 'Too many requests. Wait a moment and try again.',
        code: 'RATE_LIMIT',
      });
    }

    return res.status(500).json({
      error: 'Something went wrong in the styling session. Try again!',
      code: 'SERVER_ERROR',
    });
  }
}
