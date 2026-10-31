import { NextRequest } from "next/server";
import { generateContentWithFallback, createGeminiClient } from "@/lib/gemini/server";

export type AIProviderType = "groq" | "gemini";

export interface ResolvedAIConfig {
  provider: AIProviderType;
  apiKey: string;
  model: string;
  isUserKey: boolean;
}

/**
 * Resolves the active AI provider configuration:
 * 1. User-supplied key in 'x-user-key' header (auto-detects 'gsk_' as Groq, otherwise Gemini)
 * 2. GROQ_API_KEY environment variable (Default text: openai/gpt-oss-120b, Default vision: qwen/qwen3.8-27b)
 * 3. GEMINI_API_KEY environment variable (gemini-1.5-flash)
 */
export function getAIConfig(req: NextRequest, task: "vision" | "text" = "text"): ResolvedAIConfig | null {
  const userKey = req.headers.get("x-user-key")?.trim();
  const groqEnvKey = process.env.GROQ_API_KEY?.trim();
  const geminiEnvKey = process.env.GEMINI_API_KEY?.trim();

  // 1. User custom key from Settings header
  if (userKey) {
    if (userKey.startsWith("gsk_")) {
      return {
        provider: "groq",
        apiKey: userKey,
        model: task === "vision" ? "qwen/qwen3.8-27b" : "openai/gpt-oss-120b",
        isUserKey: true,
      };
    }
    // Default user key to Gemini
    return {
      provider: "gemini",
      apiKey: userKey,
      model: "gemini-1.5-flash",
      isUserKey: true,
    };
  }

  // 2. Server GROQ_API_KEY (Free, ultra-fast LPU inference)
  if (groqEnvKey) {
    const defaultTextModel =
      process.env.GROQ_MODEL?.trim() ||
      process.env.GROQ_TEXT_MODEL?.trim() ||
      "openai/gpt-oss-120b";
    const defaultVisionModel =
      process.env.GROQ_VISION_MODEL?.trim() || "qwen/qwen3.8-27b";

    const model = task === "vision" ? defaultVisionModel : defaultTextModel;
    return {
      provider: "groq",
      apiKey: groqEnvKey,
      model,
      isUserKey: false,
    };
  }

  // 3. Server GEMINI_API_KEY
  if (geminiEnvKey) {
    let geminiModel = process.env.GEMINI_MODEL?.trim() || "gemini-1.5-flash";
    if (geminiModel === "gemini-2.5-flash" || !geminiModel) {
      geminiModel = "gemini-1.5-flash";
    }
    return {
      provider: "gemini",
      apiKey: geminiEnvKey,
      model: geminiModel,
      isUserKey: false,
    };
  }

  return null;
}

/**
 * Generate multimodal vision completions across Groq or Gemini.
 * Note: openai/gpt-oss-120b is a text reasoning model; vision requests on Groq
 * are automatically routed to Groq's active vision model (qwen/qwen3.8-27b).
 */
export async function generateVisionCompletion({
  config,
  prompt,
  imageBase64,
  mimeType,
}: {
  config: ResolvedAIConfig;
  prompt: string;
  imageBase64: string;
  mimeType: string;
}): Promise<string> {
  if (config.provider === "groq") {
    // If the model set is a text-only model like gpt-oss-120b or decommissioned llama-3.2, route to active vision model
    let visionModel = config.model;
    if (
      visionModel.includes("gpt-oss") ||
      visionModel.includes("llama-3.2-11b") ||
      visionModel.includes("llama-3.2-90b") ||
      !visionModel
    ) {
      visionModel = "qwen/qwen3.8-27b";
    }

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: visionModel,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType};base64,${imageBase64}`,
                  },
                },
              ],
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.1,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        // If Groq vision fails and Gemini fallback is configured, try Gemini vision
        if (process.env.GEMINI_API_KEY) {
          const ai = createGeminiClient(process.env.GEMINI_API_KEY.trim());
          const fallbackRes = await generateContentWithFallback(ai, "gemini-1.5-flash", {
            contents: [
              {
                role: "user",
                parts: [
                  { text: prompt },
                  {
                    inlineData: {
                      data: imageBase64,
                      mimeType,
                    },
                  },
                ],
              },
            ],
          });
          return fallbackRes.text || "";
        }
        throw new Error(`Groq Vision API error (${res.status}): ${errText}`);
      }

      const data = await res.json();
      return data.choices?.[0]?.message?.content || "";
    } catch (err: unknown) {
      if (process.env.GEMINI_API_KEY) {
        try {
          const ai = createGeminiClient(process.env.GEMINI_API_KEY.trim());
          const fallbackRes = await generateContentWithFallback(ai, "gemini-1.5-flash", {
            contents: [
              {
                role: "user",
                parts: [
                  { text: prompt },
                  {
                    inlineData: {
                      data: imageBase64,
                      mimeType,
                    },
                  },
                ],
              },
            ],
          });
          return fallbackRes.text || "";
        } catch {}
      }
      throw err;
    }
  }

  // Gemini Provider
  const ai = createGeminiClient(config.apiKey);
  const response = await generateContentWithFallback(ai, config.model, {
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          {
            inlineData: {
              data: imageBase64,
              mimeType,
            },
          },
        ],
      },
    ],
  });

  return response.text || "";
}

/**
 * Generate text completions across Groq (openai/gpt-oss-120b) or Gemini.
 */
export async function generateTextCompletion({
  config,
  prompt,
}: {
  config: ResolvedAIConfig;
  prompt: string;
}): Promise<string> {
  if (config.provider === "groq") {
    const textModel = config.model || "openai/gpt-oss-120b";

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: textModel,
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.2,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Groq Text API error (${res.status}): ${errText}`);
      }

      const data = await res.json();
      return data.choices?.[0]?.message?.content || "";
    } catch (err: unknown) {
      // Automatic fallback to Gemini if available
      if (process.env.GEMINI_API_KEY) {
        try {
          const ai = createGeminiClient(process.env.GEMINI_API_KEY.trim());
          const fallbackRes = await generateContentWithFallback(ai, "gemini-1.5-flash", {
            contents: prompt,
          });
          return fallbackRes.text || "";
        } catch {}
      }
      throw err;
    }
  }

  // Gemini Provider
  const ai = createGeminiClient(config.apiKey);
  const response = await generateContentWithFallback(ai, config.model, {
    contents: prompt,
  });

  return response.text || "";
}
