import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      {/* Back to Home Button - Fixed Position */}
      <div className="fixed hidden lg:block top-6 left-6 z-50">
        <Button variant="ghost" asChild className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      {/* Left Column - Background Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2832&q=80')"
          }}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-400/90 via-sky-500/80 to-blue-500/90" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="max-w-md">
            <div className="flex items-center mb-8">
              <div className="h-12 px-5 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center whitespace-nowrap">
                <span className="text-white font-bold text-lg">BKK AI</span>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold mb-6 leading-tight">
              Welcome to
              <span className="block text-transparent bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text">
                BKK AI
              </span>
            </h1>
            
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              The best AI that understands you best 
              and is ready to help you with anything you need
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 rounded-full bg-green-400"></div>
                <span className="text-blue-100">Real-time Responsiveness</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 rounded-full bg-green-400"></div>
                <span className="text-blue-100">Enterprise-grade Security</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 rounded-full bg-green-400"></div>
                <span className="text-blue-100">Comprehensive Thai Language Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}