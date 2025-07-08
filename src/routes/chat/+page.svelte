<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import { Badge } from "$lib/components/ui/badge";
  import { Avatar, AvatarFallback } from "$lib/components/ui/avatar/index.js";
  import {
    Send,
    User,
    Loader2,
    Zap,
    FileText,
    ExternalLink,
  } from "lucide-svelte";
  import { tick } from "svelte";
  import { marked } from "marked";

  interface Message {
    id: string;
    content: string;
    role: "user" | "assistant";
    timestamp: Date;
    context?: Array<{
      data: string;
      metadata: {
        titulo?: string;
        articulo?: string;
        capitulo?: string;
      };
    }>;
  }

  // Svelte 5 runes for reactive state
  let messages = $state<Message[]>([]);
  let currentMessage = $state("");
  let isLoading = $state(false);
  let visibleContexts = $state(new Set<string>());

  let messagesContainer: HTMLElement;
  let scrollAreaRef = $state<HTMLElement | null>(null);
  let messageInputElement: any;

  // Auto-scroll to bottom when new messages arrive
  $effect(() => {
    if (messages.length > 0) {
      tick().then(() => {
        if (scrollAreaRef) {
          const viewport = scrollAreaRef.querySelector(
            '[data-slot="scroll-area-viewport"]'
          ) as HTMLElement;
          if (viewport) {
            viewport.scrollTo({
              top: viewport.scrollHeight,
              behavior: "smooth",
            });
          }
        }
      });
    }
  });

  function toggleContextVisibility(messageId: string) {
    if (visibleContexts.has(messageId)) {
      visibleContexts.delete(messageId);
    } else {
      visibleContexts.add(messageId);
    }
    visibleContexts = new Set(visibleContexts);
  }

  async function sendMessage() {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: currentMessage,
      role: "user",
      timestamp: new Date(),
    };

    messages = [...messages, userMessage];
    const messageToSend = currentMessage;
    currentMessage = "";
    isLoading = true;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: messageToSend }),
      });

      // if (!response.ok) {
      //   throw new Error("Failed to send message");
      // }

      const data = await response.json();
      const { message: output, context } = data;

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        content: output,
        role: "assistant",
        timestamp: new Date(),
        context,
      };

      messages = [...messages, assistantMessage];
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        content:
          "Disculpa, hubo un error procesando tu mensaje. Por favor intenta de nuevo.",
        role: "assistant",
        timestamp: new Date(),
      };
      messages = [...messages, errorMessage];
    } finally {
      isLoading = false;
    }
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  function clearChat() {
    messages = [];
  }

  function formatTime(date: Date) {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
</script>

<svelte:head>
  <title>Chat ACT Panamá - Tu Asistente Ciudadano</title>
  <meta name="description" content="Chatea con el asistente de ACT Panamá para entender tus derechos y la Constitución de forma fácil. Empodérate con conocimiento." />
  <meta property="og:title" content="Chat ACT Panamá - Tu Asistente Ciudadano" />
  <meta property="og:description" content="Haz preguntas sobre la Constitución y tus derechos en un lenguaje sencillo. El conocimiento es poder, y el poder es del pueblo." />
  <meta property="og:image" content="/favicon/android-chrome-512x512.png" />
  <meta property="og:url" content="https://actpanama.com/chat" />
  <meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<div class="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
  <div class="flex flex-col w-full max-w-4xl mx-auto">
    <!-- Header -->
    <div class="border-b bg-white/80 backdrop-blur-sm">
      <div class="flex items-center justify-between p-4 sm:p-6">
        <a href="/" class="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <Avatar class="h-8 w-8 sm:h-12 sm:w-12 flex-shrink-0">
            <AvatarFallback
              class="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-sm sm:text-lg"
            >
              ACT
            </AvatarFallback>
          </Avatar>
          <div class="min-w-0 flex-1">
            <h1
              class="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate"
            >
              Chat ACT Panamá
            </h1>
            <p
              class="text-xs sm:text-sm text-slate-600 flex items-center gap-1 truncate"
            >
              <Zap class="h-3 w-3 flex-shrink-0" />
              <span class="truncate">Acción Ciudadana Transformadora</span>
            </p>
          </div>
        </a>
      </div>
    </div>

    <!-- Messages Area -->
    <div class="flex-1 overflow-hidden">
      <ScrollArea bind:ref={scrollAreaRef} class="h-full">
        <div
          bind:this={messagesContainer}
          class="p-2 sm:p-4 space-y-2 sm:space-y-3 chat-messages"
        >
          {#if messages.length === 0}
            <div class="text-center py-6 sm:py-10 px-4">
              <!-- Versión móvil simplificada -->
              <div class="block sm:hidden">
                <div class="flex justify-center mb-4">
                  <div
                    class="bg-gradient-to-br from-blue-600 to-purple-600 rounded-full p-3"
                  >
                    <Zap class="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 class="text-lg font-bold text-slate-800 mb-3">
                  Chat ACT Panamá
                </h3>
                <p class="text-sm text-slate-600 mb-4">
                  Tu asistente para entender tus derechos constitucionales
                </p>
                <div
                  class="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-slate-200"
                >
                  <p class="text-xs text-slate-600 mb-2 font-medium">
                    Pregunta algo como:
                  </p>
                  <p class="text-xs text-slate-700">
                    "¿Cuáles son mis derechos fundamentales?"
                  </p>
                </div>
              </div>

              <!-- Versión desktop completa -->
              <div class="hidden sm:block">
                <div class="relative mx-auto mb-4">
                  <div
                    class="h-20 w-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl"
                  >
                    <Zap class="h-10 w-10 text-white" />
                  </div>
                  <div
                    class="absolute -bottom-2 -right-2 h-8 w-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center"
                  >
                    <User class="h-4 w-4 text-white" />
                  </div>
                </div>
                <h3 class="text-2xl font-bold text-slate-800 mb-3">
                  🤖 ¿Qué hace el bot de ACT Panamá?
                </h3>
                <div class="max-w-2xl mx-auto space-y-4">
                  <p class="text-base text-slate-600 leading-relaxed">
                    El bot de ACT es tu <strong
                      >asistente legal ciudadano</strong
                    >. Te ayuda a entender tus derechos según la Constitución de
                    Panamá, sin palabras complicadas, sin vueltas, y sin que te
                    metan cuentos.
                  </p>

                  <div
                    class="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-slate-200 mb-6"
                  >
                    <h4 class="font-semibold text-slate-800 mb-4">
                      Puedes hacerle preguntas como:
                    </h4>
                    <div class="space-y-2 text-left">
                      <p class="text-slate-700">
                        • ¿La policía me puede revisar sin razón?
                      </p>
                      <p class="text-slate-700">
                        • ¿Qué dice la ley sobre libertad de expresión?
                      </p>
                      <p class="text-slate-700">
                        • ¿Cuáles son mis derechos si me detienen?
                      </p>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div
                      class="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-slate-200"
                    >
                      <div class="text-2xl mb-2">💬</div>
                      <h4 class="font-semibold text-slate-800">
                        Explicaciones fáciles
                      </h4>
                      <p class="text-sm text-slate-600">
                        Te responde con explicaciones fáciles de entender
                      </p>
                    </div>
                    <div
                      class="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-slate-200"
                    >
                      <div class="text-2xl mb-2">📄</div>
                      <h4 class="font-semibold text-slate-800">
                        Citas directas
                      </h4>
                      <p class="text-sm text-slate-600">
                        Cita directamente los artículos de la Constitución
                      </p>
                    </div>
                    <div
                      class="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-slate-200"
                    >
                      <div class="text-2xl mb-2">🔗</div>
                      <h4 class="font-semibold text-slate-800">
                        Links directos
                      </h4>
                      <p class="text-sm text-slate-600">
                        Te manda un link directo para leer la ley completa
                      </p>
                    </div>
                  </div>

                  <p class="text-slate-500 text-sm mt-4">
                    Además, lo puedes usar desde la web o por WhatsApp, pa' que
                    lo tengas siempre a mano 💬
                  </p>
                </div>
              </div>
            </div>
          {/if}

          {#each messages as message (message.id)}
            <div
              class="flex gap-2 sm:gap-4 {message.role === 'user'
                ? 'justify-end'
                : 'justify-start'}"
            >
              {#if message.role === "assistant"}
                <Avatar class="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
                  <AvatarFallback
                    class="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xs font-semibold"
                  >
                    ACT
                  </AvatarFallback>
                </Avatar>
              {/if}

              <div
                class="flex flex-col max-w-[85%] sm:max-w-[75%] {message.role ===
                'user'
                  ? 'items-end'
                  : 'items-start'}"
              >
                <div
                  class={message.role === "user"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl rounded-br-md px-3 py-2 sm:px-4 sm:py-3 shadow-sm"
                    : "bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl rounded-bl-md px-3 py-2 sm:px-4 sm:py-3 shadow-sm"}
                >
                  <div
                    class="text-xs sm:text-sm leading-relaxed {message.role ===
                    'assistant'
                      ? 'text-slate-800'
                      : 'text-white'} prose prose-xs sm:prose-sm max-w-none"
                  >
                    {@html marked(message.content)}
                  </div>

                  {#if message.role === "assistant" && message.context && message.context.length > 0}
                    <button
                      onclick={() => toggleContextVisibility(message.id)}
                      class="mt-3 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <FileText class="h-3 w-3" />
                      {visibleContexts.has(message.id)
                        ? "Ocultar fuentes"
                        : `Ver fuentes (${message.context.length})`}
                    </button>

                    {#if visibleContexts.has(message.id)}
                      <div class="mt-2 space-y-2">
                        {#each message.context as ctx, index}
                          <div
                            class="bg-slate-50 rounded p-3 text-xs border border-slate-200"
                          >
                            <div class="font-medium text-blue-800 mb-1">
                              {ctx.metadata.titulo || `Fuente ${index + 1}`}
                            </div>
                            {#if ctx.metadata.articulo}
                              <a
                                href={`/constitucion/${ctx.metadata.articulo}`}
                                target="_blank"
                                class="text-blue-600 hover:text-blue-800 mb-1 flex items-center gap-1"
                              >
                                <ExternalLink class="h-3 w-3" />
                                📄 Artículo {ctx.metadata.articulo}
                              </a>
                            {/if}
                            {#if ctx.metadata.capitulo}
                              <div class="text-blue-600 mb-1">
                                📖 {ctx.metadata.capitulo}
                              </div>
                            {/if}
                            <div class="text-slate-600 line-clamp-3">
                              {ctx.data.substring(0, 200)}...
                            </div>
                          </div>
                        {/each}
                      </div>
                    {/if}
                  {/if}
                </div>
                <Badge
                  variant="secondary"
                  class="text-xs mt-2 bg-slate-100 text-slate-500"
                >
                  {formatTime(message.timestamp)}
                </Badge>
              </div>

              {#if message.role === "user"}
                <Avatar class="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
                  <AvatarFallback class="bg-slate-200 text-slate-600">
                    <User class="h-3 w-3 sm:h-4 sm:w-4" />
                  </AvatarFallback>
                </Avatar>
              {/if}
            </div>
          {/each}

          <!-- Loading Indicator -->
          {#if isLoading}
            <div class="flex gap-2 sm:gap-4 justify-start">
              <Avatar class="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
                <AvatarFallback
                  class="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xs font-semibold"
                >
                  <Loader2 class="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                </AvatarFallback>
              </Avatar>
              <div class="flex flex-col max-w-[85%] sm:max-w-[75%] items-start">
                <div
                  class="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm"
                >
                  <div class="flex items-center gap-2">
                    <div class="flex space-x-1">
                      <div
                        class="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                      ></div>
                      <div
                        class="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                        style="animation-delay: 0.1s"
                      ></div>
                      <div
                        class="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                        style="animation-delay: 0.2s"
                      ></div>
                    </div>
                    <span class="text-sm text-slate-600"
                      >ACT está escribiendo...</span
                    >
                  </div>
                </div>
              </div>
            </div>
          {/if}
        </div>
      </ScrollArea>
    </div>

    <!-- Input Area -->
    <div class="border-t bg-white/80 backdrop-blur-sm p-3 sm:p-6">
      <div class="max-w-3xl mx-auto">
        <div class="flex gap-2 sm:gap-3 items-end">
          <div class="flex-1 relative">
            <Input
              bind:this={messageInputElement}
              bind:value={currentMessage}
              placeholder="Pregúntame sobre tus derechos constitucionales..."
              onkeypress={handleKeyPress}
              disabled={isLoading}
              class="min-h-[40px] sm:min-h-[48px] pr-10 sm:pr-12 text-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl bg-white/90 backdrop-blur-sm shadow-sm resize-none"
            />
            <div class="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2">
              <Button
                onclick={sendMessage}
                disabled={!currentMessage.trim() || isLoading}
                size="sm"
                class="h-7 w-7 sm:h-8 sm:w-8 p-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-sm rounded-lg"
              >
                {#if isLoading}
                  <Loader2 class="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                {:else}
                  <Send class="h-3 w-3 sm:h-4 sm:w-4" />
                {/if}
              </Button>
            </div>
          </div>
        </div>
        <p class="text-xs text-slate-500 mt-2 text-center px-2">
          ACT Panamá puede cometer errores. Verifica información importante.
        </p>
      </div>
    </div>
  </div>
</div>
