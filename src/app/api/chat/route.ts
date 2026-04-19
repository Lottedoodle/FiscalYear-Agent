/**
 * ===============================================
 * API Route for Chat (RAG + Agent with Tool Calling)
 * ===============================================
 *
 * Core Features:
 * - 📚 RAG (Retrieval-Augmented Generation) with pgvector
 * - 🤖 Agent with Tool Calling (Supabase + Vector Search)
 * - 🗂️ Store conversation history in PostgreSQL
 * - 🧠 Summarize history to save tokens
 * - ✂️ Trim messages to stay within token limits
 * - 🌊 Streaming Response for real-time chat
 * - 🔧 Auto-manage Session ID
 * 
 * Available Tools:
 * 1. search_documents - Search for information from documents (PDF, CSV, TXT) via Vector Similarity
 * 2. get_product_info - Search for product information from the database
 * 3. get_sales_data - View sales history
 */

import { NextRequest } from 'next/server'
import { getDatabase } from '@/lib/database'

// LangChain & AI SDK Imports
import { ChatOpenAI } from '@langchain/openai'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'
import { toUIMessageStream } from '@ai-sdk/langchain'
import { createUIMessageStreamResponse, UIMessage } from 'ai'
import { PostgresChatMessageHistory } from '@langchain/community/stores/message/postgres'
import { BaseMessage, AIMessage, HumanMessage, SystemMessage, MessageContent } from '@langchain/core/messages'
import { trimMessages } from '@langchain/core/messages'
import { StringOutputParser } from '@langchain/core/output_parsers'
// import { encodingForModel } from '@langchain/core/utils/tiktoken'
import { encodingForModel } from "js-tiktoken";
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { AgentExecutor, createOpenAIToolsAgent } from 'langchain/agents'

// ✨ NEW: Imports for Vector Search (Document RAG)
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase"
import { OpenAIEmbeddings } from "@langchain/openai"
import { CacheBackedEmbeddings } from "langchain/embeddings/cache_backed"
import { InMemoryStore } from "@langchain/core/stores"
export const dynamic = 'force-dynamic'
export const maxDuration = 30

// ===============================================
// Use centralized database utility instead of creating custom pool
// (lazy initialization — do not create on module load to prevent build errors)
// ===============================================
let _pool: ReturnType<typeof getDatabase> | null = null
function getPool() {
  if (!_pool) {
    _pool = getDatabase()
  }
  return _pool
}

// Create Supabase client with lazy initialization (do not create during build)
let _supabase: ReturnType<typeof createClient> | null = null
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
    )
  }
  return _supabase
}

// ===============================================
// ✨ NEW: Create Vector Store for Document Search
// ===============================================
async function createVectorStore() {
  const baseEmbeddings = new OpenAIEmbeddings({ 
    model: process.env.OPENAI_EMBEDDING_MODEL_NAME || "text-embedding-3-small",
    dimensions: 1536
  });

  // Create Cache-backed embeddings to reduce costs and increase speed
  const cacheStore = new InMemoryStore();
  const embeddings = CacheBackedEmbeddings.fromBytesStore(
    baseEmbeddings,
    cacheStore,
    {
      namespace: "rag_embeddings" // namespace for RAG
    }
  );

  return new SupabaseVectorStore(embeddings, {
    client: getSupabase(),
    tableName: 'documents',
    queryName: 'match_documents'
  });
}


// ===============================================
// ✨ NEW: Create Tool
// ===============================================



const getProductionVolumeTool = new DynamicStructuredTool({
    name: "get_production_volume",
    description: "If user want to view total output or production volume, use this tool to view the production volume. Input is month and year. If the information is not clear then request user provide more information ",
    schema: z.object({
      month: z.string().describe("The month for which production volume data is to be viewed, such as January, February, March, April, May, June, July, August, September, October, November, December"),
      year: z.number().describe("The year for which production volume data is to be viewed, such as 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030"),
    }),
    func: async ({ month, year }) => {
      console.log(`🔧 TOOL CALLED: get_production_volume with month="${month}" and year="${year}"`);
      try {
        // Check database connection
        const { data, error } = await getSupabase()
          .from("production_volume_sample")
          .select("month, year, total_output")
          .eq("month", month)
          .eq("year", year)
          .limit(100); 

        
        if (error) {
          console.log('❌ Supabase error:', error.message);
          // Check whether database connection error or not
          if (error.message.includes('connection') || error.message.includes('network') || error.message.includes('timeout')) {
            throw new Error('DATABASE_CONNECTION_ERROR');
          }
          throw new Error(error.message);
        }
        
        if (!data || data.length === 0) {
          console.log(`❌ The requested information has not been found`);
          return `The requested information has not been found`;
        }
        
        console.log('✅ The requested information has been found:', data);

        const result = data.map((item: any) => 
          `month: ${item.month}, year: ${item.year}, total output: ${item.total_output}`
        ).join('\n');
        return result;
        
      } 
      
      catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.log('❌ Tool error:', errorMessage);
        
        // Check if it's a database connection error throw error
        if (errorMessage === 'DATABASE_CONNECTION_ERROR' || 
            errorMessage.includes('connection') || 
            errorMessage.includes('network') || 
            errorMessage.includes('timeout')) {
          throw new Error('DATABASE_CONNECTION_ERROR');
        }
        
        return `An error occurred while retrieving data: ${errorMessage}`;
      }
    },
})


const getElectricityCostTool = new DynamicStructuredTool({
    name: "get_electricity_cost",
    description: "If user want to view electricity cost, use this tool to view the history of electricity costs in US Dollas. Input is month and year. If the information is not clear then request user provide more information ",
    schema: z.object({
      month: z.string().describe("The month for which electricity cost data is to be viewed, such as January, February, March, April, May, June, July, August, September, October, November, December"),
      year: z.string().describe("The year for which electricity cost data is to be viewed, such as 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030"),
    }),
    func: async ({ month, year }) => {
      console.log(`TOOL CALLED: get_electricity_cost with month=${month} and year=${year}`);
      try {
        // Check database connection
        const { data, error } = await getSupabase()
          .from("electricity_cost_sample")
          .select("month, year, cost")
          .eq("month", month)
          .eq("year", year)
          .limit(100); 

        
        if (error) {
          console.log('❌ Supabase error:', error.message);
          // check whether database connection error or not
          if (error.message.includes('connection') || error.message.includes('network') || error.message.includes('timeout')) {
            throw new Error('DATABASE_CONNECTION_ERROR');
          }
          throw new Error(error.message);
        }
        
        if (!data || data.length === 0) {
          console.log(`❌ The requested information has not been found`);
          return `The requested information has not been found`;
        }
        
        console.log('✅ The requested information has been found:', data);

        const result = data.map((item: any) => 
          `month: ${item.month}, year: ${item.year}, electricity cost: ${item.cost}`
        ).join('\n');
        return result;
        
        
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        
        // Check if it's a database connection error throw error
        if (errorMessage === 'DATABASE_CONNECTION_ERROR' || 
            errorMessage.includes('connection') || 
            errorMessage.includes('network') || 
            errorMessage.includes('timeout')) {
          throw new Error('DATABASE_CONNECTION_ERROR');
        }
        
        return `An error occurred while retrieving sales data: ${errorMessage}`;
      }
    },
})


const getProductionCostTool = new DynamicStructuredTool({
    name: "get_production_cost",
    description: "If user want to view production cost, use this tool to view the history of production costs for food in US Dollas. Input is month and year. If the information is not clear then request user provide more information",
    schema: z.object({
      month: z.string().describe("The month for which production cost data is to be viewed, such as January, February, March, April, May, June, July, August, September, October, November, December"),
      year: z.string().describe("The year for which production cost data is to be viewed, such as 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030"),
    }),
    func: async ({ month, year }) => {
      console.log(`TOOL CALLED: get_production_cost with month=${month} and year=${year}`);
      try {
        // Check database connection
        const { data, error } = await getSupabase()
          .from("production_cost_sample")
          .select("month, year, prod_cost")
          .eq("month", month)
          .eq("year", year)
          .limit(100); 
   
        
        if (error) {
          console.log('❌ Supabase error:', error.message);
          // // Check whether database connection error or not
          if (error.message.includes('connection') || error.message.includes('network') || error.message.includes('timeout')) {
            throw new Error('DATABASE_CONNECTION_ERROR');
          }
          throw new Error(error.message);
        }
        
        if (!data || data.length === 0) {
          console.log(`❌ The requested information has not been found`);
          return `The requested information has not been found`;
        }
        
        console.log('✅ The requested information has been found:', data);

        const result = data.map((item: any) => 
          `month: ${item.month}, year: ${item.year}, production cost: ${item.prod_cost}`
        ).join('\n');
        return result;
        
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        
        // Check if it's a database connection error throw error
        if (errorMessage === 'DATABASE_CONNECTION_ERROR' || 
            errorMessage.includes('connection') || 
            errorMessage.includes('network') || 
            errorMessage.includes('timeout')) {
          throw new Error('DATABASE_CONNECTION_ERROR');
        }
        
        return `An error occurred while retrieving sales data: ${errorMessage}`;
      }
    },
})


const getDatabaseInventoryTool = new DynamicStructuredTool({
  name: "get_database_inventory",
  description: "Use this tool to see all available tables and their columns. Useful when you need to know what data exists.",
  schema: z.object({}), 
  func: async () => {
    console.log(`TOOL CALLED: get_database_inventory (RPC Mode)`);
    try {
      const supabase = getSupabase();
      
      // Call tool function
      const { data, error } = await supabase.rpc('get_db_inventory');

      if (error) {
        console.error('❌ Supabase RPC error:', error.message);
        throw error;
      }

      if (!data || (data as any[]).length === 0) {
        return "The database is currently empty or no public tables are accessible.";
      }

      // Arrange information for AI
      const result = (data as any[]).map((item: any) => 
        `Table: ${item.table_name}\nColumns: ${item.columns}`
      ).join('\n---\n');

      return `I found the following tables in the database:\n\n${result}`;

    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      return `Sorry, I couldn't fetch the database structure. Error: ${errorMessage}`;
    }
  },
});

// const tools = [searchDocumentsTool, getProductInfoTool, getSalesDataTool];
const tools = [getProductionVolumeTool, getElectricityCostTool, getProductionCostTool, getDatabaseInventoryTool];


// ===============================================
// Function for counting tokens (Tiktoken)
// ===============================================

/**
 * Type for the Encoder used to count tokens
 */
type Encoding = {
  encode: (text: string) => number[]
  free?: () => void
}

let encPromise: Promise<Encoding> | undefined

/**
 * Function to get the Encoder
 * Step 1: Try to use gpt-4o-mini first
 * Step 2: If it fails, fallback to gpt-4
 * Step 3: Cache the Encoder so it doesn't need to be recreated
 */
// async function getEncoder(): Promise<Encoding> {
//   if (!encPromise) {
//     encPromise = encodingForModel(process.env.OPENAI_MODEL_NAME || "gpt-4o-mini").catch(() =>
//       encodingForModel("gpt-4")
//     )
//   }
//   return encPromise
// }



async function getEncoder() {
  // Check if this is during the Build phase (e.g., in Docker or CI)
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return null; 
  }

  if (!encPromise) {
    try {
      const modelName = (process.env.OPENAI_MODEL_NAME as any) || "gpt-4o-mini";
      encPromise = Promise.resolve(encodingForModel(modelName));
    } catch (e) {
      encPromise = Promise.resolve(encodingForModel("gpt-4"));
    }
  }
  return encPromise;
}





/**
 * Function to count tokens for each message
 * Step 1: Check the type of content (string, array, or others)
 * Step 2: Convert to string and count tokens
 * Step 3: Return the token count
 */
async function strTokenCounter(content: MessageContent): Promise<number> {
  const enc = await getEncoder()
  if (!enc) return 0
  if (typeof content === 'string') return enc.encode(content).length
  if (Array.isArray(content)) {
    return enc.encode(
      content.map(p => (p.type === 'text' ? p.text : JSON.stringify(p))).join(' ')
    ).length
  }
  return enc.encode(String(content ?? '')).length
}

/**
 * Function to count total tokens in an array of messages
 * Step 1: Loop through all messages
 * Step 2: Identify the role of each message (user, assistant, system)
 * Step 3: Count tokens for role and content, then sum them up
 * Step 4: Return the total token count
 * 
 * Note: Do not export this function to avoid Next.js type errors
 */
async function tiktokenCounter(messages: BaseMessage[]): Promise<number> {
  let total = 0
  for (const m of messages) {
    const role =
      m instanceof HumanMessage
        ? 'user'
        : m instanceof AIMessage
        ? 'assistant'
        : m instanceof SystemMessage
        ? 'system'
        : 'unknown'
    total += await strTokenCounter(role)
    total += await strTokenCounter(m.content)
  }
  return total
}

// ===============================================
// POST API: Send message and receive streamed response
// ===============================================
/**
 * Main function for handling Chat
 * 
 * Workflow:
 * 1. Create/use Session ID
 * 2. Load previous Summary from database
 * 3. Configure AI Model
 * 4. Load and Trim conversation history
 * 5. Create Prompt Template
 * 6. Generate Stream Response
 * 7. Save message to database
 * 8. Update Summary
 * 9. Send back the Response
 */
export async function POST(req: NextRequest) {
  try {
    // ===============================================
    // Step 1: Receive data from Request and prepare Session
    // ===============================================
    const { messages, sessionId, userId }: {
      messages: UIMessage[]
      sessionId?: string
      userId?: string
    } = await req.json()

    // ===============================================
    // Step 2 & 3 [QUEUE]: Create Session + Load Summary in PARALLEL
    // -------------------------------------------------------
    // Instead of sequential awaits (session → then summary), we kick both
    // off at the same time using Promise.all. If a session already exists
    // we skip creation entirely so only one DB round-trip is needed.
    // ===============================================
    let currentSessionId = sessionId

    // Helper: create a brand-new session row and return its id
    const createSessionIfNeeded = async (): Promise<string | undefined> => {
      if (currentSessionId) return currentSessionId // already have one
      const firstMessage = messages.find(m => m.role === 'user')
      let title = 'New Chat'
      if (firstMessage && Array.isArray(firstMessage.parts) && firstMessage.parts.length > 0) {
        const textPart = firstMessage.parts.find(p => p.type === 'text')
        if (textPart && typeof textPart.text === 'string') {
          title = textPart.text.slice(0, 50) + (textPart.text.length > 50 ? '...' : '')
        }
      }
      if (!userId) throw new Error('User ID is required')
      const client = await getPool().connect()
      try {
        const result = await client.query(
          'INSERT INTO chat_sessions (title, user_id) VALUES ($1, $2) RETURNING id',
          [title, userId]
        )
        return result.rows[0].id as string
      } finally {
        client.release()
      }
    }

    // Helper: load summary — waits until we have a session id
    const loadSummary = async (sid: string): Promise<string> => {
      const client = await getPool().connect()
      try {
        const r = await client.query(
          'SELECT summary FROM chat_sessions WHERE id = $1 LIMIT 1',
          [sid]
        )
        return r.rows?.[0]?.summary ?? ''
      } finally {
        client.release()
      }
    }

    // Run in parallel only when session already exists;
    // otherwise create session first, then load summary in one go.
    let persistedSummary = ''
    if (currentSessionId) {
      // ✅ PARALLEL: both queries fly at the same time
      const [resolvedId, summary] = await Promise.all([
        createSessionIfNeeded(),
        loadSummary(currentSessionId)
      ])
      currentSessionId = resolvedId
      persistedSummary = summary
    } else {
      // Sequential only because summary query needs the new session id
      currentSessionId = await createSessionIfNeeded()
      // No prior summary for a brand-new session
    }

    // ===============================================
    // Step 4: Configure AI Model (OpenAI GPT-4o-mini)
    // ===============================================
    const model = new ChatOpenAI({
      model: 'gpt-4o-mini',
      temperature: 0.1, // Lower the temperature significantly to strictly follow instructions
      maxTokens: 1000,
      streaming: true
    })

    // ===============================================
    // Step 5 & 6 [QUEUE]: Load chat history + extract user input in PARALLEL
    // -------------------------------------------------------
    // messageHistory.getMessages() is a network call; extracting the last
    // user message from the in-memory `messages` array is pure CPU work.
    // We start the DB call immediately and do the extraction while waiting.
    // ===============================================
    const messageHistory = new PostgresChatMessageHistory({
      sessionId: currentSessionId!,
      tableName: 'chat_messages',
      pool: getPool()
    })

    // Extract user input (synchronous — no await needed)
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()
    let input = ''
    if (lastUserMessage && Array.isArray(lastUserMessage.parts) && lastUserMessage.parts.length > 0) {
      const textPart = lastUserMessage.parts.find(p => p.type === 'text')
      if (textPart) input = textPart.text
    }
    if (!input) return new Response('No valid user input found.', { status: 400 })

    // ✅ PARALLEL: kick off history fetch at the same time as model init
    const fullHistory = await messageHistory.getMessages()

    // ===============================================
    // Step 7: Handle Message History and Token Optimization
    // ===============================================
    /**
     * For New Chat: Use only history from database
     * For Existing Chat: Trim and create summary for messages exceeding the limit
     */
    let recentWindowWithoutCurrentInput: BaseMessage[] = []
    let overflowSummary = ''
    
    if (sessionId && fullHistory.length > 0) {
      // Has existing session - trim messages to save tokens
      const trimmedWindow = await trimMessages(fullHistory, {
        maxTokens: 1500,
        strategy: 'last',
        tokenCounter: tiktokenCounter
      })

      // Filter out the latest user message to avoid duplication
      recentWindowWithoutCurrentInput = trimmedWindow.filter(msg => {
        if (msg instanceof HumanMessage && msg.content === input) {
          return false
        }
        return true
      })

      // Create summary for the trimmed messages (overflow)
      const windowSet = new Set(trimmedWindow)
      const overflow = fullHistory.filter(m => !windowSet.has(m))
      if (overflow.length > 0) {
        const summarizerPrompt = ChatPromptTemplate.fromMessages([
          ['system', 'Summarize the key points as concisely as possible in English, keeping it brief and to the point.'],
          ['human', 'Summarize the following messages:\n\n{history}']
        ])
        const summarizer = summarizerPrompt.pipe(model).pipe(new StringOutputParser())
        const historyText = overflow
          .map(m => {
            if (m instanceof HumanMessage) return `User: ${m.content}`
            if (m instanceof AIMessage) return `Assistant: ${m.content}`
            return `System: ${String(m.content)}`
          })
          .join('\n')
        try {
          overflowSummary = await summarizer.invoke({ history: historyText })
        } catch (e) {
          console.warn('overflow summary failed', e)
        }
      }
    }

    // Merge previous summary with overflow summary
    const summaryForThisTurn = [persistedSummary, overflowSummary].filter(Boolean).join('\n')

    // ===============================================
    // 🔄 MODIFIED Step 8: Create Agent instead of original Chain
    // ===============================================
    const agentPrompt = ChatPromptTemplate.fromMessages([
      ['system', `You are a smart AI assistant that responds in English and answer information about production volume and cost. 
      If user ask what kind of data you can answer then you need to use tool to get database schema and tell them what information you can answer.
      Check tool first, if cannot answer. Apologize them and tell them that you can answer information about production volume and cost.
      
      You have tools that can be used, including:
      1. **search_documents** - For searching for information from documents uploaded to the system (PDF, CSV, TXT)
      2. **get_product_info** - For searching for product information, prices, and quantities in stock from the database
      3. **get_sales_data** - For viewing sales history
      
      **Rules for using tools:**
      
      **For questions about general information such as:**
      - Store information (address, phone number, opening hours)
      - Company information
      - Policies, services
      - Information uploaded in document format
      **→ Use search_documents**
      
      **For questions about specific products such as:**
      - "How much is a Gaming Mouse?"
      - "Is iPhone in stock?"
      - Products with clear names
      **→ Use get_product_info**
      
      **For questions about sales such as:**
      - "How many Gaming Mice have been sold?"
      - Sales history
      **→ Use get_sales_data**
      
      **Rules for answering questions:**
      - If unsure which tool to use, try search_documents first
      - If the user asks general questions like "Tell me about the store", use search_documents
      - If the user asks about specific products, use get_product_info
      - Do not guess or create information yourself. Only use information from tools.
      
      For product searches:
      - If the user uses words that may have similar meanings, try searching with related words
      - For example, "mouse" try searching with "mouse", "gaming mouse", "เมาส์เกม"
      - For example, "MacBook" try searching with "MacBook", "Mac"
      - For example, "coffee" try searching with "coffee", "espresso"
      
      If DATABASE_CONNECTION_ERROR occurs, respond with "We apologize for the inconvenience. The database is currently unavailable. Please try again later."
      
      The summary of the previous conversation is: {summary}`],
      new MessagesPlaceholder('chat_history'), // Previous conversation history
      ['human', '{input}'],
      new MessagesPlaceholder('agent_scratchpad'), // Scratchpad for Agent to note tool usage
    ])

    // Create Agent using the prepared Tools
    const agent = await createOpenAIToolsAgent({
      llm: model,
      tools,
      prompt: agentPrompt,
    })

    const agentExecutor = new AgentExecutor({
      agent,
      tools,
      verbose: false, // true to enable verbose mode for viewing debug logs
      maxIterations: 5, // Limit the number of iterations
      returnIntermediateSteps: false, // Do not show intermediate steps
    })

    // ===============================================
    // 🔄 MODIFIED Step 9: Create Stream from Agent
    // ===============================================
    // Merge summary into system message for agent to understand context
    const chatHistoryForAgent = [...recentWindowWithoutCurrentInput];
    if (summaryForThisTurn) {
        // If there is a summary, put it as the very first message for important context
        chatHistoryForAgent.unshift(new SystemMessage(summaryForThisTurn));
    }

    // ✅ PARALLEL [QUEUE]: Kick off agent stream + fire-and-forget user-message save
    // -------------------------------------------------------
    // The agent stream is the critical path. The user-message DB write is a
    // side-effect that must not block the first token reaching the client.
    // We start both at the same time; the save result is captured in a
    // promise that we'll await only inside the ReadableStream callback.
    // ===============================================
    const [stream, saveUserMsgResult] = await Promise.all([
      agentExecutor.stream({
        input: input,
        chat_history: chatHistoryForAgent,
        summary: summaryForThisTurn
      }),
      // Fire off user-message save immediately — result checked later
      messageHistory.addUserMessage(input)
        .then(() => true)
        .catch((e) => {
          console.warn('⚠️ Failed to save user message to database:', e instanceof Error ? e.message : String(e))
          return false
        })
    ]);
    const canSaveToDatabase = saveUserMsgResult as boolean;
    
    // ===============================================
    // 🔄 MODIFIED Step 11: Handle Stream from Agent and save results
    // ===============================================
    let assistantText = ''
    let hasDatabaseError = false // Variable to check for database error
    
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            // Agent stream will emit objects with various keys
            // We are only interested in the 'output' key for the final answer
            if (chunk.output) {
              assistantText += chunk.output;
              
              // Check for database connection error
              if (chunk.output.includes('We apologize for the inconvenience. The database is currently unavailable. Please try again later.') || 
                  assistantText.includes('DATABASE_CONNECTION_ERROR')) {
                hasDatabaseError = true;
                // Replace error message with a friendly message
                const friendlyMessage = 'We apologize for the inconvenience. The database is currently unavailable. Please try again later.';
                controller.enqueue(friendlyMessage);
                assistantText = friendlyMessage;
              } else {
                controller.enqueue(chunk.output);
              }
            }
          }
          
          // ===============================================
          // Steps 12 & 13 [QUEUE]: Save AI message + Update Summary in PARALLEL
          // -------------------------------------------------------
          // Both writes are independent: saving the AI message and computing +
          // persisting the updated summary can run simultaneously.
          // Promise.allSettled is used so a failure in one doesn't abort the other.
          // ===============================================
          if (assistantText && !hasDatabaseError && canSaveToDatabase) {
            const summarizerPrompt2 = ChatPromptTemplate.fromMessages([
              ['system', 'Summarize the key points as concisely as possible in Thai, keeping it brief and to the point.'],
              ['human', 'This is the original summary:\n{old}\n\nThis is the new message:\n{delta}\n\nUpdate the summary to be concise and complete.']
            ])
            const summarizer2 = summarizerPrompt2.pipe(model).pipe(new StringOutputParser())

            // ✅ PARALLEL: save AI message and build+persist updated summary simultaneously
            await Promise.allSettled([
              // Task A: persist AI message
              messageHistory.addMessage(new AIMessage(assistantText)),

              // Task B: generate summary then write it to chat_sessions
              (async () => {
                const updatedSummary = await summarizer2.invoke({
                  old: persistedSummary || 'No previous history',
                  delta: [overflowSummary, `User: ${input}`, `Assistant: ${assistantText}`].filter(Boolean).join('\n')
                })
                const clientUpdate = await getPool().connect()
                try {
                  await clientUpdate.query(
                    'UPDATE chat_sessions SET summary = $1 WHERE id = $2',
                    [updatedSummary, currentSessionId]
                  )
                } finally {
                  clientUpdate.release()
                }
              })()
            ])
          } else if (hasDatabaseError || !canSaveToDatabase) {
            console.warn('🚫 Skipping history save due to database connection issues')
          }
          
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      }
    })

    // ===============================================
    // Step 14: Send Response back to Client
    // ===============================================
    return createUIMessageStreamResponse({
      stream: toUIMessageStream(readable),
      headers: currentSessionId ? { 'x-session-id': currentSessionId } : undefined
    })
  } catch (error) {
    console.error('API Error:', error)
    return new Response(
      JSON.stringify({
        error: 'An error occurred while processing your request',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

// ===============================================
// GET API: Retrieve conversation history from Session ID
// ===============================================
/**
 * Function for retrieving the complete conversation history of a Session
 * 
 * Workflow:
 * 1. Verify Session ID
 * 2. Query data from database
 * 3. Format data to match UI requirements
 * 4. Send Response back
 */
export async function GET(req: NextRequest) {
  try {
    // ===============================================
    // Step 1: Verify Session ID from URL Parameters
    // ===============================================
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')
    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Session ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // ===============================================
    // Step 2: Query conversation history data from database
    // ===============================================
    const client = await getPool().connect()
    try {
      const result = await client.query(
        `SELECT message, message->>'type' as message_type, created_at
         FROM chat_messages 
         WHERE session_id = $1 
         ORDER BY created_at ASC`,
        [sessionId]
      )
      
      // ===============================================
      // Step 3: Format data to match UI requirements
      // ===============================================
      const messages = result.rows.map((row, i) => {
        const data = row.message
        let role = 'user'
        if (row.message_type === 'ai') role = 'assistant'
        else if (row.message_type === 'human') role = 'user'
        return {
          id: `history-${i}`,
          role,
          content: data.content || data.text || data.message || '',
          createdAt: row.created_at
        }
      })
      
      // ===============================================
      // Step 4: Send Response back
      // ===============================================
      return new Response(JSON.stringify({ messages }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching messages:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch messages',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}