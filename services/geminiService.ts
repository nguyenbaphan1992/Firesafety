
import { GoogleGenAI } from "@google/genai";

// Khởi tạo client với API Key từ môi trường
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSafetyGuidance = async (zoneId: string, description: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest', // Sử dụng bản stable để tránh lỗi RPC/XHR trên các model preview
      contents: [
        { 
          parts: [{ text: `Tôi đang ở khu vực ${zoneId}. Điểm tập kết an toàn của tôi là: ${description}. Hãy cho tôi hướng dẫn thoát hiểm khẩn cấp ngay bây giờ.` }] 
        }
      ],
      config: {
        systemInstruction: `You are a fire safety expert at Tinh Loi Factory. 
        Provide bilingual instructions (Vietnamese first, then English) that are urgent, clear, and concise.
        
        Key points to always include:
        1. Low posture for smoke avoidance.
        2. Use stairs only (No elevators).
        3. Mandatory roll call at assembly point.
        4. Special note for Visitors/Contractors: Must follow local fire safety staff and evacuate to the nearest safe assembly point.
        
        Use emojis for visibility. Format as a bulleted list.`,
        temperature: 0.3, // Giảm độ ngẫu nhiên để phản hồi nhanh và chính xác hơn
        topP: 0.8,
        topK: 40
      }
    });

    // Truy cập trực tiếp thuộc tính .text (không phải phương thức)
    return response.text || "Vui lòng giữ bình tĩnh, cúi thấp người và di chuyển ngay đến điểm tập kết an toàn.";
  } catch (error) {
    console.error("Gemini API Error details:", error);
    return "CẢNH BÁO: Di chuyển ngay đến điểm tập kết an toàn. Cúi thấp người tránh khói, không dùng thang máy và báo cáo có mặt khi đến nơi.";
  }
};
