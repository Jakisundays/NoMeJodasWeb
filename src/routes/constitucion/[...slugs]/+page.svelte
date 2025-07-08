<script lang="ts">
  import constitucionData from "../../../lib/constants/constitucion_panama.json";
  import { Button } from "$lib/components/ui/button";

  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import { Input } from "$lib/components/ui/input";
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import {
    ChevronLeft,
    ChevronRight,
    Home,
    BookOpen,
    Search,
    Scale,
    Users,
    Zap,
    Heart,
  } from "lucide-svelte";
  import { page } from "$app/state";
  // import { page } from "$app/stores";

  type ConstitucionData = typeof constitucionData;
  type TitleData = ConstitucionData[keyof ConstitucionData];

  // Reactive state using Svelte 5 runes
  let selectedTitle = $state("");
  let selectedChapter = $state("");
  let selectedArticle = $state("");
  let searchTerm = $state("");

  // Get current path segments
  const slugs = $derived(page.params.slugs ? page.params.slugs.split("/") : []);
  // Get all titles as array
  const titles = $derived(() => Object.keys(constitucionData));

  // Create a global article index for single-parameter navigation
  const globalArticles = $derived(() => {
    const articles: Array<{
      globalIndex: number;
      title: string;
      chapter?: string;
      articleKey: string;
      content: string;
    }> = [];

    let globalIndex = 1;

    titles().forEach((titleKey) => {
      const titleData =
        constitucionData[titleKey as keyof typeof constitucionData];
      if (!titleData) return;

      const hasChapters =
        typeof titleData === "object" && "Capitulos" in titleData;

      if (hasChapters) {
        // Title with chapters
        const chapters = Object.keys((titleData as any).Capitulos);
        chapters.forEach((chapterKey) => {
          const chapterData = (titleData as any).Capitulos[chapterKey];
          Object.entries(chapterData).forEach(([articleKey, content]) => {
            articles.push({
              globalIndex: globalIndex++,
              title: titleKey,
              chapter: chapterKey,
              articleKey,
              content: content as string,
            });
          });
        });
      } else {
        // Title without chapters
        Object.entries(titleData as Record<string, any>).forEach(
          ([articleKey, content]) => {
            articles.push({
              globalIndex: globalIndex++,
              title: titleKey,
              articleKey,
              content: content as string,
            });
          }
        );
      }
    });

    return articles;
  });

  // Derived functions for sidebar navigation
  const currentTitleData = $derived(() => {
    if (!selectedTitle) return null;
    return constitucionData[selectedTitle as keyof typeof constitucionData];
  });

  const chapters = $derived(() => {
    const titleData = currentTitleData();
    if (
      !titleData ||
      typeof titleData !== "object" ||
      !("Capitulos" in titleData)
    ) {
      return [];
    }
    return Object.keys((titleData as any).Capitulos);
  });

  const articles = $derived(() => {
    const titleData = currentTitleData();
    if (!titleData) return [];

    const hasChapters =
      typeof titleData === "object" && "Capitulos" in titleData;

    if (hasChapters && selectedChapter) {
      const chapterData = (titleData as any).Capitulos[selectedChapter];
      return chapterData ? Object.keys(chapterData) : [];
    } else if (!hasChapters) {
      return Object.keys(titleData as Record<string, any>);
    }

    return [];
  });

  const currentArticleContent = $derived(() => {
    const titleData = currentTitleData();
    if (!titleData || !selectedArticle) return "";

    const hasChapters =
      typeof titleData === "object" && "Capitulos" in titleData;

    if (hasChapters && selectedChapter) {
      const chapterData = (titleData as any).Capitulos[selectedChapter];
      return chapterData?.[selectedArticle] || "";
    } else if (!hasChapters) {
      return (titleData as any)[selectedArticle] || "";
    }

    return "";
  });

  const filteredArticles = $derived(() => {
    if (!searchTerm) return articles();
    return articles().filter((article) =>
      article.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Navigation functions
  function selectTitle(title: string) {
    selectedTitle = title;
    selectedChapter = "";
    selectedArticle = "";
  }

  function selectChapter(chapter: string) {
    selectedChapter = chapter;
    selectedArticle = "";
  }

  function selectArticle(article: string) {
    selectedArticle = article;
  }

  function goBack() {
    if (selectedArticle) {
      selectedArticle = "";
    } else if (selectedChapter) {
      selectedChapter = "";
    } else if (selectedTitle) {
      selectedTitle = "";
    }
  }

  // Get filtered content based on URL parameters
  const filteredContent = $derived(() => {
    if (slugs.length === 0) {
      return { type: "home", data: null };
    }

    if (slugs.length === 1) {
      const articleNumber = parseInt(slugs[0]);

      if (isNaN(articleNumber) || articleNumber < 1) {
        return { type: "error", data: "Número de artículo inválido" };
      }

      const article = globalArticles().find(
        (a) => a.globalIndex === articleNumber
      );

      if (!article) {
        return { type: "error", data: "Artículo no encontrado" };
      }

      return {
        type: "article",
        data: {
          title: article.title,
          chapter: article.chapter,
          article: article.articleKey,
          content: article.content,
          globalIndex: article.globalIndex,
        },
      };
    }

    return {
      type: "error",
      data: "URL no válida. Use /constitucion/[número_artículo]",
    };
  });

  // Effect to automatically navigate to article when URL parameter is present
  $effect(() => {
    if (slugs.length === 1) {
      const articleNumber = parseInt(slugs[0]);

      if (!isNaN(articleNumber) && articleNumber >= 1) {
        const article = globalArticles().find(
          (a) => a.globalIndex === articleNumber
        );

        if (article) {
          // Set the navigation state to show the article
          selectedTitle = article.title;
          selectedChapter = article.chapter || "";
          selectedArticle = article.articleKey;
        }
      }
    } else if (slugs.length === 0) {
      // Reset navigation when going to home
      selectedTitle = "";
      selectedChapter = "";
      selectedArticle = "";
    }
  });
</script>

<svelte:head>
  <title>{page.data.title || "Constitución de Panamá - ACT Panamá"}</title>
  <meta
    name="description"
    content={page.data.description ||
      "Explora, busca y entiende la Constitución de la República de Panamá. Un recurso accesible para todos los ciudadanos, impulsado por ACT Panamá."}
  />
  <meta
    property="og:title"
    content={page.data.title || "Constitución de Panamá - ACT Panamá"}
  />
  <meta
    property="og:description"
    content={page.data.description ||
      "Navega por los títulos, capítulos y artículos de la Constitución panameña. Conoce tus derechos y deberes con esta herramienta de ACT Panamá."}
  />
  <meta property="og:image" content="/favicon/android-chrome-512x512.png" />
  <meta
    property="og:url"
    content={`https://actpanama.com/constitucion${page.url.pathname}`}
  />
  <meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<div
  class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50"
>
  <!-- Header simplificado para móvil -->
  <header
    class="bg-white/95 backdrop-blur-lg border-b border-purple-200/50 sticky top-0 z-50"
  >
    <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-14 sm:h-20">
        <div class="flex items-center space-x-2 sm:space-x-3">
          <a
            href="/"
            class="bg-gradient-to-r from-purple-600 to-indigo-600 p-2 sm:p-3 rounded-lg sm:rounded-xl"
          >
            <Scale class="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </a>
          <div>
            <h1 class="text-base sm:text-2xl font-bold text-gray-900">
              Constitución de Panamá
            </h1>
            <a
              href="/"
              class="text-purple-600 text-xs sm:text-sm font-medium hidden sm:block"
            >
              ACT Panamá
            </a>
          </div>
        </div>

        <!-- Navigation simplificada -->
        <nav class="flex items-center space-x-1 sm:space-x-3">
          {#if selectedTitle || selectedChapter || selectedArticle}
            <Button
              variant="ghost"
              size="sm"
              onclick={goBack}
              class="text-purple-700 hover:bg-purple-50 p-2"
            >
              <ChevronLeft class="h-4 w-4" />
              <span class="hidden sm:inline ml-1">Atrás</span>
            </Button>
          {/if}
          <Button
            variant="ghost"
            size="sm"
            onclick={() => {
              selectedTitle = "";
              selectedChapter = "";
              selectedArticle = "";
            }}
            class="text-purple-700 hover:bg-purple-50 p-2"
          >
            <Home class="h-4 w-4" />
            <span class="hidden sm:inline ml-1">Inicio</span>
          </Button>
          <a
            href="https://apps.yappy.com.pa?hash=UOPGue3yMEQIJojeMXVW0TOy1w%2B4LfBBSVRWPO6ZETY%3D&key=C8hilq3a7gspEHCMmmcNCBdLI9NXgVm4RJDH-onEsOA%3D"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              size="sm"
              class="border-blue-300 text-blue-700 hover:bg-blue-50 p-2"
            >
              <Heart class="h-4 w-4" />
              <span class="hidden sm:inline ml-1">Donar</span>
            </Button>
          </a>
        </nav>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-8">
    <div class="flex flex-col lg:grid lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
      <!-- Main Content simplificado -->
      <div class="lg:col-span-3 order-1">
        {#if !selectedTitle}
          <!-- Welcome view simplificado -->
          <Card class="bg-white/95 border-purple-200/60 shadow-lg rounded-xl">
            <CardHeader class="text-center pb-4 sm:pb-8">
              <div class="flex justify-center mb-3 sm:mb-6">
                <div
                  class="bg-gradient-to-r from-purple-600 to-indigo-600 p-3 sm:p-6 rounded-full"
                >
                  <Scale class="h-6 w-6 sm:h-12 sm:w-12 text-white" />
                </div>
              </div>
              <CardTitle
                class="text-xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4"
              >
                Constitución de Panamá
              </CardTitle>
              <CardDescription
                class="text-sm sm:text-xl text-gray-600 max-w-2xl mx-auto"
              >
                Explora nuestra constitución de manera moderna y accesible con <span
                  class="text-purple-600 font-semibold">ACT Panamá</span
                >.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <!-- Mensaje simplificado -->
              <div
                class="bg-purple-50 rounded-lg p-4 sm:p-8 mb-4 sm:mb-8 border border-purple-200"
              >
                <div class="flex items-center gap-2 mb-2">
                  <Zap class="h-5 w-5 sm:h-7 sm:w-7 text-purple-700" />
                  <h3 class="text-base sm:text-xl font-bold text-gray-900">
                    ACT Panamá
                  </h3>
                </div>
                <p class="text-sm sm:text-lg text-gray-700 italic">
                  "Conoce tus derechos, ejerce tu ciudadanía."
                </p>
              </div>

              <p class="text-gray-600 mb-6 text-center text-sm sm:text-base">
                Selecciona un título para comenzar.
              </p>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                {#each titles() as title}
                  <Card
                    class="bg-white border-purple-200 hover:border-purple-400 hover:shadow-md transition-all duration-200 cursor-pointer group rounded-lg"
                    onclick={() => selectTitle(title)}
                  >
                    <CardContent class="p-4 sm:p-6">
                      <div
                        class="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4"
                      >
                        <div class="bg-purple-600 p-2 sm:p-3 rounded-lg">
                          <BookOpen class="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <Badge
                          variant="outline"
                          class="border-purple-300 text-purple-600 text-xs sm:text-sm"
                        >
                          Título
                        </Badge>
                      </div>
                      <h3
                        class="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors text-sm sm:text-lg leading-tight"
                      >
                        {title}
                      </h3>
                    </CardContent>
                  </Card>
                {/each}
              </div>
            </CardContent>
          </Card>
        {:else if selectedTitle && !selectedChapter && chapters().length > 0}
          <!-- Title view with chapters con estilo ACT -->
          <Card
            class="bg-white/90 backdrop-blur-xl border-purple-300/40 shadow-2xl rounded-2xl"
          >
            <CardHeader>
              <div class="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div
                  class="bg-gradient-to-r from-purple-600 to-indigo-600 p-3 sm:p-4 rounded-xl shadow-lg"
                >
                  <Zap class="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div>
                  <CardTitle
                    class="text-xl sm:text-3xl font-bold text-gray-900 leading-tight"
                  >
                    {selectedTitle}
                  </CardTitle>
                  <Badge
                    variant="outline"
                    class="border-purple-300 text-purple-600 mt-1 sm:mt-2 text-xs sm:text-sm"
                  >
                    {chapters().length} Capítulos
                  </Badge>
                </div>
              </div>
              <CardDescription class="text-sm sm:text-base text-purple-600">
                Este título contiene {chapters().length} capítulos. Selecciona un
                capítulo de la barra lateral para ver sus artículos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {#each chapters() as chapter}
                  <Card
                    class="bg-white/60 border-purple-200 hover:border-purple-400 transition-all duration-300 cursor-pointer group"
                    onclick={() => selectChapter(chapter)}
                  >
                    <CardContent class="p-4">
                      <div class="flex items-center gap-3 mb-2">
                        <div
                          class="bg-gradient-to-r from-purple-200 to-pink-200 p-2 rounded-lg group-hover:from-purple-300 group-hover:to-pink-300 transition-all"
                        >
                          <ChevronRight class="h-4 w-4 text-purple-600" />
                        </div>
                        <Badge
                          variant="outline"
                          class="border-purple-300 text-purple-600"
                        >
                          Capítulo
                        </Badge>
                      </div>
                      <h3
                        class="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors text-sm"
                      >
                        {chapter}
                      </h3>
                    </CardContent>
                  </Card>
                {/each}
              </div>
            </CardContent>
          </Card>
        {:else if selectedTitle && !selectedArticle}
          <!-- Title view without chapters or chapter view con estilo ACT -->
          <Card
            class="bg-white/90 backdrop-blur-xl border-purple-300/40 shadow-2xl rounded-2xl"
          >
            <CardHeader>
              <div class="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div
                  class="bg-gradient-to-r from-purple-600 to-indigo-600 p-3 sm:p-4 rounded-xl shadow-lg"
                >
                  <Heart class="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div>
                  <CardTitle
                    class="text-xl sm:text-3xl font-bold text-gray-900 leading-tight"
                  >
                    {selectedChapter || selectedTitle}
                  </CardTitle>
                  <Badge
                    variant="outline"
                    class="border-purple-300 text-purple-600 mt-1 sm:mt-2 text-xs sm:text-sm"
                  >
                    {articles().length} Artículos
                  </Badge>
                </div>
              </div>
              <CardDescription class="text-sm sm:text-base text-purple-600">
                {selectedChapter
                  ? `Este capítulo contiene ${articles().length} artículos.`
                  : `Este título contiene ${articles().length} artículos.`}
                Selecciona un artículo de la barra lateral para leerlo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {#each articles() as article}
                  <Button
                    variant="ghost"
                    onclick={() => selectArticle(article)}
                    class="h-auto p-4 justify-start text-left transition-all duration-200 border {selectedArticle ===
                    article
                      ? 'bg-purple-100 text-purple-800 border-purple-300'
                      : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700 border-transparent hover:border-purple-200'}"
                  >
                    <div class="flex items-center gap-2">
                      <Scale
                        class="h-4 w-4 {selectedArticle === article
                          ? 'text-purple-600'
                          : 'text-purple-400'}"
                      />
                      <span class="font-medium"
                        >Artículo {article.split("-")[1]}</span
                      >
                    </div>
                  </Button>
                {/each}
              </div>
            </CardContent>
          </Card>
        {:else if selectedArticle}
          <!-- Article view con estilo ACT -->
          <Card
            class="bg-white/90 backdrop-blur-xl border-purple-300/40 shadow-2xl rounded-2xl"
          >
            <CardHeader>
              <!-- Breadcrumb con estilo ACT -->
              <nav
                class="flex items-center space-x-2 text-sm text-purple-600 mb-4"
              >
                <button
                  onclick={() => {
                    selectedTitle = "";
                    selectedChapter = "";
                    selectedArticle = "";
                  }}
                  class="hover:text-purple-800 transition-colors"
                >
                  Inicio
                </button>
                <ChevronRight class="h-4 w-4" />
                <button
                  onclick={() => {
                    selectedChapter = "";
                    selectedArticle = "";
                  }}
                  class="hover:text-purple-800 transition-colors"
                >
                  {selectedTitle}
                </button>
                {#if selectedChapter}
                  <ChevronRight class="h-4 w-4" />
                  <button
                    onclick={() => {
                      selectedArticle = "";
                    }}
                    class="hover:text-purple-800 transition-colors"
                  >
                    {selectedChapter}
                  </button>
                {/if}
              </nav>

              <div class="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div
                  class="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 sm:p-5 rounded-xl shadow-lg"
                >
                  <Scale class="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <div>
                  <CardTitle
                    class="text-2xl sm:text-4xl font-bold text-gray-900 leading-tight"
                  >
                    Artículo {selectedArticle.split("-")[1]}
                  </CardTitle>
                  <CardDescription
                    class="text-sm sm:text-base text-purple-600 mt-1 sm:mt-2"
                  >
                    Constitución Política de la República de Panamá
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <!-- Contenido del artículo -->
              <div
                class="bg-gradient-to-r from-purple-100 via-indigo-50 to-purple-100 rounded-xl p-6 sm:p-10 border border-purple-300/50 shadow-lg mb-8 sm:mb-10"
              >
                <p class="text-gray-900 leading-relaxed text-base sm:text-lg">
                  {currentArticleContent()}
                </p>
              </div>

              <!-- Navegación entre artículos -->
              {#if filteredArticles().length > 1}
                {@const currentIndex =
                  filteredArticles().indexOf(selectedArticle)}
                <div
                  class="flex justify-between items-center pt-6 border-t border-purple-200"
                >
                  {#if currentIndex > 0}
                    <Button
                      variant="outline"
                      onclick={() =>
                        selectArticle(filteredArticles()[currentIndex - 1])}
                      class="border-purple-500 text-purple-600 hover:bg-purple-50"
                    >
                      <ChevronLeft class="h-4 w-4 mr-1" />
                      Artículo {filteredArticles()[currentIndex - 1].split(
                        "-"
                      )[1]}
                    </Button>
                  {:else}
                    <div></div>
                  {/if}

                  <Badge
                    variant="outline"
                    class="border-purple-300 text-purple-600"
                  >
                    {currentIndex + 1} de {filteredArticles().length}
                  </Badge>

                  {#if currentIndex < filteredArticles().length - 1}
                    <Button
                      variant="outline"
                      onclick={() =>
                        selectArticle(filteredArticles()[currentIndex + 1])}
                      class="border-purple-500 text-purple-600 hover:bg-purple-50"
                    >
                      Artículo {filteredArticles()[currentIndex + 1].split(
                        "-"
                      )[1]}
                      <ChevronRight class="h-4 w-4 ml-1" />
                    </Button>
                  {:else}
                    <div></div>
                  {/if}
                </div>
              {/if}
            </CardContent>
          </Card>
        {/if}
      </div>

      <!-- Sidebar simplificado -->
      <div class="lg:col-span-1 order-2">
        <Card class="bg-white border-purple-200 shadow-md rounded-lg">
          <CardHeader class="pb-3">
            <CardTitle
              class="text-gray-900 flex items-center gap-2 text-base sm:text-lg font-semibold"
            >
              <Search class="h-5 w-5 text-purple-600" />
              Navegación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <!-- Search simplificado -->
            <div class="mb-3 sm:mb-6">
              <div class="relative">
                <Search
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400"
                />
                <Input
                  type="text"
                  placeholder="Buscar..."
                  bind:value={searchTerm}
                  class="pl-10 bg-white border-purple-200 text-gray-900 placeholder:text-gray-500 focus:border-purple-400 text-sm"
                />
              </div>
            </div>

            <!-- Navigation con estilo ACT -->
            {#if !selectedTitle}
              <!-- Show titles -->
              <div class="space-y-3">
                <div class="flex items-center gap-2 mb-4">
                  <Users class="h-4 w-4 text-purple-600" />
                  <h3 class="font-semibold text-gray-900">Títulos</h3>
                </div>
                <ScrollArea class="h-64 sm:h-80 lg:h-96">
                  <div class="space-y-2">
                    {#each titles() as title}
                      <Button
                        variant="ghost"
                        onclick={() => selectTitle(title)}
                        class="w-full justify-start text-left px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-all duration-200 border border-transparent hover:border-purple-200 whitespace-normal h-auto min-h-[2.5rem] sm:min-h-[3rem]"
                      >
                        <BookOpen
                          class="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-purple-600 flex-shrink-0"
                        />
                        <span class="text-wrap leading-tight">{title}</span>
                      </Button>
                    {/each}
                  </div>
                </ScrollArea>
              </div>
            {:else if !selectedChapter && chapters().length > 0}
              <!-- Show chapters -->
              <div class="space-y-3">
                <div class="flex items-center gap-2 mb-4">
                  <Zap class="h-4 w-4 text-purple-600" />
                  <h3 class="font-semibold text-gray-900">
                    Capítulos de {selectedTitle}
                  </h3>
                </div>
                <ScrollArea class="h-96">
                  <div class="space-y-2">
                    {#each chapters() as chapter}
                      <Button
                        variant="ghost"
                        onclick={() => selectChapter(chapter)}
                        class="w-full justify-start text-left px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-all duration-200 border border-transparent hover:border-purple-200 whitespace-normal h-auto min-h-[2.5rem] sm:min-h-[3rem]"
                      >
                        <ChevronRight
                          class="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-purple-600 flex-shrink-0"
                        />
                        <span class="text-wrap leading-tight">{chapter}</span>
                      </Button>
                    {/each}
                  </div>
                </ScrollArea>
              </div>
            {:else}
              <!-- Show articles -->
              <div class="space-y-3">
                <div class="flex items-center gap-2 mb-4">
                  <Heart class="h-4 w-4 text-purple-600" />
                  <h3 class="font-semibold text-gray-900">
                    Artículos
                    {selectedChapter
                      ? `de ${selectedChapter}`
                      : `de ${selectedTitle}`}
                  </h3>
                </div>
                <ScrollArea class="h-96">
                  <div class="space-y-2">
                    {#each filteredArticles() as article}
                      <Button
                        variant="ghost"
                        onclick={() => selectArticle(article)}
                        class="w-full justify-start text-left px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm transition-all duration-200 border {selectedArticle ===
                        article
                          ? 'bg-purple-100 text-purple-800 border-purple-300'
                          : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700 border-transparent hover:border-purple-200'}"
                      >
                        <Scale
                          class="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 {selectedArticle ===
                          article
                            ? 'text-purple-300'
                            : 'text-purple-400'}"
                        />
                        Artículo {article.split("-")[1]}
                      </Button>
                    {/each}
                  </div>
                </ScrollArea>
              </div>
            {/if}
          </CardContent>
        </Card>
      </div>
    </div>
  </main>
</div>
