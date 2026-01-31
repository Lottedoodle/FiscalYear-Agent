import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";


export async function POST(req: NextRequest) {
   
    const body = await req.json()

    const messages: Array<{ role: string; content: string }> = body.message ?? []

    const prompt = ChatPromptTemplate.fromMessages([
            ['system', 'คุณเป็นจัดการฝ่ายการเงินของบริษัท คุณตอบคำถามให้พนักงานในบริษัทในเรื่องการเงิน'],
            ['user', '{question}'],
    ])

    const model = new ChatOpenAI({
        model: process.env.OPENAI_MODEL_NAME || "gpt-4o-mini", // ชื่อโมเดล
        temperature: 0.7, // ความสร้างสรรค์ของคำตอบ มีระดับ 0-1
        maxTokens: 300, // จำนวนคำตอบสูงสุดที่ต้องการ
    })

    const chain = prompt.pipe(model).pipe(new StringOutputParser())
    
    try {
        const response = await chain.invoke({
            question: messages[0].content ?? ""
        })

        return NextResponse.json({
            content: response,
        })

        } catch (error) {
        console.error("Error:", error)
        return NextResponse.json({ error: "An error occurred" })
        }
        
        const meta = response.response_metadata || {}
        const usedModel = meta.model || meta.model_name || "unknown"

        // ส่งกลับทั้งคำตอบและชื่อโมเดล (จะได้เห็นชัดว่า “ตอบจากโมเดลอะไร”)
        return NextResponse.json({
            content: response.content,
            usedModel,
    })
}