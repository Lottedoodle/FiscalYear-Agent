import { NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";


// // Example
// const llm = new ChatOpenAI({
//     model: "gpt-4o-mini", // ชื่อโมเดล
//     temperature: 0.7, // ความสร้างสรรค์ของคำตอบ มีระดับ 0-1
//     maxTokens: 100, // จำนวนคำตอบสูงสุดที่ต้องการ
//     timeout: 60, // ระยะเวลาในการรอคำตอบ
//     maxRetries: 2, // จำนวนครั้งสูงสุดในการลองใหม่
//     apiKey: "...",  // API Key ของคุณ
//     baseUrl: "...", // URL ของ API
//     organization: "...", // ชื่อองค์กรของคุณ
//     other params... // พารามิเตอร์อื่น ๆ
// })


// // กำหนดข้อความที่ต้องการแปล
// const input = `Translate "I love programming" into Thai.`

// // Model จะทำการแปลข้อความ
// // invoke คือ การเรียกใช้งานโมเดล
// const result = await llm.invoke(input)


// // แสดงผลลัพธ์
// console.log(result)


export async function POST() {

    // const body = await req.json()

    // const messages: Array<{ role: string; content: string }> = body.messages ?? []

    // const prompt = ChatPromptTemplate.fromMessages([
    //         ['system', 'คุณเป็นจัดการฝ่ายการเงินของบริษัท คุณตอบคำถามให้พนักงานในบริษัทในเรื่องการเงิน'],
    //         ['user', '{question}'],
    // ])

    const model = new ChatOpenAI({
        model: process.env.OPENAI_MODEL_NAME || "gpt-4o-mini", // ชื่อโมเดล
        temperature: 0.7, // ความสร้างสรรค์ของคำตอบ มีระดับ 0-1
        maxTokens: 300, // จำนวนคำตอบสูงสุดที่ต้องการ
    })


    // const model = new ChatGoogleGenerativeAI({
    //     model: process.env.GOOGLE_MODEL_NAME || "gemini-2.5-flash",
    //     temperature: 0.7,
    //     maxRetries: 2,
    //     maxOutputTokens: 2048,     
    // })


    // const model = new ChatOpenAI({
    //     model: process.env.OLLAMA_MODEL_NAME || "gpt-4o-mini", // ชื่อโมเดล
    //     temperature: 0.7, // ความสร้างสรรค์ของคำตอบ มีระดับ 0-1
    //     maxTokens: 1000, // จำนวนคำตอบสูงสุดที่ต้องการ
    //     configuration: {
    //         baseURL: process.env.OLLAMA_API_BASE || "http://localhost:11434/v1",
    //     },
    //     apiKey: process.env.OLLAMA_API_KEY,
    // })


    // const input = "Translate 'I love programming' into Thai."


    // const response = await model.invoke(input)


    // console.log(response)


    // return NextResponse.json({ message: "Hello from Chat 01 - Start!" })





    try {
    const response = await model.invoke([
        {
            role: "system",
            content:
            "คุณเป็นจัดการฝ่ายการเงินของบริษัท คุญตอบคำถามให้พนักงานในบริษัทในเรื่องการเงิน",
        },
        {
            role: "human", // "human" เป็น alias ของ "user"
            content: "สวัสดีครับ งบประมาณปีนี้เป็นอย่างไรบ้าง?",
        },
    ])

    const meta = response.response_metadata || {}
    const usedModel = meta.model || meta.model_name || "unknown"

    // ส่งกลับทั้งคำตอบและชื่อโมเดล (จะได้เห็นชัดว่า “ตอบจากโมเดลอะไร”)
    return NextResponse.json({
        content: response.content,
        usedModel,
    })

  } catch (error) {
        // Handle error
        console.error("Error:", error)
        return NextResponse.json({ error: "An error occurred" })
  }
}
