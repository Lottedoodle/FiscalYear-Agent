// rfce
'use client'

import { useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'

function Chat() {

  // Use useChat hook to manage conversation state
  const { messages, sendMessage, status  } = useChat({
    transport: new DefaultChatTransport({
        api: "/api/chat_04_stream", // Change to the desired API
    })
  })

  // Example of using useState to store text in the input field
  const [input, setInput] = useState("")

  console.log("Input:", input)

  return (
    <div className="max-w-3xl mx-auto w-full mt-20">

        {/* Show Form Input chat message */}
        <form onSubmit={e => {
            e.preventDefault() // Prevent page refresh
            sendMessage({ text: input }) // Send message to AI
            setInput("") // Clear input field after sending message
        }}>
          <input type="text" value={input} onChange={e => setInput(e.target.value)} />
          <button type="submit">Send</button>
        </form>

        {/* Show AI typing status */}
        {
            (status === 'submitted' || status === 'streaming') && 
            <div>AI is thinking...</div>
        }

        {/* Show Messages */}
        {messages.map(m => (
           <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div>
                    {m.parts.map((part, index) => 
                        part.type === 'text' ? (
                            <div key={index} className="whitespace-pre-wrap">{part.text}</div>
                        ) : null
                    )}
                </div>
           </div> 
        ))}
    </div>
  )
}

export default Chat