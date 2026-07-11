import Groq from "groq-sdk"
import { logger } from "@/lib/logger"

let groqClient: Groq | null = null

export function getGroqClient(): Groq {
  if (groqClient) {
    return groqClient
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured")
  }

  groqClient = new Groq({ apiKey })
  logger.info("GroqClient", "Initialized Groq client")
  return groqClient
}