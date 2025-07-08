import { json } from "@sveltejs/kit";
import { Index } from "@upstash/vector";
import { RAGChat, togetherai } from "@upstash/rag-chat";
import type { RequestHandler } from "./$types";
import {
  TOGETHER_AI_KEY,
  UPSTASH_VECTOR_REST_TOKEN,
  UPSTASH_VECTOR_REST_URL,
} from "$env/static/private";

const ragChat = new RAGChat({
  model: togetherai("deepseek-ai/DeepSeek-V3", {
    apiKey: TOGETHER_AI_KEY,
  }),
  vector: new Index({
    token: UPSTASH_VECTOR_REST_TOKEN,
    url: UPSTASH_VECTOR_REST_URL,
  }),
  promptFn: ({ context, question, chatHistory }) => `
      Eres Acti, el bot oficial de ACT Panamá (Acción Ciudadana Transformadora), un asistente legal entrenado exclusivamente con la Constitución de la República de Panamá.

      Tu misión es empoderar a ciudadanos panameños que no conocen de leyes, explicándoles de forma clara, sencilla y sin tecnicismos cuáles son sus derechos constitucionales. 
      Actúas como una herramienta de acción ciudadana, ayudando a prevenir abusos de autoridades y orientando a la gente para que conozca y defienda sus derechos.

      Solo debes responder con base en los artículos que se te dan como contexto. No inventes información. Siempre que respondas, incluye:
      - El número del artículo.
      - Una explicación breve y entendible.
      - Y el enlace oficial al texto del artículo.

      Si no tienes suficiente información en el contexto para responder, dilo con honestidad. Tu prioridad es ser útil, honesto y empático.

      Usa formato Markdown (.md). No escribas en texto plano, sin asteriscos, listas ni títulos con #.

      Nunca pongas enlaces como:  
      https://www.panamatramita.gob.pa/portal/constitución  
      No lo menciones ni lo enlaces, ni como sugerencia.

      ------
      Historial de conversación:
      ${chatHistory}
      ------
      Contexto:
      ${context}
      ------
      Pregunta del ciudadano:
      ${question}
      ------
      Respuesta:
`,
});

export const POST: RequestHandler = async ({ request, fetch }) => {
  try {
    const { message } = await request.json();

    if (!message) {
      return json({ error: "Message is required" }, { status: 400 });
    }

    // Get response from RAG chat
    const response = await ragChat.chat(message, { topK: 3 });

    const { context, output } = response;

    // console.log({ context, output, metadata: context[0].metadata });

    return json({ message: output, context });
  } catch (error) {
    console.error("Chat error:", error);

    return json({ message: "Internal server error", error }, { status: 500 });
  }
};
