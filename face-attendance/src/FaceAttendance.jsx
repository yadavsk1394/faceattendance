import { useState, useEffect, useRef, useCallback } from "react";

const STORAGE_KEY = "face_attendance_employees";
const LOG_KEY = "face_attendance_log";

const COLORS = {
  primary: "#1A1A2E",
  accent: "#4F8EF7",
  success: "#22C55E",
  danger: "#EF4444",
  warning: "#F59E0B",
  surface: "#F8FAFC",
  border: "#E2E8F0",
  text: "#0F172A",
  muted: "#64748B",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: #F1F5F9; color: ${COLORS.text}; }
  .app { min-height: 100vh; }
  .topbar {
    background: ${COLORS.primary};
    color: white;
    padding: 0 2rem;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky; top: 0; z-index: 100;
  }
  .topbar-title { font-size: 15px; font-weight: 600; letter-spacing: 0.02em; display: flex; align-items: center; gap: 10px; }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: ${COLORS.accent}; }
  .tabs { display: flex; gap: 2px; background: rgba(255,255,255,0.08); border-radius: 8px; padding: 3px; }
  .tab { padding: 5px 16px; border: none; background: transparent; color: rgba(255,255,255,0.6); cursor: pointer; border-radius: 6px; font-size: 13px; font-weight: 500; transition: all 0.15s; }
  .tab.active { background: white; color: ${COLORS.primary}; }
  .content { max-width: 1100px; margin: 0 auto; padding: 2rem; }
  .section-title { font-size: 22px; font-weight: 600; margin-bottom: 1.5rem; color: ${COLORS.text}; }
  .card { background: white; border-radius: 14px; border: 1px solid ${COLORS.border}; padding: 1.5rem; margin-bottom: 1.25rem; }
  .camera-wrap { position: relative; width: 100%; max-width: 520px; margin: 0 auto; }
  .video-box { width: 100%; border-radius: 12px; overflow: hidden; background: #0F172A; aspect-ratio: 4/3; display: flex; align-items: center; justify-content: center; position: relative; }
  video { width: 100%; height: 100%; object-fit: cover; display: block; }
  canvas.overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; }
  .camera-placeholder { color: rgba(255,255,255,0.3); font-size: 14px; text-align: center; }
  .btn { padding: 9px 20px; border-radius: 8px; border: none; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.15s; display: inline-flex; align-items: center; gap: 7px; }
  .btn-primary { background: ${COLORS.accent}; color: white; }
  .btn-primary:hover { background: #3a7de0; }
  .btn-success { background: ${COLORS.success}; color: white; }
  .btn-success:hover { background: #16a34a; }
  .btn-danger { background: ${COLORS.danger}; color: white; }
  .btn-outline { background: transparent; color: ${COLORS.muted}; border: 1px solid ${COLORS.border}; }
  .btn-outline:hover { background: #F8FAFC; }
  .btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .btn-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 1rem; }
  .input { width: 100%; padding: 9px 13px; border: 1px solid ${COLORS.border}; border-radius: 8px; font-size: 14px; font-family: inherit; outline: none; transition: border 0.15s; }
  .input:focus { border-color: ${COLORS.accent}; box-shadow: 0 0 0 3px rgba(79,142,247,0.12); }
  .label { font-size: 13px; font-weight: 500; color: ${COLORS.muted}; margin-bottom: 5px; display: block; }
  .form-row { margin-bottom: 1rem; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 99px; font-size: 12px; font-weight: 500; }
  .badge-green { background: #DCFCE7; color: #166534; }
  .badge-red { background: #FEE2E2; color: #991B1B; }
  .badge-blue { background: #DBEAFE; color: #1E40AF; }
  .badge-gray { background: #F1F5F9; color: #475569; }
  .alert { padding: 12px 16px; border-radius: 10px; font-size: 14px; margin-bottom: 1rem; font-weight: 500; display: flex; align-items: center; gap: 8px; }
  .alert-success { background: #DCFCE7; color: #166534; }
  .alert-error { background: #FEE2E2; color: #991B1B; }
  .alert-info { background: #DBEAFE; color: #1E40AF; }
  .alert-warning { background: #FEF3C7; color: #92400E; }
  .emp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin-top: 1rem; }
  .emp-card { background: white; border: 1px solid ${COLORS.border}; border-radius: 12px; padding: 1rem; text-align: center; position: relative; }
  .emp-avatar { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; margin: 0 auto 8px; display: block; background: #E2E8F0; }
  .emp-name { font-weight: 600; font-size: 14px; }
  .emp-dept { font-size: 12px; color: ${COLORS.muted}; margin-top: 2px; }
  .emp-delete { position: absolute; top: 8px; right: 8px; background: none; border: none; cursor: pointer; color: ${COLORS.danger}; font-size: 16px; opacity: 0.5; }
  .emp-delete:hover { opacity: 1; }
  .log-table { width: 100%; border-collapse: collapse; font-size: 14px; }
  .log-table th { text-align: left; padding: 10px 14px; font-size: 12px; font-weight: 600; color: ${COLORS.muted}; background: #F8FAFC; border-bottom: 1px solid ${COLORS.border}; letter-spacing: 0.04em; text-transform: uppercase; }
  .log-table td { padding: 11px 14px; border-bottom: 1px solid #F1F5F9; vertical-align: middle; }
  .log-table tr:last-child td { border-bottom: none; }
  .log-table tr:hover td { background: #FAFBFC; }
  .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 1.5rem; }
  .stat-card { background: white; border-radius: 12px; border: 1px solid ${COLORS.border}; padding: 1.1rem 1.25rem; }
  .stat-val { font-size: 28px; font-weight: 600; font-family: 'JetBrains Mono', monospace; }
  .stat-lbl { font-size: 12px; color: ${COLORS.muted}; margin-top: 2px; }
  .scan-ring { position: absolute; inset: 0; border-radius: 12px; pointer-events: none; }
  .match-banner { position: absolute; bottom: 0; left: 0; right: 0; padding: 12px; background: rgba(34,197,94,0.92); color: white; font-weight: 600; font-size: 15px; text-align: center; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; }
  .no-match-banner { background: rgba(239,68,68,0.88); }
  .step-indicator { display: flex; gap: 8px; margin-bottom: 1.25rem; }
  .step { padding: 5px 14px; border-radius: 99px; font-size: 12px; font-weight: 600; border: 1.5px solid; }
  .step-active { background: ${COLORS.accent}; border-color: ${COLORS.accent}; color: white; }
  .step-done { background: #DCFCE7; border-color: ${COLORS.success}; color: #166534; }
  .step-idle { background: transparent; border-color: ${COLORS.border}; color: ${COLORS.muted}; }
  .accuracy-bar-wrap { background: #F1F5F9; border-radius: 99px; height: 6px; flex: 1; overflow: hidden; }
  .accuracy-bar { height: 100%; border-radius: 99px; transition: width 0.4s; }
  .divider { border: none; border-top: 1px solid ${COLORS.border}; margin: 1.25rem 0; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
  @media (max-width: 700px) { .two-col { grid-template-columns: 1fr; } .content { padding: 1rem; } .stats-row { grid-template-columns: 1fr 1fr; } }
  .empty { text-align: center; padding: 2.5rem; color: ${COLORS.muted}; font-size: 14px; }
  .photo-thumb { width: 38px; height: 38px; border-radius: 50%; object-fit: cover; border: 2px solid ${COLORS.border}; }
  .confidence-pill { font-family: 'JetBrains Mono', monospace; font-size: 12px; }
`;

function getStorage(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch { return fallback; }
}
function setStorage(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

function faceDistance(d1, d2) {
  if (!d1 || !d2 || d1.length !== d2.length) return 1;
  let sum = 0;
  for (let i = 0; i < d1.length; i++) sum += (d1[i] - d2[i]) ** 2;
  return Math.sqrt(sum);
}

const THRESHOLD = 0.52;

export default function FaceAttendance() {
  const [tab, setTab] = useState("mark");
  const [employees, setEmployees] = useState(() => getStorage(STORAGE_KEY, []));
  const [log, setLog] = useState(() => getStorage(LOG_KEY, []));
  const [faceApi, setFaceApi] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [alert, setAlert] = useState(null);
  const [registerStep, setRegisterStep] = useState(0);
  const [regName, setRegName] = useState("");
  const [regDept, setRegDept] = useState("");
  const [regDescriptor, setRegDescriptor] = useState(null);
  const [regPhoto, setRegPhoto] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const [filterDate, setFilterDate] = useState("");
  const [filterName, setFilterName] = useState("");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  const showAlert = (msg, type = "info", duration = 3500) => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), duration);
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js";
    script.onload = async () => {
      const fapi = window.faceapi;
      const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/";
      try {
        await Promise.all([
          fapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          fapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          fapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setFaceApi(fapi);
        setModelsLoaded(true);
      } catch (e) {
        showAlert("Could not load face models. Check your connection.", "error", 8000);
      }
    };
    document.head.appendChild(script);
    return () => { stopCamera(); };
  }, []);

  useEffect(() => { setStorage(STORAGE_KEY, employees); }, [employees]);
  useEffect(() => { setStorage(LOG_KEY, log); }, [log]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640, height: 480 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
    } catch {
      showAlert("Camera access denied. Please allow camera in browser settings.", "error");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (scanIntervalRef.current) { clearInterval(scanIntervalRef.current); scanIntervalRef.current = null; }
    setCameraOn(false);
    setScanning(false);
    setMatchResult(null);
  };

  const captureFrame = async () => {
    if (!videoRef.current || !faceApi) return null;
    const vid = videoRef.current;
    const detection = await faceApi.detectSingleFace(vid, new faceApi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();
    return detection || null;
  };

  const drawDetection = (detection) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || !faceApi) return;
    const dims = faceApi.matchDimensions(canvas, video, true);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    if (detection) {
      const resized = faceApi.resizeResults(detection, dims);
      faceApi.draw.drawDetections(canvas, [resized]);
    }
  };

  const startScan = () => {
    setScanning(true);
    setMatchResult(null);
    scanIntervalRef.current = setInterval(async () => {
      const det = await captureFrame();
      drawDetection(det);
      if (det) {
        clearInterval(scanIntervalRef.current);
        setScanning(false);
        const desc = det.descriptor;
        if (employees.length === 0) { setMatchResult({ type: "no-match", name: "No employees registered" }); return; }
        let best = null, bestDist = 1;
        for (const emp of employees) {
          const dist = faceDistance(emp.descriptor, Array.from(desc));
          if (dist < bestDist) { bestDist = dist; best = emp; }
        }
        const confidence = Math.round((1 - bestDist) * 100);
        if (bestDist < THRESHOLD) {
          const now = new Date();
          const today = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
          const time = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
          const entry = { id: Date.now(), empId: best.id, name: best.name, dept: best.dept, photo: best.photo, date: today, time, confidence, rawDate: now.toISOString().split("T")[0] };
          setLog(prev => [entry, ...prev]);
          setMatchResult({ type: "match", name: best.name, dept: best.dept, confidence, time });
          showAlert(`✓ Attendance marked for ${best.name} (${confidence}% match)`, "success");
        } else {
          setMatchResult({ type: "no-match", name: "Face not recognized", confidence });
          showAlert("Face not recognized. Register this person first.", "error");
        }
      }
    }, 300);
  };

  const captureForRegister = useCallback(async () => {
    setCapturing(true);
    const det = await captureFrame();
    drawDetection(det);
    if (!det) { showAlert("No face detected. Position your face clearly in frame.", "warning"); setCapturing(false); return; }
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    setRegDescriptor(Array.from(det.descriptor));
    setRegPhoto(canvas.toDataURL("image/jpeg", 0.7));
    setCapturing(false);
    setRegisterStep(2);
    showAlert("Face captured! Fill in details and save.", "success");
  }, [faceApi, employees]);

  const saveEmployee = () => {
    if (!regName.trim()) { showAlert("Enter employee name.", "warning"); return; }
    if (!regDescriptor) { showAlert("Capture face first.", "warning"); return; }
    const emp = { id: Date.now(), name: regName.trim(), dept: regDept.trim() || "General", photo: regPhoto, descriptor: regDescriptor };
    setEmployees(prev => [...prev, emp]);
    showAlert(`${emp.name} registered successfully!`, "success");
    setRegisterStep(0); setRegName(""); setRegDept(""); setRegDescriptor(null); setRegPhoto(null);
    stopCamera();
  };

  const deleteEmployee = (id) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    showAlert("Employee removed.", "info");
  };

  const filteredLog = log.filter(e => {
    if (filterDate && e.rawDate !== filterDate) return false;
    if (filterName && !e.name.toLowerCase().includes(filterName.toLowerCase())) return false;
    return true;
  });

  const todayStr = new Date().toISOString().split("T")[0];
  const todayLog = log.filter(e => e.rawDate === todayStr);
  const uniqueToday = [...new Set(todayLog.map(e => e.empId))].length;
  const avgConf = log.length ? Math.round(log.reduce((s, e) => s + e.confidence, 0) / log.length) : 0;

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="topbar">
          <div className="topbar-title">
            <div className="dot" />
            FaceAttend
            {modelsLoaded
              ? <span style={{ fontSize: 11, background: "rgba(34,197,94,0.2)", color: "#86efac", padding: "2px 8px", borderRadius: 99 }}>Models ready</span>
              : <span style={{ fontSize: 11, background: "rgba(245,158,11,0.2)", color: "#fcd34d", padding: "2px 8px", borderRadius: 99 }}>Loading models…</span>
            }
          </div>
          <div className="tabs">
            {["mark", "register", "employees", "log"].map(t => (
              <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => { setTab(t); stopCamera(); setRegisterStep(0); }}>{t === "mark" ? "Mark Attendance" : t === "register" ? "Register" : t === "employees" ? "Employees" : "Log"}</button>
            ))}
          </div>
        </div>

        <div className="content">
          {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

          {tab === "mark" && (
            <>
              <p className="section-title">Mark Attendance</p>
              <div className="two-col">
                <div>
                  <div className="card" style={{ padding: "1rem" }}>
                    <div className="video-box">
                      {!cameraOn && <div className="camera-placeholder"><div style={{ fontSize: 40, marginBottom: 8 }}>📷</div>Start camera to scan</div>}
                      <video ref={videoRef} playsInline muted style={{ display: cameraOn ? "block" : "none" }} />
                      <canvas ref={canvasRef} className="overlay" />
                      {matchResult && (
                        <div className={`match-banner ${matchResult.type === "no-match" ? "no-match-banner" : ""}`}>
                          {matchResult.type === "match" ? `✓ ${matchResult.name} — ${matchResult.confidence}%` : `✗ ${matchResult.name}`}
                        </div>
                      )}
                    </div>
                    <div className="btn-row">
                      {!cameraOn
                        ? <button className="btn btn-primary" disabled={!modelsLoaded} onClick={startCamera}>📷 Open Camera</button>
                        : <>
                          <button className="btn btn-success" disabled={scanning} onClick={startScan}>{scanning ? "⏳ Scanning…" : "🔍 Scan Face"}</button>
                          <button className="btn btn-outline" onClick={() => { stopCamera(); setMatchResult(null); }}>✕ Stop</button>
                          {matchResult && <button className="btn btn-primary" onClick={() => { setMatchResult(null); startScan(); }}>↻ Scan Again</button>}
                        </>
                      }
                    </div>
                  </div>
                </div>
                <div>
                  <div className="stats-row" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: "1rem" }}>
                    <div className="stat-card"><div className="stat-val" style={{ color: COLORS.accent }}>{employees.length}</div><div className="stat-lbl">Registered</div></div>
                    <div className="stat-card"><div className="stat-val" style={{ color: COLORS.success }}>{uniqueToday}</div><div className="stat-lbl">Present today</div></div>
                    <div className="stat-card"><div className="stat-val" style={{ color: COLORS.warning }}>{employees.length - uniqueToday}</div><div className="stat-lbl">Absent today</div></div>
                    <div className="stat-card"><div className="stat-val" style={{ color: COLORS.muted }}>{avgConf}%</div><div className="stat-lbl">Avg accuracy</div></div>
                  </div>
                  <div className="card">
                    <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Today's attendance</p>
                    {todayLog.length === 0 ? <div className="empty" style={{ padding: "1rem" }}>No records yet today.</div> :
                      [...new Map(todayLog.map(e => [e.empId, e])).values()].map(e => (
                        <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                          {e.photo && <img src={e.photo} className="photo-thumb" alt="" />}
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500, fontSize: 13 }}>{e.name}</div>
                            <div style={{ fontSize: 11, color: COLORS.muted }}>{e.dept} · {e.time}</div>
                          </div>
                          <span className="badge badge-green confidence-pill">{e.confidence}%</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {tab === "register" && (
            <>
              <p className="section-title">Register Employee</p>
              <div className="two-col">
                <div className="card">
                  <div className="step-indicator">
                    {["Open Camera", "Capture Face", "Save Details"].map((s, i) => (
                      <span key={i} className={`step ${registerStep === i ? "step-active" : registerStep > i ? "step-done" : "step-idle"}`}>{registerStep > i ? "✓" : i + 1} {s}</span>
                    ))}
                  </div>
                  <div className="video-box" style={{ marginBottom: "1rem" }}>
                    {!cameraOn && <div className="camera-placeholder"><div style={{ fontSize: 36, marginBottom: 8 }}>🙂</div>Position face in frame</div>}
                    <video ref={videoRef} playsInline muted style={{ display: cameraOn ? "block" : "none" }} />
                    <canvas ref={canvasRef} className="overlay" />
                    {regPhoto && !cameraOn && <img src={regPhoto} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }} alt="captured" />}
                  </div>
                  <div className="btn-row">
                    {registerStep === 0 && <button className="btn btn-primary" disabled={!modelsLoaded} onClick={() => { startCamera(); setRegisterStep(1); }}>📷 Start Camera</button>}
                    {registerStep === 1 && <>
                      <button className="btn btn-success" disabled={capturing} onClick={captureForRegister}>{capturing ? "⏳ Detecting…" : "📸 Capture Face"}</button>
                      <button className="btn btn-outline" onClick={() => { stopCamera(); setRegisterStep(0); }}>✕ Cancel</button>
                    </>}
                    {registerStep === 2 && <button className="btn btn-outline" onClick={() => { setRegPhoto(null); setRegDescriptor(null); startCamera(); setRegisterStep(1); }}>↻ Retake</button>}
                  </div>
                </div>
                <div className="card">
                  <div className="form-row">
                    <label className="label">Full Name *</label>
                    <input className="input" placeholder="e.g. Priya Sharma" value={regName} onChange={e => setRegName(e.target.value)} />
                  </div>
                  <div className="form-row">
                    <label className="label">Department</label>
                    <input className="input" placeholder="e.g. Engineering" value={regDept} onChange={e => setRegDept(e.target.value)} />
                  </div>
                  <hr className="divider" />
                  {regDescriptor
                    ? <div className="alert alert-success" style={{ marginBottom: "1rem" }}>✓ Face data captured ({regDescriptor.length} points)</div>
                    : <div className="alert alert-info" style={{ marginBottom: "1rem" }}>Capture face first using the camera.</div>
                  }
                  <button className="btn btn-primary" style={{ width: "100%" }} disabled={!regDescriptor || !regName.trim()} onClick={saveEmployee}>💾 Save Employee</button>
                </div>
              </div>
            </>
          )}

          {tab === "employees" && (
            <>
              <p className="section-title">Registered Employees <span style={{ fontWeight: 400, fontSize: 15, color: COLORS.muted }}>({employees.length})</span></p>
              {employees.length === 0
                ? <div className="card empty">No employees registered yet. Go to Register tab to add employees.</div>
                : <div className="emp-grid">
                  {employees.map(emp => (
                    <div key={emp.id} className="emp-card">
                      <button className="emp-delete" onClick={() => deleteEmployee(emp.id)} title="Remove">✕</button>
                      {emp.photo ? <img src={emp.photo} className="emp-avatar" alt={emp.name} /> : <div className="emp-avatar" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>👤</div>}
                      <div className="emp-name">{emp.name}</div>
                      <div className="emp-dept">{emp.dept}</div>
                      <div style={{ marginTop: 8 }}>
                        <span className="badge badge-blue">{log.filter(l => l.empId === emp.id).length} records</span>
                      </div>
                    </div>
                  ))}
                </div>
              }
            </>
          )}

          {tab === "log" && (
            <>
              <p className="section-title">Attendance Log</p>
              <div className="card" style={{ marginBottom: "1rem", padding: "1rem" }}>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <label className="label">Filter by name</label>
                    <input className="input" placeholder="Search…" value={filterName} onChange={e => setFilterName(e.target.value)} />
                  </div>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <label className="label">Filter by date</label>
                    <input className="input" type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
                  </div>
                  {(filterDate || filterName) && <button className="btn btn-outline" onClick={() => { setFilterDate(""); setFilterName(""); }}>Clear</button>}
                  {log.length > 0 && <button className="btn btn-danger" onClick={() => { if (window.confirm("Clear all logs?")) setLog([]); }}>🗑 Clear All</button>}
                </div>
              </div>
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                {filteredLog.length === 0
                  ? <div className="empty">No attendance records{filterDate || filterName ? " matching filters" : " yet"}.</div>
                  : <table className="log-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Department</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Accuracy</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLog.map(entry => (
                        <tr key={entry.id}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              {entry.photo ? <img src={entry.photo} className="photo-thumb" alt="" /> : <div className="photo-thumb" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👤</div>}
                              <span style={{ fontWeight: 500 }}>{entry.name}</span>
                            </div>
                          </td>
                          <td style={{ color: COLORS.muted }}>{entry.dept}</td>
                          <td style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13 }}>{entry.date}</td>
                          <td style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13 }}>{entry.time}</td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div className="accuracy-bar-wrap">
                                <div className="accuracy-bar" style={{ width: `${entry.confidence}%`, background: entry.confidence >= 80 ? COLORS.success : entry.confidence >= 65 ? COLORS.warning : COLORS.danger }} />
                              </div>
                              <span className="confidence-pill" style={{ fontSize: 12, minWidth: 34, color: COLORS.muted }}>{entry.confidence}%</span>
                            </div>
                          </td>
                          <td><span className="badge badge-green">Present</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                }
              </div>
              {filteredLog.length > 0 && <p style={{ textAlign: "right", fontSize: 12, color: COLORS.muted, marginTop: 8 }}>{filteredLog.length} record{filteredLog.length !== 1 ? "s" : ""} shown</p>}
            </>
          )}
        </div>
      </div>
    </>
  );
}
