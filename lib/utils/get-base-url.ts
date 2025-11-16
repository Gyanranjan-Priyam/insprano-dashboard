/**
 * Get the base URL for the application
 * This handles different environments properly:
 * - Production: Uses VERCEL_URL or NEXT_PUBLIC_BASE_URL
 * - Development: Falls back to localhost:3000
 */
export function getBaseUrl(): string {
  // If NEXT_PUBLIC_BASE_URL is set, use it
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  
  // On Vercel, use the VERCEL_URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // For development
  return 'http://localhost:3000';
}

/**
 * Get the absolute URL for a given path
 * @param path - The path to append to the base URL
 * @returns The full absolute URL
 */
export function getAbsoluteUrl(path: string): string {
  const baseUrl = getBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}