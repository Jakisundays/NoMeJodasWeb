<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import {
    BookOpen,
    MessageCircle,
    Phone,
    Vote,
    ExternalLink,
  } from "lucide-svelte";
</script>

<!-- 1. HERO SECTION -->
<section class="min-h-screen bg-white flex items-center justify-center px-4">
  <div class="text-center max-w-4xl mx-auto">
    <h1
      class="text-5xl sm:text-7xl font-bold tracking-tight text-gray-900 mb-6"
    >
      Acción Ciudadana Transformadora.
      <span class="block text-blue-600">No seas espectador, ACTúa.</span>
    </h1>
    <h2
      class="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
    >
      Nos cansamos del cuento. Esto no es política como siempre. Es el pueblo
      tomando el control.
    </h2>

    <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
      <a href="/constitucion">
        <Button size="lg" class="bg-blue-600 hover:bg-blue-700 text-white">
          <BookOpen class="mr-2 h-5 w-5" />
          Ver Constitución
        </Button>
      </a>
      <a href="/chat">
        <Button
          size="lg"
          variant="outline"
          class="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <MessageCircle class="mr-2 h-5 w-5" />
          Probar el Chat
        </Button>
      </a>
      <a
        href="https://wa.me/50766422876"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button
          size="lg"
          variant="outline"
          class="border-green-300 text-green-700 hover:bg-green-50"
        >
          <Phone class="mr-2 h-5 w-5" />
          WhatsApp Bot
        </Button>
      </a>
    </div>
  </div>
</section>

<!-- 2. ¿QUÉ ES ACT PANAMÁ? -->
<section class="py-20 bg-gray-50">
  <div class="container mx-auto px-4 text-center max-w-4xl">
    <div class="space-y-6">
      <div class="text-6xl mb-8">🇵🇦</div>
      <div class="text-2xl sm:text-3xl font-semibold text-gray-900 space-y-4">
        <p>No somos izquierda ni derecha.</p>
        <p>No somos los mismos de siempre.</p>
        <p class="text-blue-600">
          Somos una generación decidida a hacer historia con transparencia
          radical y justicia social para todxs.
        </p>
      </div>
    </div>
  </div>
</section>

<!-- 3. HERRAMIENTAS DISPONIBLES -->
<section class="py-20 bg-white">
  <div class="container mx-auto px-4">
    <h2 class="text-4xl font-bold text-center text-gray-900 mb-16">
      Herramientas para la Transformación
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      <Card.Root
        class="text-center p-8 border-gray-200 hover:shadow-lg transition-shadow"
      >
        <Card.Content class="space-y-4">
          <div class="text-6xl mb-4">📘</div>
          <Card.Title class="text-2xl font-semibold text-gray-900"
            >Constitución Accesible</Card.Title
          >
          <Card.Description class="text-gray-600 text-lg">
            Conoce tus derechos fundamentales. El poder no se hereda, se
            recupera.
          </Card.Description>
        </Card.Content>
      </Card.Root>

      <Card.Root
        class="text-center p-8 border-gray-200 hover:shadow-lg transition-shadow"
      >
        <Card.Content class="space-y-4">
          <div class="text-6xl mb-4">🤖</div>
          <Card.Title class="text-2xl font-semibold text-gray-900"
            >Asistente Ciudadano</Card.Title
          >
          <Card.Description class="text-gray-600 text-lg">
            Entiende tus derechos sin tecnicismos. Educación como base del
            desarrollo real.
          </Card.Description>
        </Card.Content>
      </Card.Root>

      <Card.Root
        class="text-center p-8 border-gray-200 hover:shadow-lg transition-shadow"
      >
        <Card.Content class="space-y-4">
          <div class="text-6xl mb-4">💬</div>
          <Card.Title class="text-2xl font-semibold text-gray-900"
            >WhatsApp Activado</Card.Title
          >
          <Card.Description class="text-gray-600 text-lg">
            Acceso directo a tus derechos desde tu celular. Somos Panamá
            activado.
          </Card.Description>
        </Card.Content>
      </Card.Root>
    </div>
  </div>
</section>

<!-- 4. LO QUE VIENE -->
<section class="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
  <div class="container mx-auto px-4 text-center max-w-4xl">
    <div class="space-y-8">
      <div class="text-8xl mb-8">🗳️</div>
      <h2 class="text-4xl font-bold text-gray-900 mb-6">
        Participa en la Transformación
      </h2>
      <p class="text-xl text-gray-700 mb-8 leading-relaxed">
        Muy pronto podrás participar activamente en las decisiones que afectan
        tu vida.<br />
        No venimos a ocupar cargos, venimos a transformar el sistema.
      </p>
      <Button
        size="lg"
        variant="outline"
        class="border-blue-300 text-blue-700 hover:bg-blue-50"
      >
        Avísame cuando esté listo
      </Button>
    </div>
  </div>
</section>

<!-- 5. FOOTER -->
<footer class="bg-gray-900 text-white py-16">
  <div class="container mx-auto px-4">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
      <!-- Enlaces rápidos -->
      <div>
        <h3 class="text-lg font-semibold mb-4">Enlaces rápidos</h3>
        <div class="space-y-2">
          <a
            href="/constitucion"
            class="block text-gray-300 hover:text-white transition-colors"
          >
            Constitución
          </a>
          <a
            href="/chat"
            class="block text-gray-300 hover:text-white transition-colors"
          >
            Chat Web
          </a>
          <a
            href="https://wa.me/50766422876"
            target="_blank"
            rel="noopener noreferrer"
            class="block text-gray-300 hover:text-white transition-colors"
          >
            WhatsApp
          </a>
        </div>
      </div>

      <!-- Contacto -->
      <div>
        <h3 class="text-lg font-semibold mb-4">Contacto</h3>
        <a
          href="https://wa.me/50766422876"
          target="_blank"
          rel="noopener noreferrer"
          class="text-green-400 hover:text-green-300 transition-colors flex items-center"
        >
          <Phone class="mr-2 h-4 w-4" />
          WhatsApp
        </a>
      </div>

      <!-- Disclaimer -->
      <div>
        <h3 class="text-lg font-semibold mb-4">Acerca de</h3>
        <p class="text-gray-300 text-sm leading-relaxed">
          Movimiento político ciudadano independiente. Una nueva cultura
          política: más ética, más abierta, más humana.
        </p>
      </div>
    </div>

    <div class="border-t border-gray-800 pt-8 text-center">
      <p class="text-gray-400">
        ACT Panamá © {new Date().getFullYear()}
      </p>
    </div>
  </div>
</footer>
