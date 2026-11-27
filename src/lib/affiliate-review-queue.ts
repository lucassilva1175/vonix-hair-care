/** Age at the last successful list snapshot; no invented SLA or priority score. */
export function pendingReviewAge(createdAt: string, checkedAt: number | null): string | null {
  if (checkedAt === null || !Number.isFinite(checkedAt)) return null;
  const created = Date.parse(createdAt);
  if (!Number.isFinite(created) || created > checkedAt) return null;
  const hours = Math.floor((checkedAt - created) / 3600000);
  if (hours < 1) return "Aguardando há menos de 1 hora";
  if (hours < 24) return "Aguardando há " + hours + (hours === 1 ? " hora" : " horas");
  const days = Math.floor(hours / 24);
  return "Aguardando há " + days + (days === 1 ? " dia" : " dias");
}

export function reviewPageRange(total: number, page: number, pageSize: number, count: number) {
  if (
    ![total, page, pageSize, count].every(Number.isSafeInteger) ||
    total < 0 ||
    page < 0 ||
    pageSize <= 0 ||
    count <= 0 ||
    count > pageSize
  )
    return null;
  const first = page * pageSize + 1;
  const last = first + count - 1;
  if (!Number.isSafeInteger(first) || last > total) return null;
  return { first, last, pages: Math.ceil(total / pageSize) };
}
