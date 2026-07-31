import { cookies } from "next/headers";
import { IApiResponse } from "./types";

/**
 * Single gateway to the FixItNow REST API.
 *
 * Every call runs on the Next.js server (Server Component / Server Action),
 * never in the browser. Two reasons:
 *   1. the access token stays in an httpOnly cookie the client can't read;
 *   2. the backend's CORS allow-list is a single origin, and server-to-server
 *      requests aren't subject to CORS at all.
 *
 * `apiFetch` never throws on an HTTP error — it always resolves to the
 * backend's envelope so callers can render a toast or inline message.
 * Only genuinely unexpected failures (DNS, socket) are synthesised into
 * an envelope, so the UI has exactly one error shape to handle.
 */

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://fixitbackend.vercel.app";

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  /** Attach the caller's access token. Default: true. */
  auth?: boolean;
  /** Passed straight through to Next's fetch cache. */
  next?: NextFetchRequestConfig;
};

export const getAccessToken = async (): Promise<string | undefined> => {
  const cookieStore = await cookies();
  return cookieStore.get("accessToken")?.value;
};

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<IApiResponse<T>> {
  const { body, auth = true, headers, ...rest } = options;

  const requestHeaders: Record<string, string> = {
    ...(headers as Record<string, string>),
  };

  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = await getAccessToken();
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  // Authenticated responses are per-user, so they must never land in the
  // shared data cache. Public reads opt into caching by passing `next`.
  const cache: RequestCache | undefined =
    rest.cache ?? (auth && !rest.next ? "no-store" : undefined);

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...rest,
      cache,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const result = (await res.json()) as IApiResponse<T>;

    // A backend that answered at all already carries `success`; trust it.
    return result;
  } catch {
    return {
      success: false,
      statusCode: 503,
      message:
        "Could not reach the FixItNow server. Check your connection and try again.",
      data: null as T,
      errorDetails: null,
    };
  }
}

/**
 * Turn a failed envelope into field-keyed messages for inline form errors.
 * The backend reports Zod failures as `errorDetails.issues[]`.
 */
export function toFieldErrors(
  errorDetails: IApiResponse<unknown>["errorDetails"],
): Record<string, string> | undefined {
  if (!errorDetails?.issues?.length) return undefined;

  return errorDetails.issues.reduce<Record<string, string>>((acc, issue) => {
    // Keep the first message per field — that's what renders under the input.
    if (!acc[issue.field]) acc[issue.field] = issue.message;
    return acc;
  }, {});
}

/** Build a query string, dropping empty/undefined values. */
export function buildQuery(
  params: Record<string, string | number | undefined | null>,
): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}
