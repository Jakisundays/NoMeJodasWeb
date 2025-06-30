<script lang="ts">
  import constitucionData from "../../../lib/constants/constitucion_panama.json";
  import { Button } from "$lib/components/ui/button";
  import {
    ChevronLeft,
    ChevronRight,
    Home,
    BookOpen,
    ArrowLeft,
  } from "lucide-svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";

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
  <title
    >Constitución de Panamá - {selectedArticle
      ? selectedArticle
      : selectedChapter
        ? selectedChapter
        : selectedTitle
          ? selectedTitle
          : "Inicio"}</title
  >
  <meta
    name="description"
    content="Constitución Política de la República de Panamá"
  />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-red-50">
  <!-- Header -->
  <header class="bg-white shadow-sm border-b border-blue-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center space-x-4">
          <BookOpen class="h-8 w-8 text-blue-600" />
          <h1 class="text-xl font-bold text-gray-900">
            Constitución de Panamá
          </h1>
        </div>

        <!-- Navigation breadcrumb -->
        <nav class="flex items-center space-x-2 text-sm">
          {#if selectedTitle || selectedChapter || selectedArticle}
            <Button variant="ghost" size="sm" onclick={goBack}>
              <ChevronLeft class="h-4 w-4 mr-1" />
              Atrás
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
          >
            <Home class="h-4 w-4 mr-1" />
            Inicio
          </Button>
        </nav>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <!-- Sidebar -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <!-- Search -->
          <div class="mb-6">
            <input
              type="text"
              placeholder="Buscar artículos..."
              bind:value={searchTerm}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- Navigation -->
          {#if !selectedTitle}
            <!-- Show titles -->
            <div class="space-y-2">
              <h3 class="font-semibold text-gray-900 mb-3">Títulos</h3>
              {#each titles() as title}
                <button
                  onclick={() => selectTitle(title)}
                  class="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  {title}
                </button>
              {/each}
            </div>
          {:else if !selectedChapter && chapters().length > 0}
            <!-- Show chapters -->
            <div class="space-y-2">
              <h3 class="font-semibold text-gray-900 mb-3">
                Capítulos de {selectedTitle}
              </h3>
              {#each chapters() as chapter}
                <button
                  onclick={() => selectChapter(chapter)}
                  class="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  {chapter}
                </button>
              {/each}
            </div>
          {:else}
            <!-- Show articles -->
            <div class="space-y-2">
              <h3 class="font-semibold text-gray-900 mb-3">
                Artículos
                {selectedChapter
                  ? `de ${selectedChapter}`
                  : `de ${selectedTitle}`}
              </h3>
              {#each filteredArticles() as article}
                <button
                  onclick={() => selectArticle(article)}
                  class="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors {selectedArticle ===
                  article
                    ? 'bg-blue-100 text-blue-700'
                    : ''}"
                >
                  Artículo {article.split("-")[1]}
                </button>
              {/each}
            </div>
          {/if}
        </div>
      </div>

      <!-- Main Content -->
      <div class="lg:col-span-3">
        {#if !selectedTitle}
          <!-- Welcome view -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-4">
              Constitución Política de la República de Panamá
            </h1>
            <p class="text-gray-600 mb-6">
              Selecciona un título de la barra lateral para comenzar a navegar
              por la constitución.
            </p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              {#each titles() as title}
                <button
                  onclick={() => selectTitle(title)}
                  class="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <h3 class="font-semibold text-blue-700 mb-2">{title}</h3>
                </button>
              {/each}
            </div>
          </div>
        {:else if selectedTitle && !selectedChapter && chapters().length > 0}
          <!-- Title view with chapters -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-6">
              {selectedTitle}
            </h1>
            <p class="text-gray-600 mb-6">
              Este título contiene {chapters().length} capítulos. Selecciona un capítulo
              de la barra lateral para ver sus artículos.
            </p>
            <div class="grid gap-3">
              {#each chapters() as chapter}
                <button
                  onclick={() => selectChapter(chapter)}
                  class="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <h3 class="font-semibold text-blue-700">{chapter}</h3>
                </button>
              {/each}
            </div>
          </div>
        {:else if selectedTitle && !selectedArticle}
          <!-- Title view without chapters or chapter view -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-6">
              {selectedChapter || selectedTitle}
            </h1>
            <p class="text-gray-600 mb-6">
              {selectedChapter
                ? `Este capítulo contiene ${articles().length} artículos.`
                : `Este título contiene ${articles().length} artículos.`}
              Selecciona un artículo de la barra lateral para leer su contenido.
            </p>
            <div class="grid gap-3">
              {#each filteredArticles() as article}
                <button
                  onclick={() => selectArticle(article)}
                  class="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <h3 class="font-semibold text-blue-700">
                    Artículo {article.split("-")[1]}
                  </h3>
                </button>
              {/each}
            </div>
          </div>
        {:else if selectedArticle}
          <!-- Article view -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <!-- Breadcrumb -->
            <nav class="text-sm text-gray-500 mb-6">
              <span>Constitución</span>
              <span class="mx-2">></span>
              <span>{selectedTitle}</span>
              {#if selectedChapter}
                <span class="mx-2">></span>
                <span>{selectedChapter}</span>
              {/if}
              <span class="mx-2">></span>
              <span class="text-gray-900"
                >Articulo {selectedArticle.split("-")[1]}</span
              >
            </nav>

            <h1 class="text-3xl font-bold text-gray-900 mb-6">
              <span class="text-blue-700"
                >Articulo {selectedArticle.split("-")[1]}</span
              >
            </h1>

            <div class="prose max-w-none">
              <p class="text-gray-700 leading-relaxed">
                {currentArticleContent()}
              </p>
            </div>

            <!-- Navigation between articles -->
            {#if filteredArticles().length > 1}
              {@const currentIndex =
                filteredArticles().indexOf(selectedArticle)}
              <div
                class="flex justify-between mt-8 pt-6 border-t border-gray-200"
              >
                {#if currentIndex > 0}
                  <Button
                    variant="outline"
                    onclick={() =>
                      selectArticle(filteredArticles()[currentIndex - 1])}
                  >
                    <ChevronLeft class="h-4 w-4 mr-2" />
                    Artículo {filteredArticles()[currentIndex - 1].split(
                      "-"
                    )[1]}
                  </Button>
                {:else}
                  <div></div>
                {/if}

                {#if currentIndex < filteredArticles().length - 1}
                  <Button
                    variant="outline"
                    onclick={() =>
                      selectArticle(filteredArticles()[currentIndex + 1])}
                  >
                    Artículo {filteredArticles()[currentIndex + 1].split(
                      "-"
                    )[1]}
                    <ChevronRight class="h-4 w-4 ml-2" />
                  </Button>
                {/if}
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </main>
</div>
