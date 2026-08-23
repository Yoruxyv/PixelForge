const TURNSTILE_SCRIPT = `
(() => {
  const TOKEN = 'pixelforge-e2e-turnstile-token';
  const widgets = new Map();
  let sequence = 0;

  const getWidget = (id) => {
    if (id && widgets.has(id)) return widgets.get(id);
    return widgets.values().next().value ?? null;
  };

  window.turnstile = {
    ready(callback) {
      queueMicrotask(callback);
    },
    render(container, options = {}) {
      const id = \`pixelforge-e2e-widget-\${++sequence}\`;
      const widget = { container, options, token: TOKEN };
      widgets.set(id, widget);

      if (container instanceof HTMLElement) {
        container.dataset.turnstileWidgetId = id;
      }

      queueMicrotask(() => options.callback?.(TOKEN));
      return id;
    },
    execute(id) {
      const widget = getWidget(id);
      queueMicrotask(() => widget?.options?.callback?.(TOKEN));
      return Promise.resolve(TOKEN);
    },
    reset(id) {
      const widget = getWidget(id);
      if (widget) widget.token = TOKEN;
    },
    remove(id) {
      if (id) widgets.delete(id);
    },
    getResponse(id) {
      return getWidget(id)?.token ?? TOKEN;
    },
    isExpired() {
      return false;
    },
  };

  try {
    const src = document.currentScript?.src;
    const onloadName = src
      ? new URL(src).searchParams.get('onload')
      : null;

    if (onloadName) {
      queueMicrotask(() => window[onloadName]?.());
    }
  } catch {
    // The script load event is sufficient for wrappers that do not use onload.
  }
})();
`;

export async function mockTurnstile(page) {
  await page.route(
    /https:\/\/challenges\.cloudflare\.com\/turnstile\/v0\/api\.js.*/,
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: TURNSTILE_SCRIPT,
      });
    },
  );
}
