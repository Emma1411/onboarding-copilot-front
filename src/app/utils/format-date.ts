// Les dates des ADR sont au format AAAA-MM-JJ. On évite `new Date('AAAA-MM-JJ')` qui est
// interprété en UTC et peut afficher la veille selon le fuseau horaire.
export function formatDate(iso: string | null): string {
  if (!iso) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return new Intl.DateTimeFormat('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

export function adrCode(id: number): string {
  return `ADR-${String(id).padStart(4, '0')}`;
}