/**
 * Thin fetch wrappers around the FastAPI backend. Mirrors the existing
 * request/response schemas exactly (see backend/app/models/schemas.py) —
 * no shape translation happens here, only HTTP plumbing and error handling.
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000"

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

async function parseErrorMessage(response) {
  try {
    const body = await response.json()
    // ResearchIQException handler shape: { error, message }.
    if (typeof body.message === "string") return body.message
    // FastAPI's default validation-error shape: { detail: string | [{ msg }] }.
    if (typeof body.detail === "string") return body.detail
    if (Array.isArray(body.detail)) return body.detail.map((d) => d.msg).join(", ")
  } catch {
    // Response body wasn't JSON (or was empty) — fall through to the status-based message.
  }
  return `Request failed with status ${response.status}`
}

/** POST /upload — multipart form-data, field name "files" (matches FastAPI's File(...) param). */
export async function uploadPapers(files) {
  const formData = new FormData()
  for (const file of files) formData.append("files", file)

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) throw new ApiError(await parseErrorMessage(response), response.status)
  return response.json()
}

/** Public URL for an uploaded PDF's stored (UUID-based) filename, served read-only via StaticFiles. */
export function fileUrlFor(storedFilename) {
  return `${API_BASE_URL}/files/${storedFilename}`
}

/** GET /papers — list of previously uploaded papers. */
export async function fetchPapers() {
  const response = await fetch(`${API_BASE_URL}/papers`)
  if (!response.ok) throw new ApiError(await parseErrorMessage(response), response.status)
  return response.json()
}

/**
 * POST /chat — { query, paper_ids } -> { query, answer, sources }.
 * `paperIds` is always sent as an array (even empty) to scope retrieval to a
 * workspace's attached papers — omitting it would default to a global search
 * on the backend, silently defeating workspace isolation.
 */
export async function sendChatMessage(query, paperIds) {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, paper_ids: paperIds }),
  })

  if (!response.ok) throw new ApiError(await parseErrorMessage(response), response.status)
  return response.json()
}
