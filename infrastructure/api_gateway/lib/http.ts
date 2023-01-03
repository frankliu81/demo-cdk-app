export const ORIGINS = Object.freeze(['*']);

export const METHODS = Object.freeze([
  'OPTIONS',
  'GET',
  'PUT',
  'POST',
  'DELETE',
  'PATCH',
  'HEAD',
]);

export const ALL_APP_METHODS = Object.freeze(
  METHODS.filter((method) => method !== 'OPTIONS'),
);

export const COMMON_APP_METHODS = Object.freeze([
  'GET',
  'PUT',
  'POST',
  'DELETE',
]);

export const REQUIRED_CORS_HEADERS = Object.freeze([
  'Content-Type',
  'Authorization',
]);

export const API_GATEWAY_ALLOWED_CORS_HEADERS = Object.freeze([
  'X-Amz-Date',
  'X-Api-Key',
  'X-Amz-Security-Token',
  'X-Amz-User-Agent',
]);

export const CACHE_CONTROL_HEADER_NAME = 'Cache-Control';

export const PUBLIC_API_ALLOWED_CORS_HEADERS_CORS = Object.freeze([
  ...REQUIRED_CORS_HEADERS,
  ...API_GATEWAY_ALLOWED_CORS_HEADERS,
  'X-JOBI-SYSTEM-API-KEY',
]);

export const CORS_CACHE_CONTROL_HEADER_MAX_AGE = 14 * 24 * 60 * 60; // 14d * 24h * 60m * 60s

export const LAMBDA_CORS_HEADERS = Object.freeze({
  'Access-Control-Allow-Origin': `${ORIGINS.join(',')}`,
  'Access-Control-Allow-Methods': `${METHODS.join(',')}`,
  'Access-Control-Allow-Headers': `${PUBLIC_API_ALLOWED_CORS_HEADERS_CORS.join(
    ',',
  )}'`,
  'Access-Control-Allow-Credentials': 'true',
});

// DM: API gateway format is different (has single quote in the values)
export const API_GATEWAY_CORS_HEADERS = Object.freeze({
  'Access-Control-Allow-Origin': `'${ORIGINS.join(',')}'`,
  'Access-Control-Allow-Methods': `'${METHODS.join(',')}'`,
  'Access-Control-Allow-Headers': `'${PUBLIC_API_ALLOWED_CORS_HEADERS_CORS.join(
    ',',
  )}'`,
  'Access-Control-Allow-Credentials': "'true'",
});
