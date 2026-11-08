// Défilement doux, désactivé si l'utilisateur a demandé moins d'animations
export function scrollToId(id: string, block: ScrollLogicalPosition = 'nearest'): void {
  const element = document.getElementById(id);
  if (!element) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  element.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block });
}