export default function App() {
  return (
    <main style={{ fontFamily: 'system-ui', maxWidth: 640, margin: '40px auto', padding: 24 }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Visual Style Editor Demo</h1>
      <p style={{ color: '#555', lineHeight: 1.6 }}>
        Pick any element on this page from the Visual Styles sidebar in Windsurf,
        tweak its styles, then send the edit request to the agent.
      </p>
      <div style={{ border: '1px solid #e3e5e7', borderRadius: 12, padding: 16, marginTop: 24 }}>
        <h2 style={{ fontSize: 18, marginTop: 0 }}>Card title</h2>
        <p style={{ color: '#666', marginBottom: 16 }}>A simple card to experiment with padding, radius and colors.</p>
        <button
          style={{ background: 'rgb(23, 23, 23)', color: 'rgb(255, 255, 255)', border: 'none', borderRadius: 12, padding: '8px 16px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
          onClick={() => alert('clicked')}
        >
          إرسال
        </button>
      </div>
    </main>
  );
}
