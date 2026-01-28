
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMNAVAnalysis = async (currentMNAV: number, premium: number) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `分析 MicroStrategy (MSTR) 的当前 MNAV 倍数。当前倍数为 ${currentMNAV.toFixed(2)}，溢价率为 ${premium.toFixed(2)}%。请提供简短的市场见解、历史对比以及这对持有者的意义。用中文回答。`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return "无法获取 AI 深度分析。";
  }
};

export const fetchLatestMSTRStats = async () => {
  // Use Gemini to retrieve potentially newer public info about MSTR holdings
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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
