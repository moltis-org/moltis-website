export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      try {
        // 1. Check lang cookie
        const cookie = request.headers.get("Cookie") || "";
        const langMatch = cookie.match(/(?:^|;\s*)lang=(en|fr)(?:;|$)/);
        let lang = langMatch ? langMatch[1] : null;

        // 2. Fall back to Accept-Language header
        if (!lang) {
          const accept = request.headers.get("Accept-Language") || "";
          lang = accept.toLowerCase().startsWith("fr") ? "fr" : "en";
        }

        url.pathname = `/index.${lang}.html`;
        const response = await env.ASSETS.fetch(url);
        if (response.ok) {
          return response;
        }
      } catch (_) {
        // Fall through to default static asset serving (index.html)
      }
    }

    return env.ASSETS.fetch(request);
  },
};
