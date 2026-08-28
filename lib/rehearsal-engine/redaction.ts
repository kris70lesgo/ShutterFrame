const SENSITIVE_VALUE = "[REDACTED]";

export function redactSensitiveText(value: string) {
  return value
    .replace(/(postgres(?:ql)?:\/\/)[^\s'"`]+/gi, `$1${SENSITIVE_VALUE}`)
    .replace(/\b(?:ghp|github_pat|gsk|dtn|napi)_[A-Za-z0-9_\-]+\b/g, SENSITIVE_VALUE)
    // Provider keys are sometimes supplied without a descriptive `key=` label.
    .replace(/\b(?:sk|nvapi|csk)-[A-Za-z0-9_\-]{12,}\b/g, SENSITIVE_VALUE)
    .replace(/\b(Bearer\s+)[^\s]+/gi, `$1${SENSITIVE_VALUE}`)
    .replace(/\b((?:api[_-]?key|token|password|secret)\s*[=:]\s*)[^\s,;]+/gi, `$1${SENSITIVE_VALUE}`);
}

export function redactUnknown(value: unknown): unknown {
  if (typeof value === "string") return redactSensitiveText(value);
  if (Array.isArray(value)) return value.map(redactUnknown);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, /(?:key|token|password|secret|database_url)/i.test(key) ? SENSITIVE_VALUE : redactUnknown(nested)]));
  return value;
}
