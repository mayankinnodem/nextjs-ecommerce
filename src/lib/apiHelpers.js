import { NextResponse } from "next/server";

/**
 * Get CORS headers for mobile app compatibility
 */
export function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*', // Allow all origins for mobile apps
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}

/**
 * Create a JSON response with CORS headers
 */
export function jsonResponse(data, status = 200, additionalHeaders = {}) {
  return NextResponse.json(
    data,
    {
      status,
      headers: {
        ...getCorsHeaders(),
        'Content-Type': 'application/json',
        ...additionalHeaders,
      }
    }
  );
}

/**
 * Handle OPTIONS request for CORS preflight
 */
export function handleOptions() {
  return jsonResponse({}, 200);
}

