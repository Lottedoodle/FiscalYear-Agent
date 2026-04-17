import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Home | Genius AI Chatbot",
  description: "A chatbot powered by AI and built with Langchain.js and Next.js",
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-sky-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">

      {/* ─── Navigation ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 w-full px-4 py-3 sm:px-6 lg:px-8 bg-white/80 backdrop-blur-md border-b border-sky-100/80 dark:bg-slate-900/80 dark:border-slate-800/80 shadow-sm shadow-sky-100/30 dark:shadow-none">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2.5">
            <div className="h-8 px-3 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-md shadow-sky-200 dark:shadow-sky-900/40 whitespace-nowrap">
              <span className="text-white font-bold text-sm">BKK AI</span>
            </div>
          </div>

          {/* Nav Actions */}
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              asChild
              className="hidden sm:inline-flex text-slate-600 hover:text-sky-600 hover:bg-sky-50 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-md shadow-sky-200 dark:shadow-sky-900/40 rounded-xl px-5 transition-all duration-200"
            >
              <Link href="/auth/sign-up">Sign Up</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <main className="px-4 pt-28 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center animate-fade-in-up">

            {/* Badge */}
            <div className="inline-flex items-center rounded-full border border-sky-200 bg-white/70 backdrop-blur-sm px-4 py-1.5 text-sm text-sky-700 dark:border-sky-800/60 dark:bg-sky-900/30 dark:text-sky-300 mb-8 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
              Driven by AI, RAG, and Document Loading Technologies
            </div>

            {/* Heading */}
            <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl md:text-7xl">
              <span className="inline-block bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-full px-10 py-2 sm:px-12 sm:py-3 mb-4 shadow-xl shadow-sky-200/50 dark:shadow-sky-900/40 border-none">BKK AI</span>
            </h1>

            {/* Description */}
            <p className="mx-auto mt-7 max-w-2xl text-lg text-slate-500 dark:text-slate-400 sm:text-xl leading-relaxed">
              {/* สุดยอดแชทบอทอัจฉริยะที่รวมพลัง AI, RAG, Document Loader &amp; Vector Embeddings และ Tool Calling */}
              An advanced intelligent integrating AI, RAG, Document Loaders, Vector Embeddings, and Tool Calling.
              <br />
              <span className="font-medium text-sky-600 dark:text-sky-400">Seamlessly retrieving data across documents and databases to deliver precise, real-time insights.</span>
              <br className="hidden sm:block" />
              {/* <span className="text-slate-400 dark:text-slate-500 text-base">สร้างด้วย LangChain.js, Next.js, Supabase และ OpenAI GPT-4o-mini</span> */}
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-4">
              <Button
                size="lg"
                asChild
                className="w-full sm:w-auto bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold px-8 py-3 text-lg rounded-xl shadow-lg shadow-sky-200 dark:shadow-sky-900/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                <Link href="/auth/sign-up">Sign Up →</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="w-full sm:w-auto border-sky-200 hover:bg-sky-50 hover:border-sky-300 text-slate-600 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-300 px-8 py-3 text-lg rounded-xl transition-all duration-200"
              >
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
          </div>

          {/* ─── Feature Cards ─── */}
          <div className="mt-24 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {/* Feature 1 */}
            <div className="group rounded-2xl bg-white border border-sky-100 p-7 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-250 dark:bg-slate-800/60 dark:border-slate-700/60">
              <div className="h-11 w-11 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center mb-5 dark:bg-sky-900/40 dark:border-sky-800/40">
                <svg className="h-5 w-5 text-sky-600 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-slate-800 dark:text-white mb-2">RAG &amp; Document Search</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Synergizing multi-source data retrieval from documents and databases with advanced AI agents.<br />
                <span className="text-sky-600 dark:text-sky-400 font-medium">Vector Search + Structured Data</span>
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-2xl bg-white border border-sky-100 p-7 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-250 dark:bg-slate-800/60 dark:border-slate-700/60">
              <div className="h-11 w-11 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center mb-5 dark:bg-sky-900/40 dark:border-sky-800/40">
                <svg className="h-5 w-5 text-sky-600 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-slate-800 dark:text-white mb-2">Tool Calling &amp; Smart Query</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Querying real-time product data, sales metrics, and key information.<br />
                <span className="text-sky-600 dark:text-sky-400 font-medium">Comprehensive Multilingual Capabilities with Fuzzy Search and Partial Matching</span>
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-2xl bg-white border border-sky-100 p-7 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-250 dark:bg-slate-800/60 dark:border-slate-700/60">
              <div className="h-11 w-11 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center mb-5 dark:bg-sky-900/40 dark:border-sky-800/40">
                <svg className="h-5 w-5 text-sky-600 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-slate-800 dark:text-white mb-2">Security &amp; Modern UI</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Secured by Supabase Auth and Row-Level Security (RLS) with a modern, high-performance user interface.<br />
                <span className="text-sky-600 dark:text-sky-400 font-medium">Responsive, TypeScript, Edge Runtime</span>
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group rounded-2xl bg-white border border-sky-100 p-7 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-250 dark:bg-slate-800/60 dark:border-slate-700/60">
              <div className="h-11 w-11 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center mb-5 dark:bg-sky-900/40 dark:border-sky-800/40">
                <svg className="h-5 w-5 text-sky-600 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17l4 4 4-4m-4-5v9" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-slate-800 dark:text-white mb-2">Chat History System</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Securely record and manage conversation history with session-based isolation.<br />
                <span className="text-sky-600 dark:text-sky-400 font-medium">Intelligent Auto-titling, Real-time Updates, and Effortless History Management.</span>
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group rounded-2xl bg-white border border-sky-100 p-7 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-250 dark:bg-slate-800/60 dark:border-slate-700/60">
              <div className="h-11 w-11 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center mb-5 dark:bg-sky-900/40 dark:border-sky-800/40">
                <svg className="h-5 w-5 text-sky-600 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a5 5 0 00-10 0v2a5 5 0 0010 0zM12 17v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-slate-800 dark:text-white mb-2">Advanced Memory Management</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Automated Conversation Compression and Intelligent Context Summarization.<br />
                <span className="text-sky-600 dark:text-sky-400 font-medium">Context Window, Token Counting, Smart Summarization</span>
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group rounded-2xl bg-white border border-sky-100 p-7 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-250 dark:bg-slate-800/60 dark:border-slate-700/60">
              <div className="h-11 w-11 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center mb-5 dark:bg-sky-900/40 dark:border-sky-800/40">
                <svg className="h-5 w-5 text-sky-600 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-slate-800 dark:text-white mb-2">Modern UI &amp; Responsive Design</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Sophisticated Modern UI: Optimized for a seamless experience on mobile, tablet, and desktop.<br />
                <span className="text-sky-600 dark:text-sky-400 font-medium">shadcn/ui, Tailwind CSS, Mobile Friendly</span>
              </p>
            </div>
          </div>

          {/* ─── Stats Banner ─── */}
          <div className="mt-20 rounded-3xl bg-gradient-to-r from-sky-500 to-blue-600 p-10 text-center text-white shadow-xl shadow-sky-200 dark:shadow-sky-900/30 sm:p-14">
            <h2 className="text-3xl font-bold mb-10 sm:text-4xl tracking-tight">Core Advantages that Empower User Confidence and Data Integrity.</h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div>
                <div className="text-5xl font-extrabold sm:text-6xl">10K+</div>
                <div className="mt-2 text-sky-100 text-sm font-medium">Active Users</div>
              </div>
              <div>
                <div className="text-5xl font-extrabold sm:text-6xl">99.9%</div>
                <div className="mt-2 text-sky-100 text-sm font-medium">Uptime &amp; Reliability</div>
              </div>
              <div>
                <div className="text-5xl font-extrabold sm:text-6xl">5+</div>
                <div className="mt-2 text-sky-100 text-sm font-medium">Intelligent systems</div>
              </div>
            </div>
            <div className="mt-10 text-base text-sky-100 font-medium">
              24/7 Availability &nbsp;|&nbsp; Comprehensive Multilingual Support &nbsp;|&nbsp; Advanced Enterprise Security
            </div>
          </div>
        </div>
      </main>

      {/* ─── Footer ─── */}
      <footer className="mt-20 border-t border-sky-100 bg-white/60 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2.5 mb-3">
            <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center">
              {/* <span className="text-white font-bold text-xs">BKK AI</span> */}
            </div>
            <span className="text-base font-bold text-slate-800 dark:text-white">BKK AI</span>
          </div>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            © 2026 BKK AI. Built with ❤️ and AI
          </p>
        </div>
      </footer>
    </div>
  )
}