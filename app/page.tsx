'use client'
import React from 'react'
import Markdown from 'react-markdown'
import { useChat } from '@ai-sdk/react'
import { memo, useEffect, useState, useRef } from 'react'
import Image from 'next/image'

const STORAGE_KEY = 'tled_chat_history'
const MAX_HISTORY = 5

const MessageComponent = memo(({ message }: { message: any }) => (
  <div className="whitespace-pre-wrap mb-4 [&_a]:underline">
    {message.role === 'user' ? (
      <div className="flex justify-end">
        <span className="rounded-lg bg-gray-200 px-3 py-1 inline-block">
          {message.content}
        </span>
      </div>
    ) : (
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
    )}
  </div>
))

MessageComponent.displayName = 'MessageComponent'

export default function Chat() {
  const [initialMessages, setInitialMessages] = useState<any[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [welcomeText, setWelcomeText] = useState('')
  const fullWelcomeText =
    "Hi! I'm the TLED Riverbot, ask me anything about TLED."

  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
    initialMessages,
    onFinish: () => {},
  })

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem(STORAGE_KEY)
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData)
          const now = Date.now()
          const twentyFourHours = 24 * 60 * 60 * 1000
          if (parsed.timestamp && now - parsed.timestamp < twentyFourHours) {
            setInitialMessages(parsed.messages)
          } else {
            // Data is too old, clear it
            localStorage.removeItem(STORAGE_KEY)
          }
        } catch (e) {
          console.error('Failed to parse saved messages', e)
        }
      }
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, status])

  // Save messages to localStorage every time messages changes
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      try {
        // Keep only the last MAX_HISTORY interactions (pairs of messages)
        const historyToSave = messages.slice(-MAX_HISTORY * 2)
        const dataToStore = {
          messages: historyToSave,
          timestamp: Date.now(),
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore))
      } catch (error) {
        console.error('Error saving to localStorage:', error)
      }
    }
  }, [messages])

  // Typewriter effect for welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setWelcomeText('')
      let i = 0
      const interval = setInterval(() => {
        setWelcomeText(fullWelcomeText.slice(0, i + 1))
        i++
        if (i === fullWelcomeText.length) clearInterval(interval)
      }, 30)
      return () => clearInterval(interval)
    }
  }, [messages.length])

  // Focus the input on load
  useEffect(() => {
    if (isLoaded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isLoaded])

  if (!isLoaded) {
    return <div>Loading chat history...</div>
  }

  return (
    <>
      <div className="bg-rb-purple text-white py-8 sticky top-0 z-10">
        <header className="flex items-center gap-4 max-w-2xl mx-auto px-8">
          <a title="ACC Home Link" href="http://www.austincc.edu">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 288 100"
              width="110"
            >
              <g className="star">
                <path d="M52.8 32.6L56 8.1l19.3 18.8" fill="#009b7c"></path>
                <path
                  d="M57.4 59.8l3.5-20.6 61.5-15.4-47.1 31.7 20.6 36.1"
                  fill="#007ac2"
                ></path>
                <path
                  d="M37 50.4L7.6 31.1l44.3 9-1.9 15-33.6 38.1"
                  fill="#ef3e42"
                ></path>
                <path
                  d="M28 84.3l29.3-18.6 39.5 32.1-40.7-20.1"
                  fill="#ffd520"
                ></path>
              </g>
              <path
                d="M118.9 66.6c-1.9 4.6-3.8 9.1-5.7 13.7-.4.8-.6 1.7-.8 2.6-.4 2 0 3.8 1.6 5.3.2.2.6.4.6.9h-14.1c4.4-3.9 5.8-9 7.8-13.9 5.2-12.9 10.3-25.9 15.4-38.9.1-.3.2-.5.3-.8.8-2.5 1.4-5-1.6-7.2h14.1c.5.4.6 1.1.8 1.7l18 47.7c1.5 4.1 3.6 7.9 7 10.7.1.1.3.2.2.6h-17c.2-.8.9-1.2 1.3-1.7.9-1.1 1.3-2.3.8-3.8-1.3-4-2.9-7.9-4.4-11.8-.6-1.7-1.3-3.4-2-5.2-7.4.1-14.8.1-22.3.1zm19.9-6.5c-2.8-7.6-5.5-15-8.2-22.5h-.4c-3 7.4-5.9 14.9-9 22.5h17.6zm66.3-30.9V39c-.9-.4-1.6-.7-2.3-1-3.9-1.9-7.9-3.1-12.3-3.2-11.5-.3-20 6.6-22.1 16.7-1.3 6.4-.9 12.8 1.9 18.9 4.1 8.9 13.2 13.5 22.8 12.5 5.5-.6 10.4-2.7 15.2-5.2.5-.3.9-.7 1.8-.6-1.4 3.6-2.8 7.1-4.3 10.7-3.1 1.2-6.3 2-9.5 2.5-8.2 1.2-16.1 0-23.5-3.9-8.7-4.6-13.8-12-15.3-21.6-2.1-13 2.4-23.6 12.8-31.6 4.9-3.8 10.7-5.7 16.9-6.2 5.5-.5 10.9.2 16.2 1.7.6 0 1.1.1 1.7.5zm54.2 0V39c-.9-.4-1.6-.7-2.3-1-3.9-1.9-7.9-3.1-12.3-3.2-11.5-.3-20 6.6-22.1 16.7-1.3 6.4-.9 12.8 1.9 18.9 4.1 8.9 13.2 13.5 22.8 12.5 5.5-.6 10.4-2.7 15.2-5.2.5-.3.9-.7 1.8-.6-1.4 3.6-2.8 7.1-4.3 10.7-3.1 1.2-6.3 2-9.5 2.5-8.2 1.2-16.1 0-23.5-3.9-8.7-4.6-13.8-12-15.3-21.6-2.1-13 2.4-23.6 12.8-31.6 4.9-3.8 10.7-5.7 16.9-6.2 5.5-.5 10.9.2 16.2 1.7.6 0 1.1.1 1.7.5z"
                fill="#fff"
              ></path>
            </svg>
          </a>
          <h1 className="text-4xl">TLED Chatbot</h1>
        </header>
      </div>

      <div className="fixed left-0 right-0 h-36 bg-gradient-to-b from-white to-transparent z-10" />

      <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch relative">
        {messages.length > 0
          ? messages.map((m) => <MessageComponent key={m.id} message={m} />)
          : null}
        {/* Show loading indicator when submitting */}
        {status === 'submitted' && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 rounded-full bg-black animate-[bounce_1s_infinite_0ms]" />
              <div className="w-2 h-2 rounded-full bg-black animate-[bounce_1s_infinite_200ms]" />
              <div className="w-2 h-2 rounded-full bg-black animate-[bounce_1s_infinite_400ms]" />
            </div>
          </div>
        )}
        {/* Input and welcome message fixed at the bottom */}
        <div className="fixed left-1/2 -translate-x-1/2 bottom-0 w-full max-w-md px-2 z-20 pointer-events-none">
          {messages.length === 0 && (
            <div className="flex justify-between items-center mb-2 text-gray-700 bg-gray-100 rounded-lg p-4 shadow animate-none pointer-events-auto">
              <div className="flex-1">
                <span>{welcomeText}</span>
              </div>
              <Image
                src="/rb-avatar.png"
                alt="RB Avatar"
                className="w-12 h-12 ml-4 flex-shrink-0"
                width={48}
                height={48}
              />
            </div>
          )}
          <form onSubmit={handleSubmit} className="pointer-events-auto">
            <input
              ref={inputRef}
              className="w-full p-2 mb-8 border border-gray-300 rounded shadow-xl"
              value={input}
              placeholder="Ask a question about the TLED site..."
              onChange={handleInputChange}
              disabled={status === 'submitted'}
            />
          </form>
        </div>
      </div>
    </>
  )
}
