export function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function enumOrUndefined<T extends string>(value: string | undefined, allowed: readonly T[]) {
  if (!value) return undefined;
  return (allowed as readonly string[]).includes(value) ? (value as T) : undefined;
}

export function blankToNull(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text ? text : null;
}

export function optionalInt(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const number = Number(text);
  return Number.isFinite(number) ? Math.trunc(number) : Number.NaN;
}

export function safeReturnTo(value: FormDataEntryValue | null, fallback: string) {
  const text = String(value ?? "");
  if (text.startsWith("/") && !text.startsWith("//") && !text.includes("\\")) return text;
  return fallback;
}
