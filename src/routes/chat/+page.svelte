<script lang="ts">
  import { PUBLIC_BASE_URL } from "$env/static/public";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import { Badge } from "$lib/components/ui/badge";
  import {
    Send,
    MessageCircle,
    User,
    Plus,
    Loader2,
    ChevronDown,
    ChevronRight,
    BookOpen,
    Heart,
    Scale,
  } from "lucide-svelte";
  import { tick } from "svelte";

  interface Message {
    id: string;
    content: string;
    role: "user" | "assistant";
    timestamp: Date;
    context?: vectorContext[];
  }

  interface ArticuloMetadata {
    titulo: string;
    articulo: string;
    texto: string;
    capitulo?: string;
  }
  interface vectorContext {
    data: string;
    id: string;
    metadata: ArticuloMetadata;
  }

  // Svelte 5 runes for reactive state
  let messages = $state<Message[]>([]);
  let currentMessage = $state("");
  let isLoading = $state(false);
  let streamingContent = $state("");
  let contextInput = $state("");
  let showContextInput = $state(false);
  let showContextDetails = $state(false);

  let messagesContainer: HTMLElement;
  let messageInput: HTMLInputElement;

  // Auto-scroll to bottom when new messages arrive
  $effect(() => {
    if (messages.length > 0 || streamingContent) {
      tick().then(() => {
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      });
    }
  });

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
    streamingContent = "";

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: messageToSend }),
      });

      if (!response.ok) {
        console.error({ response });
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      console.log({ data });

      const {
        message: output,
        context,
      }: { message: string; context: vectorContext[] } = data;

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        content: output,
        role: "assistant",
        timestamp: new Date(),
        context: context, // Agregar contexto al mensaje
      };

      messages = [...messages, assistantMessage];
      streamingContent = "";
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        content:
          "Sorry, there was an error processing your message. Please try again.",
        role: "assistant",
        timestamp: new Date(),
      };
      messages = [...messages, errorMessage];
    } finally {
      isLoading = false;
      messageInput?.focus();
    }
  }

  async function addContext() {
    if (!contextInput.trim()) return;

    try {
      const response = await fetch("/api/chat", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ context: contextInput }),
      });

      if (response.ok) {
        contextInput = "";
        showContextInput = false;
      }
    } catch (error) {
      console.error("Error adding context:", error);
    }
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  function handleContextKeyPress(event: KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      addContext();
    }
  }

  function clearChat() {
    messages = [];
    streamingContent = "";
  }

  function formatTime(date: Date) {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
</script>

<svelte:head>
  <title>Guillermo - Tu Asistente Legal Panameño</title>
</svelte:head>

<div class="flex h-screen bg-background">
  <div class="flex flex-col w-full max-w-4xl mx-auto">
    <!-- Header -->
    <div class="border-b bg-card">
      <div class="flex items-center justify-between p-4">
        <div class="flex items-center gap-3">
          <div class="relative">
            <div
              class="h-12 w-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <Scale class="h-6 w-6 text-white" />
            </div>
            <Heart class="h-4 w-4 text-red-500 absolute -top-1 -right-1" />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-amber-700">
              ¡Hola! Soy Guillermo
            </h1>
            <p class="text-sm text-amber-600">
              Tu amigo que te ayuda con tus derechos 🇵🇦
            </p>
          </div>
        </div>
      </div>

      <!-- Context Input -->
      {#if showContextInput}
        <div class="px-4 pb-4">
          <Card>
            <CardHeader class="pb-3">
              <CardTitle class="text-sm text-amber-700"
                >📚 Enseñarle algo nuevo a Guillermo</CardTitle
              >
            </CardHeader>
            <CardContent class="space-y-3">
              <Input
                bind:value={contextInput}
                placeholder="Cuéntame algo sobre las leyes de Panamá que deba saber..."
                onkeypress={handleContextKeyPress}
                class="border-amber-200 focus:border-amber-400"
              />
              <div class="flex gap-2">
                <Button
                  size="sm"
                  onclick={addContext}
                  disabled={!contextInput.trim()}
                  class="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  Enseñarle esto
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onclick={() => (showContextInput = false)}
                  class="border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  Mejor no
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      {/if}
    </div>

    <!-- Messages Area -->
    <div class="flex-1 overflow-hidden">
      <ScrollArea class="h-full">
        <div bind:this={messagesContainer} class="p-4 space-y-4">
          {#if messages.length === 0}
            <div class="text-center py-12">
              <div
                class="h-16 w-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
              >
                <MessageCircle class="h-8 w-8 text-white" />
              </div>
              <h3 class="text-xl font-bold text-amber-700 mb-2">
                ¡Qué tal! 👋
              </h3>
              <p class="text-amber-600 max-w-md mx-auto leading-relaxed">
                Soy Guillermo, tu amigo panameño que te ayuda a entender tus
                derechos. Pregúntame lo que quieras sobre las leyes de nuestro
                país. ¡Hablemos como panas! 🇵🇦
              </p>
            </div>
          {/if}

          {#each messages as message (message.id)}
            <div
              class="flex gap-3 {message.role === 'user'
                ? 'justify-end'
                : 'justify-start'}"
            >
              {#if message.role === "assistant"}
                <div class="flex-shrink-0">
                  <div
                    class="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md"
                  >
                    <Scale class="h-4 w-4 text-white" />
                  </div>
                </div>
              {/if}

              <div
                class="flex flex-col max-w-[80%] {message.role === 'user'
                  ? 'items-end'
                  : 'items-start'}"
              >
                <Card
                  class={message.role === "user"
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                    : "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 shadow-sm"}
                >
                  <CardContent class="p-3">
                    <p
                      class="text-sm whitespace-pre-wrap {message.role ===
                      'assistant'
                        ? 'text-amber-800'
                        : 'text-white'}"
                    >
                      {message.content}
                    </p>

                    <!-- Mostrar contexto si existe -->
                    {#if message.context && message.context.length > 0}
                      <div class="mt-3 border-t pt-3">
                        <button
                          class="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                          onclick={() =>
                            (showContextDetails = !showContextDetails)}
                        >
                          {#if showContextDetails}
                            <ChevronDown class="h-3 w-3" />
                          {:else}
                            <ChevronRight class="h-3 w-3" />
                          {/if}
                          <BookOpen class="h-3 w-3" />
                          Ver de dónde saqué esta info ({message.context.length}
                          fuentes)
                        </button>

                        {#if showContextDetails}
                          <div class="mt-2 space-y-2">
                            {#each message.context as ctx, index}
                              <div class="bg-background/50 rounded p-2 text-xs">
                                <div class="font-medium text-amber-800 mb-1">
                                  {ctx.metadata.titulo || `Info ${index + 1}`}
                                </div>
                                {#if ctx.metadata.articulo}
                                  <a
                                    href={`${PUBLIC_BASE_URL}/constitucion/${ctx.metadata.articulo}`}
                                    target="_blank"
                                    class="text-amber-600 mb-1"
                                  >
                                    📄 Artículo {ctx.metadata.articulo}
                                  </a>
                                {/if}
                                {#if ctx.metadata.capitulo}
                                  <div class="text-amber-600 mb-1">
                                    📖 {ctx.metadata.capitulo}
                                  </div>
                                {/if}
                                <div class="text-muted-foreground line-clamp-3">
                                  {ctx.data.substring(0, 200)}...
                                </div>
                              </div>
                            {/each}
                          </div>
                        {/if}
                      </div>
                    {/if}
                  </CardContent>
                </Card>
                <div class="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" class="text-xs">
                    {formatTime(message.timestamp)}
                  </Badge>
                  {#if message.context && message.context.length > 0}
                    <Badge
                      variant="outline"
                      class="text-xs border-amber-300 text-amber-700"
                    >
                      📚 {message.context.length} referencias
                    </Badge>
                  {/if}
                </div>
              </div>

              {#if message.role === "user"}
                <div class="flex-shrink-0">
                  <div
                    class="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
                  >
                    <User class="h-4 w-4" />
                  </div>
                </div>
              {/if}
            </div>
          {/each}

          <!-- Streaming Message -->
          {#if streamingContent}
            <div class="flex gap-3 justify-start">
              <div class="flex-shrink-0">
                <div
                  class="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md"
                >
                  <Scale class="h-4 w-4 text-white" />
                </div>
              </div>
              <div class="flex flex-col max-w-[80%] items-start">
                <Card
                  class="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200"
                >
                  <CardContent class="p-3">
                    <p class="text-sm whitespace-pre-wrap text-amber-800">
                      {streamingContent}<span
                        class="animate-pulse text-amber-500">|</span
                      >
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          {/if}

          <!-- Loading Indicator -->
          {#if isLoading && !streamingContent}
            <div class="flex gap-3 justify-start">
              <div class="flex-shrink-0">
                <div
                  class="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md"
                >
                  <Loader2 class="h-4 w-4 text-white animate-spin" />
                </div>
              </div>
              <div class="flex flex-col max-w-[80%] items-start">
                <Card
                  class="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200"
                >
                  <CardContent class="p-3">
                    <p class="text-sm text-amber-600">
                      Déjame pensar un chin... 🤔
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          {/if}
        </div>
      </ScrollArea>
    </div>

    <!-- Input Area -->
    <div class="border-t bg-card p-4">
      <div class="flex gap-2">
        <input
          bind:this={messageInput}
          bind:value={currentMessage}
          placeholder="Pregúntame sobre tus derechos, pana... 💬"
          onkeypress={handleKeyPress}
          disabled={isLoading}
          class="flex-1 flex h-9 w-full rounded-md border border-amber-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-amber-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <Button
          onclick={sendMessage}
          disabled={!currentMessage.trim() || isLoading}
          size="icon"
          class="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md"
        >
          {#if isLoading}
            <Loader2 class="h-4 w-4 animate-spin" />
          {:else}
            <Send class="h-4 w-4" />
          {/if}
        </Button>
      </div>
    </div>
  </div>
</div>
