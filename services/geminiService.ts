
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getSafetyGuidance = async (zoneId: string, description: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a fire safety expert. Provide bilingual instructions (Vietnamese and English) for someone in zone ${zoneId}.
      The designated assembly point instruction is: "${description}".
      
      Mandatory points to include:
      1. Stay low to avoid smoke / Cúi thấp người để tránh khói.
      2. Do not use elevators, use stairs only / Không sử dụng thang máy, chỉ sử dụng cầu thang bộ.
      3. Specific assembly point info: ${description} / Lưu ý điểm tập kết của bạn là: ${description}.
      4. Roll call: Perform roll call at assembly point and report missing persons immediately to supervisors / Thực hiện điểm danh khi ra đến điểm tập kết an toàn và báo cáo lại ngay cho người phụ trách nếu thấy thiếu người.
      
      Format as a clear, urgent list with emojis. Vietnamese first, then English translation for each point. Keep it concise.`,
      config: {
        temperature: 0.4,
        topP: 0.8,
        topK: 40
      }
    });

    return response.text || "Vui lòng giữ bình tĩnh và di chuyển đến điểm tập kết an toàn.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Cúi thấp người, không dùng thang máy, di chuyển đến điểm tập kết an toàn và thực hiện điểm danh.";
  }
};
