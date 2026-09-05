function withIndexPath(request) {
  const url = new URL(request.url);
  url.pathname = '/index.html';
  return new Request(url, request);
}

export default {
  async fetch(request, env) {
    if (!env?.ASSETS?.fetch) {
      return new Response('BoniStudio assets are not available.', { status: 503 });
    }

    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404 || request.method !== 'GET') {
      return response;
    }

    return env.ASSETS.fetch(withIndexPath(request));
  },
};
