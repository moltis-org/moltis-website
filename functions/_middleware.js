export async function onRequest(context) {
  try {
    const url = new URL(context.request.url);

    // Only handle the root path
    if (url.pathname !== "/") {
      return context.next();
    }

    // 1. Check lang cookie
    const cookie = context.request.headers.get("Cookie") || "";
    const langMatch = cookie.match(/(?:^|;\s*)lang=(en|fr)(?:;|$)/);
    let lang = langMatch ? langMatch[1] : null;

    // 2. Fall back to Accept-Language header
    if (!lang) {
      const accept = context.request.headers.get("Accept-Language") || "";
      lang = accept.toLowerCase().startsWith("fr") ? "fr" : "en";
    }

    url.pathname = `/index.${lang}.html`;
    const response = await context.env.ASSETS.fetch(url);
    if (response.ok) {
      return response;
    }
  } catch (_) {
    // Fall through to static index.html
  }

  return context.next();
}
