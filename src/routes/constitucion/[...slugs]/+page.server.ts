import constitucionData from "../../../lib/constants/constitucion_panama.json";

export function load({ params }) {
  const slugs = params.slugs ? params.slugs.split('/') : [];
  let title = 'Constitución de Panamá - ACT Panamá';
  let description = 'Explora, busca y entiende la Constitución de la República de Panamá. Un recurso accesible para todos los ciudadanos, impulsado por ACT Panamá.';

  if (slugs.length > 0) {
    const lastSlug = slugs[slugs.length - 1];
    const articleMatch = lastSlug.match(/^articulo-(\d+)$/);

    if (articleMatch) {
      const articleNum = articleMatch[1];
      title = `Artículo ${articleNum} - Constitución de Panamá | ACT Panamá`;
      description = `Consulta el Artículo ${articleNum} de la Constitución de Panamá. Conoce tus derechos y deberes con ACT Panamá.`;
    } else if (lastSlug.startsWith('titulo-')) {
      const titleKey = lastSlug.replace('titulo-', '').replace(/-/g, ' ');
      title = `${titleKey} - Constitución de Panamá | ACT Panamá`;
      description = `Explora el ${titleKey} de la Constitución de Panamá. ACT Panamá te acerca a la ley.`;
    }
  }

  return {
    title,
    description,
    constitucion: constitucionData,
  };
}
