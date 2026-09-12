/** Public deployment prefix. Keep in sync with Next's `basePath` setting. */
export const BASE_PATH = "/trace";

/** Build a same-origin URL that works when TRACE is hosted below `/trace`. */
export function appPath(path: string): string {
  return `${BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;
}
