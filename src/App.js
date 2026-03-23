import { useState } from "react";

const TABS = ["📢 Annonstexter", "📧 E-postsekvens", "👤 Personas"];

const systemPrompt = `Du är en expert på marknadsföring för svenska tjänsteföretag och konsultbolag. 
Du skriver alltid på svenska, är konkret, professionell och konverteringsfokuserad.
Svara ENDAST med det efterfrågade innehållet, ingen inledning eller förklaring.`;

const API_KEY = process.env.REACT_APP_ANTHROPIC_API_KEY;

async function callClaude(userPrompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }]
    })
  });
  const data = await res.json();
  return data.content?.[0]?.text || "Något gick fel, försök igen.";
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontWeight: 600, marginBottom: 4, fontSize: 13, color: "#64748b" }}>{label}</label>
      {type === "textarea"
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, minHeight: 70, resize: "vertical", boxSizing: "border-box" }} />
        : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, boxSizing: "border-box" }} />
      }
    </div>
  );
}

function ResultBox({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div style={{ marginTop: 20, background: "#f8fafc", borderRadius: 10, padding: 16, border: "1px solid #e2e8f0", position: "relative" }}>
      <button onClick={copy} style={{ position: "absolute", top: 10, right: 10, padding: "4px 10px", fontSize: 12, borderRadius: 6, border: "1px solid #e2e8f0", background: copied ? "#22c55e" : "#fff", color: copied ? "#fff" : "#374151", cursor: "pointer" }}>
        {copied ? "Kopierat!" : "Kopiera"}
      </button>
      <pre style={{ whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.7, margin: 0, fontFamily: "inherit" }}>{text}</pre>
    </div>
  );
}

function AdTab() {
  const [form, setForm] = useState({ tjänst: "", målgrupp: "", erbjudande: "", smärta: "" });
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const f = k => v => setForm(p => ({ ...p, [k]: v }));

  const generate = async () => {
    setLoading(true); setResult("");
    const prompt = `Skriv 3 Meta/Instagram-annonser för ett konsult-/tjänsteföretag.

Tjänst: ${form.tjänst}
Målgrupp: ${form.målgrupp}
Erbjudande/USP: ${form.erbjudande}
Kundens problem/smärta: ${form.smärta}

Format för varje annons:
**Annons [nr] – [stilnamn]**
Rubrik: ...
Primärtext: ...
CTA: ...

Gör tre varianter med olika vinklar: en problemfokuserad, en resultatorienterad och en social proof-baserad.`;
    setResult(await callClaude(prompt));
    setLoading(false);
  };

  return (
    <div>
      <Field label="Tjänst / Produkt" value={form.tjänst} onChange={f("tjänst")} placeholder="t.ex. Management consulting, IT-rådgivning" />
      <Field label="Målgrupp" value={form.målgrupp} onChange={f("målgrupp")} placeholder="t.ex. VD:ar på medelstora bolag, HR-chefer" />
      <Field label="Erbjudande / USP" value={form.erbjudande} onChange={f("erbjudande")} placeholder="t.ex. Gratis första session, Resultat på 30 dagar" />
      <Field label="Kundens problem / smärta" value={form.smärta} onChange={f("smärta")} placeholder="t.ex. Tappar talanger, Ineffektiva processer" type="textarea" />
      <button onClick={generate} disabled={loading || !form.tjänst}
        style={{ width: "100%", padding: "11px 0", borderRadius: 9, border: "none", background: loading ? "#94a3b8" : "#6366f1", color: "#fff", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", marginTop: 4 }}>
        {loading ? "Genererar annonser..." : "✨ Generera annonstexter"}
      </button>
      {result && <ResultBox text={result} />}
    </div>
  );
}

function EmailTab() {
  const [form, setForm] = useState({ tjänst: "", målgrupp: "", mål: "", antal: "3" });
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const f = k => v => setForm(p => ({ ...p, [k]: v }));

  const generate = async () => {
    setLoading(true); setResult("");
    const prompt = `Skriv en e-postsekvens med ${form.antal} mejl för ett konsult-/tjänsteföretag.

Tjänst: ${form.tjänst}
Målgrupp: ${form.målgrupp}
Mål med sekvensen: ${form.mål}

Format för varje mejl:
**Mejl [nr] – Dag [x]**
Ämnesrad: ...
Brödtext: ...
CTA: ...

Bygg upp sekvensen logiskt: värde → relation → erbjudande.`;
    setResult(await callClaude(prompt));
    setLoading(false);
  };

  return (
    <div>
      <Field label="Tjänst / Produkt" value={form.tjänst} onChange={f("tjänst")} placeholder="t.ex. Ledarskapsutbildning, Affärsutveckling" />
      <Field label="Målgrupp" value={form.målgrupp} onChange={f("målgrupp")} placeholder="t.ex. Nytillträdda chefer, Startup-grundare" />
      <Field label="Mål med sekvensen" value={form.mål} onChange={f("mål")} placeholder="t.ex. Boka möte, Ladda ner guide, Köpa kurs" />
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontWeight: 600, marginBottom: 4, fontSize: 13, color: "#64748b" }}>Antal mejl i sekvensen</label>
        <select value={form.antal} onChange={e => f("antal")(e.target.value)}
          style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14 }}>
          {["3","4","5","6"].map(n => <option key={n} value={n}>{n} mejl</option>)}
        </select>
      </div>
      <button onClick={generate} disabled={loading || !form.tjänst}
        style={{ width: "100%", padding: "11px 0", borderRadius: 9, border: "none", background: loading ? "#94a3b8" : "#6366f1", color: "#fff", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", marginTop: 4 }}>
        {loading ? "Genererar sekvens..." : "✨ Generera e-postsekvens"}
      </button>
      {result && <ResultBox text={result} />}
    </div>
  );
}

function PersonaTab() {
  const [form, setForm] = useState({ tjänst: "", bransch: "", utmaning: "" });
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const f = k => v => setForm(p => ({ ...p, [k]: v }));

  const generate = async () => {
    setLoading(true); setResult("");
    const prompt = `Skapa 2 detaljerade kundpersonas för ett konsult-/tjänsteföretag.

Tjänst/erbjudande: ${form.tjänst}
Bransch/marknad: ${form.bransch}
Kundens huvudutmaning: ${form.utmaning}

Format för varje persona:
**Persona [nr]: [Namn & Titel]**
🧑 Profil: ålder, roll, företagsstorlek, bakgrund
🎯 Mål: vad de vill uppnå
😤 Frustrationer: vad håller dem vakna på natten
📱 Kanaler: var de finns online
💬 Budskap som träffar: hur du når dem
🚫 Invändningar: varför de tvekar att köpa`;
    setResult(await callClaude(prompt));
    setLoading(false);
  };

  return (
    <div>
      <Field label="Tjänst / Erbjudande" value={form.tjänst} onChange={f("tjänst")} placeholder="t.ex. Strategisk rådgivning, Rekrytering" />
      <Field label="Bransch / Marknad" value={form.bransch} onChange={f("bransch")} placeholder="t.ex. Techbolag, Offentlig sektor, Retail" />
      <Field label="Kundens huvudutmaning" value={form.utmaning} onChange={f("utmaning")} placeholder="t.ex. Skalning, Digitalisering, Lönsamhet" type="textarea" />
      <button onClick={generate} disabled={loading || !form.tjänst}
        style={{ width: "100%", padding: "11px 0", borderRadius: 9, border: "none", background: loading ? "#94a3b8" : "#6366f1", color: "#fff", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", marginTop: 4 }}>
        {loading ? "Genererar personas..." : "✨ Generera kundpersonas"}
      </button>
      {result && <ResultBox text={result} />}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState(0);
  return (
    <div style={{ maxWidth: 640, margin: "40px auto", padding: "0 16px", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>🚀 AI Marknadsföringsapp</h1>
        <p style={{ margin: "6px 0 0", fontSize: 14, color: "#64748b" }}>Generera annonstexter, e-postsekvenser och personas automatiskt</p>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 24, borderBottom: "1px solid #e2e8f0" }}>
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)}
            style={{ padding: "8px 14px", borderRadius: "8px 8px 0 0", border: "none", background: tab === i ? "#6366f1" : "transparent", color: tab === i ? "#fff" : "#64748b", fontWeight: tab === i ? 700 : 500, fontSize: 14, cursor: "pointer" }}>
            {t}
          </button>
        ))}
      </div>
      {tab === 0 && <AdTab />}
      {tab === 1 && <EmailTab />}
      {tab === 2 && <PersonaTab />}
    </div>
  );
}
