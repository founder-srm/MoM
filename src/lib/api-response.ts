import { NextResponse } from "next/server"

/**
 * Standardised API response envelope.
 * Every endpoint MUST use these helpers so consumers always get
 * { success, data?, error?, message?, status }.
 */

export interface ApiSuccess<T> {
  success: true
  data: T
  message?: string
  status: number
}

export interface ApiError {
  success: false
  error: string
  message?: string
  status: number
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

// ─── Response builders ────────────────────────────────────────────────────────

export function apiSuccess<T>(data: T, message?: string, status = 200): NextResponse {
  return NextResponse.json(
    { success: true, data, message, status } satisfies ApiSuccess<T>,
    { status },
  )
}

export function apiError(error: string, status = 500, message?: string): NextResponse {
  return NextResponse.json(
    { success: false, error, message, status } satisfies ApiError,
    { status },
  )
}

// ─── Shorthand helpers ────────────────────────────────────────────────────────

export const unauthorized = () => apiError("Unauthorized", 401)
export const notFound = (resource = "Resource") => apiError(`${resource} not found`, 404)
export const badRequest = (detail: string) => apiError(detail, 400)
export const serviceUnavailable = (detail: string) => apiError(detail, 503)
export const internalError = (detail = "Internal server error") => apiError(detail, 500)
