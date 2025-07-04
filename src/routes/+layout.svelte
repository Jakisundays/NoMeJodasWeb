<script lang="ts">
  import "../app.css";

  let { children } = $props();
</script>

<svelte:head>
  <meta property="og:site_name" content="ACT Panamá" />
  <meta property="og:type" content="website" />
  <link rel="icon" href="/favicon/favicon.ico" sizes="any" />
  <link rel="icon" href="/favicon/apple-touch-icon.png" type="image/png" />
  <link rel="apple-touch-icon" href="/favicon/apple-touch-icon.png" />
</svelte:head>

{@render children()}
