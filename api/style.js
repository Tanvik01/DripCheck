// api/style.js — Vercel Serverless Function
// Uses Google Gemini API with vision to analyze clothing photos and suggest an outfit.

import { GoogleGenAI } from '@google/genai';

const SYSTEM_PROMPT = `You are a fashion stylist. You will be shown photos of clothing items and a desired vibe/aesthetic. Identify each item (type, color, pattern, formality). Then select the best combination of items from what was provided to match the requested vibe — do not invent items that weren't shown. Respond with ONLY valid JSON, no markdown formatting, no preamble, in this exact shape:
{
  "chosen_items": [{"image_index": number, "role": "top"|"bottom"|"shoes"|"outerwear"|"accessory"}],
  "explanation": "2-3 sentences on why this combination fits the vibe, referencing color/silhouette/formality",
  "vibe_match_score": 1-10,
  "missing_pieces": "optional: what item type would improve this outfit if the user had it, or empty string"
}`;

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

    // Validate inputs
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

    // Build the parts array: system instructions + all images + prompt
    const parts = [];

    // Add each image as an inline data part
    images.forEach((imageData, index) => {
      // imageData is base64 string, potentially with data URL prefix
      let base64Data = imageData;
      let mimeType = 'image/jpeg';

      if (imageData.startsWith('data:')) {
        const match = imageData.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          mimeType = match[1];
          base64Data = match[2];
        }
      }

      parts.push({
        text: `[Image ${index}: clothing item ${index + 1}]`,
      });

      parts.push({
        inlineData: {
          mimeType,
          data: base64Data,
        },
      });
    });

    // Add the user prompt
    const vibePrompt = regenerate
      ? `The desired vibe is: "${vibe.trim()}". Please suggest a DIFFERENT valid combination of items than you may have suggested before, if another valid combination exists.`
      : `The desired vibe is: "${vibe.trim()}". Select the best outfit combination from the images provided.`;

    parts.push({ text: vibePrompt });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts }],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: regenerate ? 1.0 : 0.7,
        maxOutputTokens: 1024,
      },
    });

    const rawText = response.text?.trim() || '';

    // Parse JSON response — strip any accidental markdown fences
    let cleanText = rawText
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleanText);
    } catch {
      console.error('Failed to parse Gemini response as JSON:', rawText);
      return res.status(502).json({
        error: 'AI returned an unexpected response format. Please try again.',
        code: 'PARSE_ERROR',
      });
    }

    // Validate structure
    if (
      !parsed.chosen_items ||
      !Array.isArray(parsed.chosen_items) ||
      parsed.chosen_items.length === 0
    ) {
      return res.status(502).json({
        error: 'Could not identify a valid outfit combination. Try different images.',
        code: 'NO_OUTFIT',
      });
    }

    return res.status(200).json(parsed);
  } catch (err) {
    console.error('Gemini API error:', err);

    if (err.message?.includes('timeout') || err.code === 'ETIMEDOUT') {
      return res.status(504).json({
        error: "Claude's in the dressing room — took too long. Try again!",
        code: 'TIMEOUT',
      });
    }

    if (err.status === 429 || err.message?.includes('quota')) {
      return res.status(429).json({
        error: 'Too many requests. Please wait a moment and try again.',
        code: 'RATE_LIMIT',
      });
    }

    return res.status(500).json({
      error: 'Something went wrong in the styling session. Try again!',
      code: 'SERVER_ERROR',
    });
  }
}
