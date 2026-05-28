export function normalizeEmailInput(value: string) {
  return value.trim().toLowerCase();
}

export function stripWhitespace(value: string) {
  return value.replace(/\s/g, "");
}
