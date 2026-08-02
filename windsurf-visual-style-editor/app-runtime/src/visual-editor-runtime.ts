type Incoming =
  | { type: 'pick' }
  | { type: 'apply'; id: string; property: string; value: string };

export function startVisualEditor(port = 49152) {
  if (!import.meta.env.DEV) return;
  let socket: WebSocket | undefined;
  let picking = false;
  let overlay: HTMLDivElement | undefined;

  const connect = () => {
    socket = new WebSocket(`ws://127.0.0.1:${port}`);
    socket.onmessage = event => {
      const message = JSON.parse(event.data) as Incoming;
      if (message.type === 'pick') enablePick();
      if (message.type === 'apply') {
        const el = document.querySelector<HTMLElement>(`[data-vse-id="${cssEscape(message.id)}"]`);
        el?.style.setProperty(message.property, message.value, 'important');
      }
    };
    socket.onclose = () => setTimeout(connect, 1500);
  };

  const enablePick = () => {
    picking = true;
    document.documentElement.style.cursor = 'crosshair';
    ensureOverlay();
  };

  const ensureOverlay = () => {
    if (overlay) return overlay;
    overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position: 'fixed', pointerEvents: 'none', zIndex: '2147483647',
      border: '2px solid #7c3aed', background: 'rgba(124,58,237,.10)', display: 'none'
    });
    document.body.appendChild(overlay);
    return overlay;
  };

  const targetFromEvent = (event: Event) => {
    const node = event.composedPath().find(x => x instanceof HTMLElement && x.hasAttribute('data-vse-id'));
    return node instanceof HTMLElement ? node : undefined;
  };

  document.addEventListener('mousemove', event => {
    if (!picking) return;
    const el = targetFromEvent(event);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const o = ensureOverlay();
    Object.assign(o.style, { display:'block', left:`${r.left}px`, top:`${r.top}px`, width:`${r.width}px`, height:`${r.height}px` });
  }, true);

  document.addEventListener('click', event => {
    if (!picking) return;
    const el = targetFromEvent(event);
    if (!el) return;
    event.preventDefault(); event.stopPropagation();
    picking = false; document.documentElement.style.cursor = ''; if (overlay) overlay.style.display='none';
    const computed = getComputedStyle(el);
    const properties = ['color','background-color','opacity','font-family','font-size','font-weight','line-height','border-radius','border-color','border-width','border-style','width','height','min-width','max-width','padding','margin','gap','display','flex-direction','align-items','justify-content'];
    const styles = Object.fromEntries(properties.map(p => [p, computed.getPropertyValue(p).trim()]));
    socket?.send(JSON.stringify({ type:'selected', element:{ id:el.dataset.vseId, tag:el.tagName.toLowerCase(), file:el.dataset.vseFile, line:Number(el.dataset.vseLine||0), styles } }));
  }, true);

  connect();
}

function cssEscape(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}
