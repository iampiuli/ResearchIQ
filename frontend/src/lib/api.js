/**
 * Thin fetch wrappers around the FastAPI backend. Mirrors the existing
 * request/response schemas exactly (see backend/app/models/schemas.py) —
 * no shape translation happens here, only HTTP plumbing and error handling.
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000"

// Set once by <AuthBridge> (see App.jsx) to Clerk's getToken. Tokens are
// short-lived, so one is requested fresh for every call rather than cached.
let getToken = async () => null

export function setTokenGetter(fn) {
  getToken = fn
}

async function authHeaders(extra = {}) {
  const token = await getToken()
  return token ? { ...extra, Authorization: `Bearer ${token}` } : extra
}

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
    headers: await authHeaders(),
    body: formData,
  })

  if (!response.ok) throw new ApiError(await parseErrorMessage(response), response.status)
  return response.json()
}

/** URL of an uploaded PDF's stored (UUID-based) filename; fetch it with `fetchPdfBlobUrl` (it needs auth). */
export function fileUrlFor(storedFilename) {
  return `${API_BASE_URL}/files/${storedFilename}`
}

/** Download one of the caller's PDFs with auth and return an object URL (the caller must revoke it). */
export async function fetchPdfBlobUrl(url, signal) {
  const response = await fetch(url, { headers: await authHeaders(), signal })
  if (!response.ok) throw new ApiError(await parseErrorMessage(response), response.status)
  return URL.createObjectURL(await response.blob())
}

/** DELETE /papers/:id — permanently removes the PDF, its metadata and its vectors (204 on success). */
export async function deletePaper(paperId) {
  const response = await fetch(`${API_BASE_URL}/papers/${encodeURIComponent(paperId)}`, {
    method: "DELETE",
    headers: await authHeaders(),
  })
  if (!response.ok) throw new ApiError(await parseErrorMessage(response), response.status)
}

/** GET /papers — list of previously uploaded papers. */
export async function fetchPapers(signal) {
  const response = await fetch(`${API_BASE_URL}/papers`, { headers: await authHeaders(), signal })
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
    headers: await authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ query, paper_ids: paperIds }),
  })

  if (!response.ok) throw new ApiError(await parseErrorMessage(response), response.status)
  return response.json()
}
