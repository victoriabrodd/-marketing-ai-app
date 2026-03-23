import { useState } from "react";

const TABS = ["📢 Annonstexter", "📧 E-postsekvens", "👤 Personas"];

const systemPrompt = `Du är en expert på marknadsföring för Mysafety – ett trygghetsföretag vars vision är "A world without worries" och tagline är "Worries taken care of". 
Mysafetys ton är varm, trygg, lösningsorienterad och mänsklig. Kommunikationen ska förmedla trygghet, närvaro och gemenskap – ingen ska behöva möta sina vardagsproblem ensam.
Du skriver alltid på svenska, är konkret och konverteringsfokuserad men alltid med värme och omsorg.
Svara ENDAST med det efterfrågade innehållet, ingen inledning eller förklaring.`;

const API_KEY = process.env.REACT_APP_ANTHROPIC_API_KEY;

const colors = {
  deepGreen: "#17362F",
  lightGreen: "#00CC66",
  paleGreen: "#F2F3E8",
  green: "#268F66",
  beige: "#DBDCCF",
  white: "#FFFFFF",
  text: "#17362F",
  textLight: "#4a6b62",
};

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
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontWeight: 700, marginBottom: 5, fontSize: 13, color: colors.textLight, letterSpacing: "0.03em", textTransform: "uppercase" }}>{label}</label>
      {type === "textarea"
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1.5px solid ${colors.beige}`, background: colors.white, color: colors.text, fontSize: 14, minHeight: 75, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit", outline: "none" }} />
        : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1.5px solid ${colors.beige}`, background: colors.white, color: colors.text, fontSize: 14, boxSizing: "border-box", fontFamily: "inherit", outline: "none" }} />
      }
    </div>
  );
}

function ResultBox({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div style={{ marginTop: 20, background: colors.white, borderRadius: 10, padding: 20, border: `1.5px solid ${colors.beige}`, position: "relative" }}>
      <button onClick={copy} style={{ position: "absolute", top: 12, right: 12, padding: "4px 12px", fontSize: 12, borderRadius: 6, border: `1.5px solid ${colors.lightGreen}`, background: copied ? colors.lightGreen : colors.white, color: copied ? colors.white : colors.deepGreen, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
        {copied ? "Kopierat! ✓" : "Kopiera"}
      </button>
      <pre style={{ whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.8, margin: 0, fontFamily: "inherit", color: colors.text }}>{text}</pre>
    </div>
  );
}

function AdTab() {
  const [form, setForm] = useState({ produkt: "", målgrupp: "", erbjudande: "", oro: "" });
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const f = k => v => setForm(p => ({ ...p, [k]: v }));

  const generate = async () => {
    setLoading(true); setResult("");
    const prompt = `Skriv 3 Meta/Instagram-annonser för Mysafety med ton och känsla enligt Mysafetys brandbook.

Produkt/tjänst: ${form.produkt}
Målgrupp: ${form.målgrupp}
Erbjudande/USP: ${form.erbjudande}
Kundens oro/utmaning: ${form.oro}

Kommunikationen ska förmedla trygghet, närvaro och gemenskap – "Worries taken care of".
Avsluta varje annons med hashtaggen #worriestakencareof.

Format:
**Annons [nr] – [vinkelnamn]**
Rubrik: ...
Primärtext: ...
CTA: ...

Tre vinklar: trygghetsfokuserad, lösningsorienterad och gemenskapsfokuserad.`;
    setResult(await callClaude(prompt));
    setLoading(false);
  };

  return (
    <div>
      <Field label="Produkt / Tjänst" value={form.produkt} onChange={f("produkt")} placeholder="t.ex. ID-skydd, Hemförsäkring" />
      <Field label="Målgrupp" value={form.målgrupp} onChange={f("målgrupp")} placeholder="t.ex. Barnfamiljer, Äldre, Unga vuxna" />
      <Field label="Erbjudande / USP" value={form.erbjudande} onChange={f("erbjudande")} placeholder="t.ex. Första månaden gratis, 24/7 support" />
      <Field label="Kundens oro / utmaning" value={form.oro} onChange={f("oro")} placeholder="t.ex. Rädd för ID-stöld, Oro för hemmet" type="textarea" />
      <button onClick={generate} disabled={loading || !form.produkt}
        style={{ width: "100%", padding: "13px 0", borderRadius: 8, border: "none", background: loading ? colors.beige : colors.deepGreen, color: loading ? colors.textLight : colors.lightGreen, fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", marginTop: 4, fontFamily: "inherit", letterSpacing: "0.02em" }}>
        {loading ? "Genererar annonser..." : "✨ Generera annonstexter"}
      </button>
      {result && <ResultBox text={result} />}
    </div>
  );
}

function EmailTab() {
  const [form, setForm] = useState({ produkt: "", målgrupp: "", mål: "", antal: "3" });
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const f = k => v => setForm(p => ({ ...p, [k]: v }));

  const generate = async () => {
    setLoading(true); setResult("");
    const prompt = `Skriv en e-postsekvens med ${form.antal} mejl för Mysafety.

Produkt/tjänst: ${form.produkt}
Målgrupp: ${form.målgrupp}
Mål med sekvensen: ${form.mål}

Tonen ska vara varm, mänsklig och trygg – i linje med Mysafetys värderingar: "Together. Never alone."
Fokusera på trygghet, lösningar och omsorg. Undvik säljigt språk.

Format:
**Mejl [nr] – Dag [x]**
Ämnesrad: ...
Brödtext: ...
CTA: ...`;
    setResult(await callClaude(prompt));
    setLoading(false);
  };

  return (
    <div>
      <Field label="Produkt / Tjänst" value={form.produkt} onChange={f("produkt")} placeholder="t.ex. ID-skydd, Hemförsäkring" />
      <Field label="Målgrupp" value={form.målgrupp} onChange={f("målgrupp")} placeholder="t.ex. Nya kunder, Befintliga kunder" />
      <Field label="Mål med sekvensen" value={form.mål} onChange={f("mål")} placeholder="t.ex. Aktivera kunder, Merförsäljning, Onboarding" />
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontWeight: 700, marginBottom: 5, fontSize: 13, color: colors.textLight, letterSpacing: "0.03em", textTransform: "uppercase" }}>Antal mejl</label>
        <select value={form.antal} onChange={e => f("antal")(e.target.value)}
          style={{ padding: "10px 12px", borderRadius: 8, border: `1.5px solid ${colors.beige}`, background: colors.white, color: colors.text, fontSize: 14, fontFamily: "inherit" }}>
          {["3","4","5","6"].map(n => <option key={n} value={n}>{n} mejl</option>)}
        </select>
      </div>
      <button onClick={generate} disabled={loading || !form.produkt}
        style={{ width: "100%", padding: "13px 0", borderRadius: 8, border: "none", background: loading ? colors.beige : colors.deepGreen, color: loading ? colors.textLight : colors.lightGreen, fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", marginTop: 4, fontFamily: "inherit" }}>
        {loading ? "Genererar sekvens..." : "✨ Generera e-postsekvens"}
      </button>
      {result && <ResultBox text={result} />}
    </div>
  );
}

function PersonaTab() {
  const [form, setForm] = useState({ produkt: "", marknad: "", oro: "" });
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const f = k => v => setForm(p => ({ ...p, [k]: v }));

  const generate = async () => {
    setLoading(true); setResult("");
    const prompt = `Skapa 2 detaljerade kundpersonas för Mysafety.

Produkt/tjänst: ${form.produkt}
Marknad/segment: ${form.marknad}
Kundens huvudoro: ${form.oro}

Personas ska spegla Mysafetys värderingar om mångfald och inkludering – olika åldrar, bakgrunder och livssituationer.

Format:
**Persona [nr]: [Namn & Ålder]**
🧑 Profil: livssituation, familj, yrke
😟 Oron: vad håller dem vakna på natten
🛡️ Vad de söker: vilken trygghet de behöver
📱 Kanaler: var de finns online
💬 Budskap som träffar: hur Mysafety når dem
🚫 Invändningar: varför de tvekar`;
    setResult(await callClaude(prompt));
    setLoading(false);
  };

  return (
    <div>
      <Field label="Produkt / Tjänst" value={form.produkt} onChange={f("produkt")} placeholder="t.ex. ID-skydd, Hemförsäkring" />
      <Field label="Marknad / Segment" value={form.marknad} onChange={f("marknad")} placeholder="t.ex. Barnfamiljer i Sverige, Pensionärer" />
      <Field label="Kundens huvudoro" value={form.oro} onChange={f("oro")} placeholder="t.ex. ID-stöld, Inbrott, Olyckor" type="textarea" />
      <button onClick={generate} disabled={loading || !form.produkt}
        style={{ width: "100%", padding: "13px 0", borderRadius: 8, border: "none", background: loading ? colors.beige : colors.deepGreen, color: loading ? colors.textLight : colors.lightGreen, fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", marginTop: 4, fontFamily: "inherit" }}>
        {loading ? "Genererar personas..." : "✨ Generera kundpersonas"}
      </button>
      {result && <ResultBox text={result} />}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState(0);
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@400;500;700;900&display=swap');
        * { box-sizing: border-box; }
        body { background: ${colors.paleGreen}; margin: 0; }
        input:focus, textarea:focus, select:focus { border-color: ${colors.lightGreen} !important; box-shadow: 0 0 0 3px rgba(0,204,102,0.15); }
      `}</style>
      <div style={{ fontFamily: "'Red Hat Display', Arial, sans-serif", minHeight: "100vh", background: colors.paleGreen }}>

        {/* Header */}
        <div style={{ background: colors.deepGreen, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: colors.lightGreen, fontWeight: 900, fontSize: 22, letterSpacing: "-0.5px" }}>
              my<span style={{ color: colors.white }}>safety</span>
            </div>
            <div style={{ color: colors.green, fontSize: 11, marginTop: 2, letterSpacing: "0.05em" }}>Worries taken care of</div>
          </div>
          <div style={{ color: colors.paleGreen, fontSize: 12, opacity: 0.7 }}>Marknadsföringsverktyg</div>
        </div>

        {/* Main */}
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 16px" }}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: colors.deepGreen, letterSpacing: "-0.5px" }}>
              Mysafetys Marketing Tool
            </h1>
            <p style={{ margin: "8px 0 0", fontSize: 15, color: colors.textLight, fontWeight: 400 }}>
              Skapa annonstexter, e-postsekvenser och kundpersonas – alltid i linje med Mysafetys brand och tone of voice.
            </p>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
            {TABS.map((t, i) => (
              <button key={i} onClick={() => setTab(i)}
                style={{ padding: "9px 16px", borderRadius: 8, border: `2px solid ${tab === i ? colors.deepGreen : colors.beige}`, background: tab === i ? colors.deepGreen : colors.white, color: tab === i ? colors.lightGreen : colors.textLight, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
                {t}
              </button>
            ))}
          </div>

          {/* Card */}
          <div style={{ background: colors.paleGreen, borderRadius: 12, padding: 24, border: `1.5px solid ${colors.beige}` }}>
            {tab === 0 && <AdTab />}
            {tab === 1 && <EmailTab />}
            {tab === 2 && <PersonaTab />}
          </div>

          {/* Footer */}
          <div style={{ textAlign: "center", marginTop: 32, color: colors.textLight, fontSize: 12 }}>
            Together. Never alone. 💚
          </div>
        </div>
      </div>
    </>
  );
}
