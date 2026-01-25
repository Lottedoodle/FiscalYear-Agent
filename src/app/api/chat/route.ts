import { NextRequest } from "next/server"
import { ChatOpenAI } from "@langchain/openai"
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages"
import { toUIMessageStream } from "@ai-sdk/langchain"
import { createUIMessageStreamResponse } from "ai"

// กำหนดให้ API นี้ทำงานแบบ Edge Runtime เพื่อประสิทธิภาพที่ดีกว่า
export const runtime = "edge"

// กำหนดเวลาสูงสุดที่ API จะทำงานได้ (เช่น 30 วินาที) 
// ถ้าใช้เวลานานกว่านี้ จะถูกยกเลิก
export const maxDuration = 30 // วินาที

// กำหนด type สำหรับ message ที่รับจาก useChat hook (AI SDK v6+ structure)
interface MessagePart {
  type: "text" | string
  text?: string
}

interface ChatMessage {
  role: "user" | "assistant"
  parts: MessagePart[]
}

// Helper function ดึง text จาก parts array
function getTextContent(parts: MessagePart[]): string {
  return parts
    .filter((part) => part.type === "text" && part.text)
    .map((part) => part.text)
    .join("")
}

export async function POST(req: NextRequest) {
  try {
    // ดึงข้อความจาก request body ที่ส่งมาจาก useChat hook
    const { messages }: { messages: ChatMessage[] } = await req.json()

    // แปลง UIMessage เป็น LangChain message format
    const langchainMessages = [
      new SystemMessage("You are a helpful and friendly AI assistant."),
      ...messages.map((msg) => {
        const content = getTextContent(msg.parts)
        if (msg.role === "user") {
          return new HumanMessage(content)
        } else {
          return new AIMessage(content)
        }
      }),
    ]

    // เลือกรุ่นของโมเดล OpenAI ที่ต้องการใช้
    const model = new ChatOpenAI({
      model: "gpt-4o-mini", // ระบุรุ่น AI model ที่ใช้
      temperature: 0.7, // ความสร้างสรรค์ของคำตอบ (0 = เป็นระบบมาก, 1 = สร้างสรรค์มาก)
      maxTokens: 300, // จำนวน token สูงสุดที่สามารถตอบได้
      streaming: true, // เปิดใช้ streaming response
    })

    // เรียกใช้งาน model.stream โดยตรงพร้อมกับ langchainMessages
    const stream = await model.stream(langchainMessages)

    // ส่ง Response กลับไปให้ Frontend
    const response = createUIMessageStreamResponse({
      stream: toUIMessageStream(stream),
    })

    return response
  } catch (error) {
    // จัดการ error และ log รายละเอียดเพื่อ debug
    console.error("API Error:", error)
    // ส่ง error response กลับไปยัง client
    return new Response(
      JSON.stringify({
        error: "An error occurred while processing your request",
      }),
      {
        status: 500, // HTTP status code สำหรับ Internal Server Error
        headers: { "Content-Type": "application/json" }, // กำหนด content type เป็น JSON
      }
    )
  }
}
