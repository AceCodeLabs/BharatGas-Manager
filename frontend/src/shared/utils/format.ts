export function formatDateTime(value?: string | Date | null) {
  if (!value) return 'Pending';

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Pending';

  return date.toLocaleString();
}
