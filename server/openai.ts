import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function generateAIResponse(prompt: string, context?: string): Promise<string> {
  try {
    const fullPrompt = context 
      ? `Context: ${context}\n\nUser: ${prompt}\n\nPlease provide a helpful response based on the context and user's message.`
      : prompt;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant in a team collaboration platform. Be concise, friendly, and professional."
        },
        {
          role: "user",
          content: fullPrompt
        }
      ],
      max_tokens: 500,
    });

    return response.choices[0].message.content || "I apologize, but I couldn't generate a response at this time.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate AI response");
  }
}

export async function analyzeSentiment(text: string): Promise<{
  rating: number;
  confidence: number;
  suggestion?: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a sentiment analysis expert. Analyze the sentiment of the text and provide a rating from 1 to 5 stars (1=very negative, 5=very positive), confidence score between 0 and 1, and an optional suggestion for improvement if sentiment is negative. Respond with JSON in this format: { 'rating': number, 'confidence': number, 'suggestion': string }",
        },
        {
          role: "user",
          content: text,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return {
      rating: Math.max(1, Math.min(5, Math.round(result.rating || 3))),
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
      suggestion: result.suggestion,
    };
  } catch (error) {
    console.error("Sentiment analysis error:", error);
    return { rating: 3, confidence: 0.5 };
  }
}

export async function summarizeMessages(messages: string[]): Promise<string> {
  try {
    const messagesText = messages.join("\n");
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes team conversations. Provide a concise summary highlighting key points, decisions, and action items."
        },
        {
          role: "user",
          content: `Please summarize the following conversation:\n\n${messagesText}`
        }
      ],
      max_tokens: 300,
    });

    return response.choices[0].message.content || "Unable to generate summary.";
  } catch (error) {
    console.error("Summary generation error:", error);
    throw new Error("Failed to generate summary");
  }
}

export async function generateTasks(conversationText: string): Promise<{
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
}[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a task extraction expert. Analyze the conversation and extract actionable tasks. Respond with JSON array in this format: [{ 'title': string, 'description': string, 'priority': 'low'|'medium'|'high' }]"
        },
        {
          role: "user",
          content: `Extract actionable tasks from this conversation:\n\n${conversationText}`
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "[]");
    return Array.isArray(result.tasks) ? result.tasks : [];
  } catch (error) {
    console.error("Task generation error:", error);
    return [];
  }
}

export async function autoCompleteMessage(partialMessage: string, context?: string): Promise<string> {
  try {
    const prompt = context 
      ? `Context: ${context}\n\nComplete this message: "${partialMessage}"`
      : `Complete this message in a professional and helpful way: "${partialMessage}"`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are helping to complete a message in a team chat. Provide a natural, contextually appropriate completion that maintains the original tone and intent."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 100,
    });

    return response.choices[0].message.content || partialMessage;
  } catch (error) {
    console.error("Auto-complete error:", error);
    return partialMessage;
  }
}
