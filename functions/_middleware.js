export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // Only handle the root path
  if (url.pathname !== "/") {
    return context.next();
  }

  // 1. Check lang cookie
  const cookie = request.headers.get("Cookie") || "";
  const langMatch = cookie.match(/(?:^|;\s*)lang=(en|fr)(?:;|$)/);
  let lang = langMatch ? langMatch[1] : null;

  // 2. Fall back to Accept-Language header
  if (!lang) {
    const accept = request.headers.get("Accept-Language") || "";
    lang = accept.toLowerCase().startsWith("fr") ? "fr" : "en";
  }

  const file = `/index.${lang}.html`;
  const assetUrl = new URL(file, request.url);
  return context.env.ASSETS.fetch(new Request(assetUrl, request));
}
