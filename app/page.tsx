'use client'
import Markdown from 'react-markdown'
import { useChat } from '@ai-sdk/react'

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat()

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.length > 0
        ? messages.map((m) => (
            <div
              key={m.id}
              className="whitespace-pre-wrap mb-4 [&_a]:underline"
            >
              <div className="font-bold">
                {m.role === 'user' ? 'User: ' : 'AI: '}
              </div>
              <Markdown
                components={{
                  a: ({ node, ...props }) => (
                    <a target="_blank" rel="noopener noreferrer" {...props} />
                  ),
                }}
              >
                {m.content}
              </Markdown>
              {/* <div dangerouslySetInnerHTML={{ __html: m.content }} /> */}
            </div>
          ))
        : null}

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Ask a question about the TLED site..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  )
}
