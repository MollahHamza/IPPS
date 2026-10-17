// Facebook, WhatsApp and other link previews don't run JavaScript, so they only ever saw the
// generic tags in index.html. This edge function adds the article's own title, summary and
// image to the HTML before it is sent.

const escape = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

export default async (request, context) => {
  const response = await context.next();
  const id = new URL(request.url).pathname.split('/')[2];
  if (!id || !(response.headers.get('content-type') || '').includes('text/html')) return response;

  let post;
  try {
    const api = await fetch(new URL(`/api/posts/${encodeURIComponent(id)}`, request.url));
    if (!api.ok) return response;
    post = (await api.json()).post;
  } catch {
    return response;
  }

  const url = new URL(request.url);
  const image = post.imageUrl ? new URL(post.imageUrl, url.origin).href : `${url.origin}/2.jpg`;
  const title = `${post.title} | IPPS`;
  const tags = [
    `<title>${escape(title)}</title>`,
    `<meta name="description" content="${escape(post.excerpt)}" />`,
    `<meta property="og:title" content="${escape(post.title)}" />`,
    `<meta property="og:description" content="${escape(post.excerpt)}" />`,
    `<meta property="og:image" content="${escape(image)}" />`,
    `<meta property="og:url" content="${escape(url.origin + url.pathname)}" />`,
    `<meta property="og:type" content="article" />`,
    `<meta property="og:site_name" content="IPPS" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  ].join('\n    ');

  const html = (await response.text())
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta\s+(name="description"|property="og:[^"]*"|name="twitter:[^"]*")[^>]*>/gi, '')
    .replace('</head>', `    ${tags}\n  </head>`);

  const headers = new Headers(response.headers);
  headers.delete('content-length');
  return new Response(html, { status: response.status, headers });
};

export const config = {
  path: '/article/*',
};
