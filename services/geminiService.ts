import { GoogleGenAI, Type } from "@google/genai";

/**
 * 兼容性处理：
 * 在本地 Vite 环境中，环境变量通常通过 import.meta.env 获取。
 * 这里我们做一个安全的读取，防止 process 未定义导致页面白屏。
 */
const getSafeApiKey = () => {
  try {
    // 优先尝试读取注入的环境变量
    return (process?.env?.API_KEY) || "";
  } catch (e) {
    return "";
  }
};

const ai = new GoogleGenAI({ apiKey: getSafeApiKey() });

// Get deep analysis for MNAV ratio and premium using Gemini 3 Pro
export const getMNAVAnalysis = async (currentMNAV: number, premium: number) => {
  const key = getSafeApiKey();
  if (!key) return "未检测到 API Key，请检查 .env.local 文件配置。";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `分析 MicroStrategy (MSTR) 的当前 MNAV 倍数。当前倍数为 ${currentMNAV.toFixed(2)}，溢价率为 ${premium.toFixed(2)}%。请提供简短的市场见解、历史对比以及这对持有者的意义。用中文回答。`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return "AI 分析模块暂时不可用，请确认 API Key 是否有效且网络环境正常。";
  }
};

// Fetch latest public stats for MSTR using Gemini 3 Pro
export const fetchLatestMSTRStats = async () => {
  const key = getSafeApiKey();
  if (!key) return null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: "请提供 MicroStrategy (MSTR) 最新的比特币持有总量(BTC holdings)和流通股数(Shares outstanding)。以 JSON 格式返回，包含字段 'btcHoldings' (number) 和 'shares' (number) 以及 'sourceDate' (string)。",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            btcHoldings: { type: Type.NUMBER },
            shares: { type: Type.NUMBER },
            sourceDate: { type: Type.STRING }
          },
          required: ["btcHoldings", "shares"]
        }
      }
    });
    return JSON.parse(response.text.trim());
  } catch (error) {
    return null;
  }
};
