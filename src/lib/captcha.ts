const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstileToken(token: string, remoteIp?: string | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return { ok: true, skipped: true as const };
  }

  const form = new URLSearchParams();
  form.set("secret", secret);
  form.set("response", token);
  if (remoteIp) form.set("remoteip", remoteIp);

  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
    cache: "no-store"
  });

  if (!response.ok) {
    return { ok: false, skipped: false as const, errors: ["http_error"] };
  }

  const data = (await response.json()) as {
    success: boolean;
    "error-codes"?: string[];
  };

  return {
    ok: data.success,
    skipped: false as const,
    errors: data["error-codes"] ?? []
  };
}
