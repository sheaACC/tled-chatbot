import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai'
import { LangChainAdapter, Message } from 'ai'
import { AIMessage, HumanMessage } from '@langchain/core/messages'
import { QdrantVectorStore } from '@langchain/qdrant'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const {
    messages,
  }: {
    messages: Message[]
  } = await req.json()

  const model = new ChatOpenAI({
    model: 'gpt-4o-mini',
    temperature: 0,
  })

  const embeddings = new OpenAIEmbeddings({
    model: 'text-embedding-3-large',
  })

  // Get the last user message for RAG
  const lastUserMessage = messages[messages.length - 1].content

  // Setup vector store and retrieve relevant docs
  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      url: process.env.QDRANT_URL,
      collectionName: 'tled-website',
      apiKey: process.env.QDRANT_KEY,
    }
  )

  const relevantDocs = await vectorStore.similaritySearch(lastUserMessage)
  const context = relevantDocs.map((doc) => doc.pageContent).join('\n')

  // Create messages array with system prompt and context
  // const systemMessage = `You are an assistant designed to help faculty and staff answer questions about the Teaching and Learning Excellence Division (TLED) at Austin Community College. When answering questions, always include relevant URLs from the provided context when they support your answer. Do not include helpful information for students only. Always convert Markdown links to html anchor tags. Always format URLs as html anchor tags with a target="_blank" attribute. Format emails as html anchor tags with a mailto: in the href and a target="_blank" attribute. Use five sentences maximum and keep the answer concise. Always give a url of the webpage where the user can find specific information about their question. Do not generate or fabricate URLs. Only reference URLs that are explicitly provided in the input content or retrieved through a web search. If no valid URL is available, state that clearly without making one up.
  const systemMessage = `You are an assistant designed to help faculty and staff answer questions about the Teaching and Learning Excellence Division (TLED) at Austin Community College. When answering questions, always include relevant URLs from the provided context when they support your answer. Do not include punctuation directly after URLs. Do not include helpful information for students only. Use five sentences maximum and keep the answer concise. Always give a url of the webpage where the user can find specific information about their question. Do not generate or fabricate URLs. Only reference URLs that are explicitly provided in the input content or retrieved through a web search. If no valid URL is available, state that clearly without making one up.

Context: ${context}`

  const augmentedMessages = [
    new HumanMessage(systemMessage),
    ...messages.map((message) =>
      message.role === 'user'
        ? new HumanMessage(message.content)
        : new AIMessage(message.content)
    ),
  ]

  const stream = await model.stream(augmentedMessages as any)

  return LangChainAdapter.toDataStreamResponse(stream)
}

// You are an assistant designed to help faculty and staff answer questions about the Teaching and Learning Excellence Division (TLED) at Austin Community College. When answering questions, include relevant URLs from the provided context when they support your answer. Do not include helpful information for students only. Format URLs as html anchor tags. Use five sentences maximum and keep the answer concise.
