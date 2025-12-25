
import { GoogleGenAI } from "@google/genai";

export const getSafetyGuidance = async (zoneId: string, description: string) => {
  // Khởi tạo instance ngay khi cần sử dụng để đảm bảo lấy đúng API_KEY từ environment của Vercel/Vite
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Sử dụng model gemini-3 mới nhất theo hướng dẫn
      contents: [{ 
        parts: [{ 
          text: `Tôi đang ở khu vực xưởng/văn phòng: ${zoneId}. Điểm tập kết an toàn được quy định là: ${description}. Hãy đưa ra hướng dẫn an toàn ngắn gọn.` 
        }] 
      }],
      config: {
        systemInstruction: `You are an expert fire safety officer at a large garment factory. 
        Your task is to provide immediate, high-priority evacuation instructions in both Vietnamese and English.
        
        Structure your response:
        1. Actionable safety steps (Low posture, stairs only).
        2. Specific assembly point reminder based on the provided description.
        3. A mandatory roll-call reminder.
        4. Special guidance for Contractors/Visitors: Follow local staff to the nearest point.
        
        Keep it extremely concise with emojis for visibility. Vietnamese first, then English.`,
        temperature: 0.2, // Giảm temperature để phản hồi ổn định và nhanh hơn
      },
    });

    // Truy cập trực tiếp thuộc tính .text (không phải method) theo quy định của SDK
    return response.text || "Vui lòng giữ bình tĩnh và di chuyển đến điểm tập kết an toàn gần nhất.";
  } catch (error) {
    console.error("Gemini API Error details:", error);
    // Fallback message khi có lỗi API
    return "CẢNH BÁO: Cúi thấp người tránh khói. Di chuyển ngay bằng cầu thang bộ đến: " + description + ". Thực hiện điểm danh ngay khi đến nơi.";
  }
};
