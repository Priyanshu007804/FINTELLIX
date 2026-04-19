import { google } from "@ai-sdk/google";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getFinancialContext } from "@/lib/ai";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();
    
    // 1. Authenticate user
    const reqHeaders = await headers();
    const session = await auth.api.getSession({
      headers: reqHeaders,
    });

    if (!session || !session.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // 2. Fetch financial context summary
    const financialContext = await getFinancialContext(session.user.id);

    // 3. Define System Prompt
    const systemPrompt = `
      You are "Fintellix AI", a premium, professional financial analyst assistant integrated into the Fintellix Dashboard.
      
      Your goal is to help the user understand their finances, analyze spending patterns, and stay safe from fraud.
      
      CURRENT FINANCIAL DATA FOR THE USER:
      ${financialContext}
      
      GUIDELINES:
      - Be concise, professional, and insightful.
      - Use the financial data provided above to answer specific questions about their spending, budgets, or fraud alerts.
      - If they ask about fraud, explain WHY it might have been flagged (high amount, late night, etc.) based on the context.
      - If they ask for saving advice, suggest specific areas based on their top categories.
      - Do NOT make up data. If you don't have the information, say so.
      - Format your responses using Markdown for readability.
      - ALWAYS maintain a helpful, encouraging, yet secure tone.
    `;

    // 4. Stream response from Gemini
    const modelMessages = await convertToModelMessages(messages);

    const result = await streamText({
      model: google("gemini-2.5-flash"),
      messages: modelMessages,
      system: systemPrompt,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("AI Chat Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
