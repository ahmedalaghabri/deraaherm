import * as vscode from 'vscode';
import { WebSocketServer, WebSocket } from 'ws';

interface SelectedElement {
  id: string;
  tag: string;
  file?: string;
  line?: number;
  styles: Record<string, string>;
}

interface PendingEdit {
  element: SelectedElement;
  changes: Record<string, string>;
}

let server: WebSocketServer | undefined;
const browserSockets = new Set<WebSocket>();
let provider: PropertiesProvider;

export function activate(context: vscode.ExtensionContext) {
  provider = new PropertiesProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('visualStyleEditor.properties', provider),
    vscode.commands.registerCommand('visualStyleEditor.startBridge', startBridge),
    vscode.commands.registerCommand('visualStyleEditor.stopBridge', stopBridge)
  );
  void startBridge();
}

export function deactivate() { stopBridge(); }

async function startBridge() {
  if (server) {
    vscode.window.showInformationMessage('Visual Style Editor bridge is already running.');
    return;
  }
  const port = vscode.workspace.getConfiguration('visualStyleEditor').get<number>('port', 49152);
  server = new WebSocketServer({ host: '127.0.0.1', port });
  server.on('connection', socket => {
    browserSockets.add(socket);
    provider.setConnection(true);
    socket.on('message', raw => {
      try {
        const message = JSON.parse(raw.toString());
        if (message.type === 'selected') provider.setSelection(message.element as SelectedElement);
      } catch (error) {
        console.error(error);
      }
    });
    socket.on('close', () => {
      browserSockets.delete(socket);
      provider.setConnection(browserSockets.size > 0);
    });
  });
  server.on('error', err => {
    vscode.window.showErrorMessage(`Visual Style Editor bridge error: ${err.message}`);
    stopBridge();
  });
  provider.setConnection(false);
  vscode.window.showInformationMessage(`Visual Style Editor listening on ws://127.0.0.1:${port}`);
}

function stopBridge() {
  browserSockets.forEach(socket => socket.close());
  browserSockets.clear();
  server?.close();
  server = undefined;
  provider?.setConnection(false);
}

class PropertiesProvider implements vscode.WebviewViewProvider {
  private view?: vscode.WebviewView;
  private selection?: SelectedElement;
  private connected = false;
  private pending?: PendingEdit;

  constructor(private readonly extensionUri: vscode.Uri) {}

  resolveWebviewView(view: vscode.WebviewView) {
    this.view = view;
    view.webview.options = { enableScripts: true };
    view.webview.html = getHtml();
    view.webview.onDidReceiveMessage(async message => {
      if (message.type === 'ready') this.pushState();
      if (message.type === 'pick') this.sendBrowser({ type: 'pick' });
      if (message.type === 'change' && this.selection) this.queueChange(message.property, message.value);
      if (message.type === 'send') await this.sendToAgent(message.description);
      if (message.type === 'discard') this.discardPending();
    });
  }

  setConnection(connected: boolean) { this.connected = connected; this.pushState(); }
  setSelection(selection: SelectedElement) {
    this.selection = selection;
    this.pending = undefined;
    this.pushState();
  }

  private pushState() {
    this.view?.webview.postMessage({
      type: 'state',
      connected: this.connected,
      selection: this.selection,
      pending: this.pending?.changes ?? {}
    });
  }

  private sendBrowser(message: unknown) {
    const open = [...browserSockets].filter(socket => socket.readyState === WebSocket.OPEN);
    if (!open.length) {
      vscode.window.showWarningMessage('Start the bridge and open the app first.');
      return;
    }
    const data = JSON.stringify(message);
    open.forEach(socket => socket.send(data));
  }

  private queueChange(property: string, value: string) {
    if (!this.selection) return;
    if (!this.pending || this.pending.element.id !== this.selection.id) {
      this.pending = { element: this.selection, changes: {} };
    }
    this.pending.changes[property] = value;
    this.selection.styles[property] = value;
    this.sendBrowser({ type: 'apply', id: this.selection.id, property, value });
    this.pushState();
  }

  private async sendToAgent(description?: string) {
    if (!this.pending) return;
    const prompt = buildAgentPrompt(this.pending, description);
    this.pending = undefined;
    this.pushState();
    await vscode.env.clipboard.writeText(prompt);
    const attempts: [string, unknown?][] = [
      ['devin.prioritized.chat.open', { query: prompt, isPartialQuery: true }],
      ['workbench.action.chat.open', { query: prompt, isPartialQuery: true }],
      ['devin.prioritized.chat.open'],
      ['workbench.action.chat.open'],
    ];
    for (const [cmd, arg] of attempts) {
      try {
        if (arg === undefined) await vscode.commands.executeCommand(cmd);
        else await vscode.commands.executeCommand(cmd, arg);
        return;
      } catch { /* try next command */ }
    }
    vscode.window.showInformationMessage('Edit request copied to clipboard. Paste it into Cascade to apply the changes.');
  }

  private discardPending() {
    this.pending = undefined;
    vscode.window.showInformationMessage('Pending changes discarded. Reload the browser page to clear the preview.');
    this.pushState();
  }
}

function buildAgentPrompt(edit: PendingEdit, description?: string): string {
  const { element, changes } = edit;
  const location = element.file ? `${element.file}:${element.line ?? '?'}` : 'unknown location';
  const lines = Object.entries(changes).map(([p, v]) => `- ${p}: ${v}`).join('\n');
  const notes = description ? ['', 'Additional notes from the user:', description] : [];
  return [
    `Apply the following visual style changes to the <${element.tag}> element rendered at ${location}.`,
    '',
    'Requested changes:',
    lines,
    ...notes,
    '',
    'Requirements:',
    '- Edit the source directly (JSX/TSX). If the project uses Tailwind, express the changes as Tailwind classes; otherwise update the appropriate style or CSS file.',
    '- If the element is rendered inside a loop or a shared component, apply the change at the component level and mention any side effects.',
    '- Do not change unrelated code.'
  ].join('\n');
}

function getHtml(): string {
  const colorFields: Array<[string, string]> = [['color','Text color'], ['background-color','Background'], ['border-color','Border color']];
  const textFields: Array<[string, string]> = [
    ['opacity','Opacity'], ['font-size','Font size'], ['line-height','Line height'],
    ['border-radius','Border radius'], ['border-width','Border width'],
    ['width','Width'], ['height','Height'], ['min-width','Min width'], ['max-width','Max width'], ['gap','Gap'],
    ['display','Display'], ['flex-direction','Flex direction'], ['align-items','Align items'], ['justify-content','Justify content']
  ];
  const fonts = ['system-ui','Inter','Roboto','Arial','Helvetica','Georgia','Times New Roman','Courier New','monospace','sans-serif','serif'];
  const weights = ['100','200','300','400','500','600','700','800','900','normal','bold'];
  const borderStyles = ['none','solid','dashed','dotted','double'];
  const sides = ['T','R','B','L'];
  const box = (prop: string, label: string) => `<div class="field"><span>${label}</span><span class="box4">${sides.map(s => `<input data-box="${prop}" placeholder="${s}" />`).join('')}</span></div>`;
  return `<!doctype html><html><head><meta charset="UTF-8"><style>
    body{font-family:var(--vscode-font-family);padding:10px;color:var(--vscode-foreground)}
    button,input,select,textarea{font:inherit} button{width:100%;padding:8px;margin-bottom:8px}
    button.secondary{background:var(--vscode-button-secondaryBackground);color:var(--vscode-button-secondaryForeground)}
    textarea{width:100%;box-sizing:border-box;min-height:56px;resize:vertical;padding:6px;margin-bottom:10px;background:var(--vscode-input-background);color:var(--vscode-input-foreground);border:1px solid var(--vscode-input-border)}
    .status{font-size:12px;opacity:.8;margin-bottom:10px}.meta{padding:8px;background:var(--vscode-editor-background);margin-bottom:10px}
    .pending{font-size:12px;padding:8px;background:var(--vscode-editor-background);margin-bottom:10px;white-space:pre-wrap}
    .field{display:grid;grid-template-columns:1fr 1.2fr;gap:8px;align-items:center;margin:7px 0}
    .color{display:flex;gap:6px;align-items:center}
    .box4{display:grid;grid-template-columns:repeat(4,1fr);gap:4px}
    input,select{width:100%;box-sizing:border-box;padding:5px;background:var(--vscode-input-background);color:var(--vscode-input-foreground);border:1px solid var(--vscode-input-border)}
    input[type=color]{width:30px;min-width:30px;height:26px;padding:0;border:none;background:none;cursor:pointer}
  </style></head><body>
    <textarea id="desc" placeholder="Describe these changes... (optional)"></textarea>
    <button id="pick">Pick element</button><div id="status" class="status">Disconnected</div><div id="meta" class="meta">No element selected</div>
    <div id="fields">
      ${colorFields.map(([p,l])=>`<label class="field"><span>${l}</span><span class="color"><input type="color" data-swatch="${p}" /><input data-prop="${p}" /></span></label>`).join('')}
      <label class="field"><span>Font</span><input data-prop="font-family" list="vse-fonts" /></label>
      <datalist id="vse-fonts">${fonts.map(f=>`<option value="${f}"></option>`).join('')}</datalist>
      <label class="field"><span>Font weight</span><select data-prop="font-weight"><option value=""></option>${weights.map(w=>`<option value="${w}">${w}</option>`).join('')}</select></label>
      ${textFields.map(([p,l])=>`<label class="field"><span>${l}</span><input data-prop="${p}" /></label>`).join('')}
      <label class="field"><span>Border style</span><select data-prop="border-style"><option value=""></option>${borderStyles.map(b=>`<option value="${b}">${b}</option>`).join('')}</select></label>
      ${box('padding','Padding')}
      ${box('margin','Margin')}
    </div>
    <div id="pending" class="pending">No pending changes</div>
    <button id="send" disabled>Send to Agent</button>
    <button id="discard" class="secondary" disabled>Discard changes</button>
    <script>
      const vscode=acquireVsCodeApi(); let state={};
      const byId=id=>document.getElementById(id);
      const post=(property,value)=>vscode.postMessage({type:'change',property,value});
      const numeric=v=>/^-?\\d+(\\.\\d+)?$/.test(v);
      const unitProps=['font-size','border-radius','border-width','width','height','min-width','max-width','gap'];
      const withUnit=(p,v)=>(unitProps.indexOf(p)>=0&&numeric(v))?v+'px':v;
      const rgbToHex=v=>{const m=(v||'').match(/rgba?\\(\\s*(\\d+)[,\\s]+(\\d+)[,\\s]+(\\d+)/);return m?'#'+[m[1],m[2],m[3]].map(n=>(+n).toString(16).padStart(2,'0')).join(''):'#000000';};
      const expand=v=>{const p=(v||'').trim().split(/\\s+/).filter(Boolean);if(!p.length)return['','','',''];if(p.length===1)return[p[0],p[0],p[0],p[0]];if(p.length===2)return[p[0],p[1],p[0],p[1]];if(p.length===3)return[p[0],p[1],p[2],p[1]];return p.slice(0,4);};
      byId('pick').onclick=()=>vscode.postMessage({type:'pick'});
      byId('send').onclick=()=>vscode.postMessage({type:'send',description:byId('desc').value.trim()});
      byId('discard').onclick=()=>vscode.postMessage({type:'discard'});
      document.querySelectorAll('input[data-prop],select[data-prop]').forEach(el=>{
        el.addEventListener('change',()=>{
          const v=withUnit(el.dataset.prop,el.value.trim());
          if(el.tagName==='INPUT') el.value=v;
          const sw=document.querySelector('input[data-swatch="'+el.dataset.prop+'"]');
          if(sw) sw.value=rgbToHex(v);
          post(el.dataset.prop,v);
        });
      });
      document.querySelectorAll('input[type=color]').forEach(sw=>{
        sw.addEventListener('input',()=>{
          const target=document.querySelector('input[data-prop="'+sw.dataset.swatch+'"]');
          if(target) target.value=sw.value;
          post(sw.dataset.swatch,sw.value);
        });
      });
      document.querySelectorAll('input[data-box]').forEach(el=>{
        el.addEventListener('change',()=>{
          const inputs=[...document.querySelectorAll('input[data-box="'+el.dataset.box+'"]')];
          const vals=inputs.map(i=>{let v=i.value.trim();if(numeric(v))v+='px';i.value=v;return v||'0';});
          post(el.dataset.box,vals.join(' '));
        });
      });
      addEventListener('message',e=>{ if(e.data.type!=='state')return; state=e.data;
        byId('status').textContent=state.connected?'Browser connected':'Browser disconnected';
        const s=state.selection;
        byId('meta').textContent=s?(s.tag+' — '+(s.file||'unknown')+':'+(s.line||'?')):'No element selected';
        const styles=(s&&s.styles)||{};
        document.querySelectorAll('[data-prop]').forEach(el=>{
          const v=styles[el.dataset.prop]||'';
          if(el.tagName==='SELECT'&&v&&![...el.options].some(o=>o.value===v)){const o=document.createElement('option');o.value=o.textContent=v;el.appendChild(o);}
          el.value=v;
        });
        document.querySelectorAll('input[type=color]').forEach(sw=>{sw.value=rgbToHex(styles[sw.dataset.swatch]);});
        ['padding','margin'].forEach(boxProp=>{
          const parts=expand(styles[boxProp]);
          [...document.querySelectorAll('input[data-box="'+boxProp+'"]')].forEach((el,i)=>{el.value=parts[i];});
        });
        const entries=Object.entries(state.pending||{});
        byId('pending').textContent=entries.length?entries.map(([p,v])=>p+': '+v).join('\\n'):'No pending changes';
        byId('send').disabled=byId('discard').disabled=!entries.length;
      });
      vscode.postMessage({type:'ready'});
    </script></body></html>`;
}
