'use client'
import Markdown from 'react-markdown'
import { useChat } from '@ai-sdk/react'
import { memo } from 'react'

const MessageComponent = memo(({ message }: { message: any }) => (
  <div className="whitespace-pre-wrap mb-4 [&_a]:underline">
    <div className="font-bold">
      {message.role === 'user' ? 'User: ' : 'AI: '}
    </div>
    <Markdown
      components={{
        a: ({ node, ...props }) => (
          <a target="_blank" rel="noopener noreferrer" {...props} />
        ),
        p: ({ children }) => <div className="mb-4">{children}</div>,
      }}
    >
      {message.content}
    </Markdown>
  </div>
))

MessageComponent.displayName = 'MessageComponent'

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat()

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.length > 0
        ? messages.map((m) => <MessageComponent key={m.id} message={m} />)
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
