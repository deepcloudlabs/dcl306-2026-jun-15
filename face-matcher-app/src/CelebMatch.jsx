import { useState, useRef, useEffect, useCallback } from "react";

// ── How matching works ────────────────────────────────────────────────
// Everything runs in the browser. face-api.js computes a 128-D descriptor
// for your webcam face and for each gallery face, then ranks them by
// Euclidean distance (smaller = more similar).
//
// The gallery comes from a precomputed celebs.json: [{name, descriptor[128]}].
// Generate it offline with the included precompute script over CelebA (or any
// labeled faces). Loading descriptors instead of fetching photos at runtime
// means the app depends on nothing but the model weights.
//
// Confidence: face-api distances run ~0.3 (same person) to ~0.8+ (unrelated).
// Below STRONG it's a confident match; between STRONG and WEAK it's a loose
// resemblance; above WEAK we report no strong match.
const STRONG = 0.5;
const WEAK = 0.62;

const DEMO_GALLERY = [
  { name: "Binnur Kurt", img: "precompile/images/bk1.png" },
  { name: "Binnur Kurt", img: "precompile/images/bk2.jpg" },
];

const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/";
const FACEAPI_SRC = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.min.js";

function loadScript(src) {
  return new Promise((res, rej) => {
    if (window.faceapi) return res();
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => res();
    s.onerror = () => rej(new Error("Failed to load face-api script"));
    document.body.appendChild(s);
  });
}

function loadImage(url) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = () => rej(new Error("image load failed"));
    img.src = url;
  });
}

function dist(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += (a[i] - b[i]) ** 2;
  return Math.sqrt(s);
}

// Map distance to a 0-100 similarity for display.
function simPct(d) {
  return Math.max(0, Math.min(100, Math.round((1 - d / 1.2) * 100)));
}

export default function CelebMatch() {
  const videoRef = useRef(null);
  const galleryRef = useRef([]);
  const [status, setStatus] = useState("Loading face models…");
  const [modelsReady, setModelsReady] = useState(false);
  const [indexed, setIndexed] = useState(0);
  const [camOn, setCamOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ranked, setRanked] = useState(null); // [{name,img,d,sim}], best first
  const [verdict, setVerdict] = useState(null); // "strong" | "loose" | "none"
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadScript(FACEAPI_SRC);
        const fa = window.faceapi;
        await fa.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        await fa.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await fa.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        if (cancelled) return;
        setModelsReady(true);

        setStatus("Building demo gallery…");
        const out = [];
        for (const c of DEMO_GALLERY) {
          try {
            const img = await loadImage(c.img);
            const d = await fa.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
            if (d) out.push({ name: c.name, descriptor: d.descriptor, img: c.img });
          } catch { /* skip */ }
        }
        if (cancelled) return;
        galleryRef.current = out;
        setIndexed(out.length);
        setStatus(
          out.length
            ? `Ready · ${out.length} demo faces. Load a celebs.json for real matches.`
            : "Models ready. Load a celebs.json to match."
        );
      } catch {
        setError("Couldn't load the face models. Check your network connection.");
        setStatus("Failed to load");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const onLoadJson = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const clean = (Array.isArray(parsed) ? parsed : [])
          .filter((x) => x && typeof x.name === "string" && Array.isArray(x.descriptor) && x.descriptor.length === 128)
          .map((x) => ({ name: x.name, descriptor: Float32Array.from(x.descriptor), img: x.img || null }));
        if (clean.length === 0) {
          setError("That file has no valid 128-D descriptors.");
          return;
        }
        galleryRef.current = clean;
        setIndexed(clean.length);
        setError("");
        setRanked(null);
        setVerdict(null);
        setStatus(`Loaded ${clean.length} celebrities from file.`);
      } catch {
        setError("Couldn't parse that file as JSON.");
      }
    };
    reader.readAsText(file);
  }, []);

  const startCam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCamOn(true);
      setStatus("Camera on · center your face, then capture.");
    } catch {
      setError("Camera access was denied or is unavailable.");
    }
  }, []);

  const match = useCallback(async () => {
    if (!modelsReady || !camOn) return;
    const gallery = galleryRef.current;
    if (!gallery || gallery.length === 0) {
      setStatus("No gallery loaded — nothing to match against.");
      return;
    }
    setBusy(true);
    setError("");
    setStatus("Scanning…");
    try {
      const fa = window.faceapi;
      const det = await fa.detectSingleFace(videoRef.current).withFaceLandmarks().withFaceDescriptor();
      if (!det) {
        setStatus("No face found. Move into frame and try again.");
        setBusy(false);
        return;
      }
      const scored = gallery
        .map((c) => ({ name: c.name, img: c.img, d: dist(det.descriptor, c.descriptor) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 3)
        .map((c) => ({ ...c, sim: simPct(c.d) }));

      const top = scored[0].d;
      const v = top <= STRONG ? "strong" : top <= WEAK ? "loose" : "none";
      setVerdict(v);
      setRanked(scored);
      setStatus(
        v === "strong" ? "Strong match." :
        v === "loose" ? "Loose resemblance." :
        "No strong match — closest faces shown anyway."
      );
    } catch {
      setStatus("Something went wrong while scanning. Try again.");
    }
    setBusy(false);
  }, [modelsReady, camOn]);

  const verdictColor = verdict === "strong" ? "#5b8cff" : verdict === "loose" ? "#d6a14a" : "#8b90a0";

  return (
    <div style={S.wrap}>
      <style>{`@keyframes pulse{0%,100%{opacity:.45}50%{opacity:1}} *{box-sizing:border-box}`}</style>

      <header style={S.head}>
        <h1 style={S.h1}>doppel<span style={{ color: "#5b8cff" }}>·</span>gänger</h1>
        <p style={S.sub}>find the celebrities your face is nearest to — all in the browser</p>
      </header>

      <div style={S.stage}>
        <video ref={videoRef} style={S.video} muted playsInline />
        {!camOn && <div style={S.placeholder}>camera off</div>}
      </div>

      <div style={S.controls}>
        {!camOn ? (
          <button style={{ ...S.btn, opacity: modelsReady ? 1 : 0.5 }} onClick={startCam} disabled={!modelsReady}>
            Start camera
          </button>
        ) : (
          <button style={{ ...S.btn, opacity: busy ? 0.5 : 1 }} onClick={match} disabled={busy}>
            {busy ? "Scanning…" : "Find my matches"}
          </button>
        )}
        <label style={S.ghost}>
          Load celebs.json
          <input type="file" accept="application/json,.json" onChange={onLoadJson} style={{ display: "none" }} />
        </label>
      </div>

      <p style={{ ...S.status, animation: !modelsReady && !error ? "pulse 1.4s infinite" : "none" }}>{status}</p>
      {error && <p style={S.error}>{error}</p>}

      {ranked && (
        <div style={S.results}>
          <div style={{ ...S.verdict, color: verdictColor }}>
            {verdict === "strong" && "✓ Strong match"}
            {verdict === "loose" && "≈ Loose resemblance"}
            {verdict === "none" && "— No strong match"}
          </div>
          {ranked.map((r, i) => (
            <div key={i} style={{ ...S.row, opacity: verdict === "none" && i === 0 ? 0.85 : 1 }}>
              <div style={S.rank}>{i + 1}</div>
              {r.img
                ? <img src={r.img} alt="" crossOrigin="anonymous" style={S.thumb} />
                : <div style={{ ...S.thumb, ...S.thumbBlank }}>{r.name.slice(0, 1)}</div>}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={S.name}>{r.name}</div>
                <div style={S.bar}>
                  <div style={{ ...S.barFill, width: `${r.sim}%`, background: i === 0 ? verdictColor : "#3a4258" }} />
                </div>
              </div>
              <div style={S.pct}>{r.sim}%</div>
            </div>
          ))}
        </div>
      )}

      <p style={S.foot}>{indexed} face{indexed === 1 ? "" : "s"} in gallery</p>
    </div>
  );
}

const S = {
  wrap: { minHeight: "100vh", background: "#0b0d12", color: "#e8eaf0", fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 20px", gap: 16 },
  head: { textAlign: "center" },
  h1: { margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em" },
  sub: { margin: "6px 0 0", color: "#8b90a0", fontSize: 13.5, maxWidth: 360 },
  stage: { position: "relative", width: 360, maxWidth: "100%", aspectRatio: "4 / 3", borderRadius: 16, overflow: "hidden", background: "#141822", border: "1px solid #232838" },
  video: { width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" },
  placeholder: { position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#4a5063", fontSize: 14 },
  controls: { display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" },
  btn: { background: "#5b8cff", color: "#fff", border: "none", borderRadius: 10, padding: "12px 26px", fontSize: 15, fontWeight: 600, cursor: "pointer" },
  ghost: { background: "transparent", color: "#aab0c0", border: "1px solid #2a3042", borderRadius: 10, padding: "12px 20px", fontSize: 14, cursor: "pointer", display: "inline-flex", alignItems: "center" },
  status: { color: "#8b90a0", fontSize: 13, margin: 0, minHeight: 18, textAlign: "center", maxWidth: 360 },
  error: { color: "#ff6b6b", fontSize: 13, margin: 0, maxWidth: 360, textAlign: "center" },
  results: { width: 360, maxWidth: "100%", background: "#141822", border: "1px solid #232838", borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", gap: 12 },
  verdict: { fontSize: 14, fontWeight: 600, textAlign: "center" },
  row: { display: "flex", gap: 12, alignItems: "center" },
  rank: { width: 18, color: "#5a6072", fontSize: 13, fontWeight: 600, textAlign: "center", flexShrink: 0 },
  thumb: { width: 48, height: 48, borderRadius: 10, objectFit: "cover", flexShrink: 0 },
  thumbBlank: { display: "grid", placeItems: "center", background: "#232838", color: "#5b8cff", fontSize: 20, fontWeight: 700 },
  name: { fontSize: 15, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  bar: { height: 5, background: "#232838", borderRadius: 99, overflow: "hidden", marginTop: 6 },
  barFill: { height: "100%", borderRadius: 99 },
  pct: { fontSize: 13, color: "#aab0c0", width: 38, textAlign: "right", flexShrink: 0 },
  foot: { color: "#4a5063", fontSize: 12, margin: 0 },
};
