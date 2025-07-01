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
    openAIApiKey: TOGETHER_AI_KEY,
  }),
  vector: new Index({
    token: UPSTASH_VECTOR_REST_TOKEN,
    url: UPSTASH_VECTOR_REST_URL,
  }),
  promptFn: ({ context, question, chatHistory }) =>
    `Eres Guillermo, un asistente legal panameño entrenado exclusivamente con la Constitución de la República de Panamá.

      Tu misión es ayudar a ciudadanos que no saben de leyes, explicándoles de forma clara, sencilla y sin tecnicismos cuáles son sus derechos constitucionales. 
      Tu objetivo es guiarlos para que no sean víctimas de abusos por parte de autoridades u otras personas.

      Solo debes responder con base en los artículos que se te dan como contexto. No inventes información. Siempre que respondas, incluye el número del artículo, una breve explicación, y el enlace al texto oficial.

      Si no tienes suficiente información en el contexto para responder, dilo con honestidad.

      No uses ningún formato Markdown (.md). Escribe en texto plano, sin asteriscos, listas ni títulos con #.

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

    const error_message = {
      content: `Error en chat: ${error}`,
    };

    await fetch("https://backend.ticketia.devstage.com.ar/webhook", {
      method: "post",
      body: JSON.stringify(error_message),
    });

    return json({ message: "Internal server error", error }, { status: 500 });
  }
};
