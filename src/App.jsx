import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";

const ADMIN_PASSWORD = "NPSCA2026!";
const ROTATIONS = [-1.5, 2, -2.5, 1.2, -0.8, 1.8, -1.2, 2.3, -0.5, 1.5];

function formatDate(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")}`;
}

const styles = `
  @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
  @font-face {
    font-family: 'Eulyoo1945';
    src: url('https://www.eulyoo.co.kr/css/font/Eulyoo1945-Regular.woff2') format('woff2');
    font-weight: normal;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg-green: #BDD3A8;
    --bg-cream: #FFFEF0;
    --brand-dark: #2E2D2B;
    --line: 2px solid #2E2D2B;
    --letter-a: #B56B4D;
    --letter-b: #2E7D7D;
    --question-a: #4B5EA6;
    --question-b: #6B8F6B;
  }

  body {
    background-color: var(--bg-green);
    background-image:
      radial-gradient(rgba(0,0,0,0.05) 1px, transparent 0),
      radial-gradient(rgba(0,0,0,0.05) 1px, transparent 0);
    background-size: 40px 40px;
    background-position: 0 0, 20px 20px;
    font-family: 'Pretendard', -apple-system, sans-serif;
    color: var(--brand-dark);
    min-height: 100vh;
    overflow-x: hidden;
  }

  .pl-layout { display: flex; min-height: 100vh; }

  .pl-sidebar {
    width: 360px;
    flex-shrink: 0;
    border-right: var(--line);
    padding: 1.5rem;
    display: flex; flex-direction: column;
    gap: 1rem;
    position: sticky; top: 0; height: 100vh;
    background: rgba(189,211,168,0.3);
    overflow-y: auto;
    overflow-x: hidden;
  }

  .pl-event-badge {
    color: var(--brand-dark);
    font-size: 1.7rem; font-weight: 900;
    letter-spacing: -0.02em;
    line-height: 1; text-align: center;
    opacity: 1;
  }

  .pl-tabs { display: flex; gap: 0; border: var(--line); overflow: hidden; }
  .pl-tab {
    flex: 1; padding: 0.6rem 0.5rem;
    font-family: 'Pretendard', sans-serif;
    font-size: 0.75rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.05em;
    background: transparent; color: var(--brand-dark);
    border: none; cursor: pointer; transition: all 0.15s;
    line-height: 1.3; text-align: center;
  }
  .pl-tab:first-child { border-right: var(--line); }
  .pl-tab.active-letter { background: var(--letter-a); color: white; }
  .pl-tab.active-question { background: var(--question-a); color: white; }
  .pl-tab:hover:not(.active-letter):not(.active-question) { background: rgba(0,0,0,0.06); }

  .pl-composer-card {
    width: 100%;
    background: var(--bg-cream);
    border: 10px solid transparent;
    padding: 1.25rem 1.5rem;
    box-shadow: 0 15px 40px rgba(0,0,0,0.2);
    display: flex; flex-direction: column; gap: 0.85rem;
  }
  .pl-composer-card.letter-card {
    border-image: repeating-linear-gradient(
      -45deg,
      var(--letter-a), var(--letter-a) 15px,
      var(--bg-cream) 15px, var(--bg-cream) 30px,
      var(--letter-b) 30px, var(--letter-b) 45px,
      var(--bg-cream) 45px, var(--bg-cream) 60px
    ) 10;
  }
  .pl-composer-card.question-card {
    border-image: repeating-linear-gradient(
      -45deg,
      var(--question-a), var(--question-a) 15px,
      var(--bg-cream) 15px, var(--bg-cream) 30px,
      var(--question-b) 30px, var(--question-b) 45px,
      var(--bg-cream) 45px, var(--bg-cream) 60px
    ) 10;
  }

  .pl-card-top {
    display: flex; justify-content: space-between; align-items: flex-end;
    border-bottom: var(--line); padding-bottom: 0.75rem;
  }
  .pl-card-top h2 {
    font-size: 1.9rem; font-weight: 900;
    line-height: 1; letter-spacing: -0.02em;
  }

  /* 우표 스탬프 */
  .postal-stamp-container {
    position: relative;
    width: 90px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.85;
    transform: rotate(-10deg);
    flex-shrink: 0;
  }
  .oval-stamp {
    width: 80px;
    height: 52px;
    border: 2px solid currentColor;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    font-family: 'Pretendard', sans-serif;
    overflow: visible;
  }
  .oval-stamp .top-arch {
    position: absolute;
    top: 5px;
    font-size: 0.45rem;
    font-weight: 900;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .oval-stamp .stamp-main {
    font-size: 0.65rem;
    font-weight: 900;
    letter-spacing: 0.04em;
    text-align: center;
    line-height: 1.3;
    padding: 1px 4px;
    border-top: 1px solid currentColor;
    border-bottom: 1px solid currentColor;
  }
  .oval-stamp .bottom-arch {
    position: absolute;
    bottom: 5px;
    font-size: 0.38rem;
    font-weight: 700;
    letter-spacing: 0.03em;
  }
  .wavy-lines {
    position: absolute;
    right: -38px;
    top: 10px;
    width: 42px;
    height: 36px;
    pointer-events: none;
  }
  .wavy-lines svg {
    width: 100%;
    height: 100%;
    fill: none;
    stroke-width: 1.5;
  }

  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
  .pl-textarea-wrap { position: relative; }
  .pl-cursor {
    position: absolute; top: 0; left: 0;
    font-size: 1.1rem; line-height: 1.7;
    font-weight: 300; pointer-events: none; user-select: none;
    animation: blink 1s step-end infinite;
  }
  .pl-cursor.letter { color: var(--letter-a); }
  .pl-cursor.question { color: var(--question-a); }

  .pl-textarea {
    width: 100%; height: 180px;
    background: transparent; border: none; resize: none;
    font-family: 'Pretendard', sans-serif;
    font-size: 0.95rem; line-height: 1.7;
    color: var(--brand-dark); position: relative; z-index: 1;
  }
  .pl-textarea:focus { outline: none; }
  .pl-textarea::placeholder { color: var(--brand-dark); opacity: 0.38; }
  .pl-textarea.letter { caret-color: var(--letter-a); }
  .pl-textarea.question { caret-color: var(--question-a); }

  .pl-char-count { font-size: 0.68rem; opacity: 0.35; font-weight: 600; text-align: right; }

  .pl-card-bottom {
    display: flex; flex-direction: column; gap: 0.65rem;
    border-top: 1px solid rgba(46,45,43,0.15); padding-top: 0.65rem;
  }
  .pl-input-line {
    background: transparent; border: none; border-bottom: var(--line);
    padding: 0.25rem 0; font-family: 'Pretendard', sans-serif;
    font-size: 0.9rem; font-weight: 600; color: var(--brand-dark); width: 100%;
  }
  .pl-input-line:focus { outline: none; }
  .pl-input-line::placeholder { color: var(--brand-dark); opacity: 0.38; font-weight: 400; }

  .pl-send-btn {
    border: var(--line); padding: 0.65rem;
    font-family: 'Pretendard', sans-serif; font-size: 0.82rem;
    font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
    cursor: pointer; width: 100%; transition: all 0.1s;
  }
  .pl-send-btn.letter { background: var(--letter-a); color: white; border-color: var(--letter-a); }
  .pl-send-btn.letter:hover { background: transparent; color: var(--letter-a); }
  .pl-send-btn.question { background: var(--question-a); color: white; border-color: var(--question-a); }
  .pl-send-btn.question:hover { background: transparent; color: var(--question-a); }
  .pl-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .pl-label {
    font-size: 0.7rem; text-transform: uppercase;
    letter-spacing: 0.1em; font-weight: 700; display: block;
    text-align: left;
  }

  .pl-sidebar-footer {
    margin-top: auto;
    padding-top: 1.5rem;
    font-size: 0.72rem; font-weight: 700;
    letter-spacing: 0.04em; opacity: 0.45;
    text-align: center; line-height: 1.6;
  }

  .pl-bulletin {
    flex: 1; padding: 3rem 2rem;
    display: flex; flex-wrap: wrap;
    justify-content: center; align-content: flex-start;
    gap: 2.5rem; position: relative;
  }

  .pl-bulletin-header {
    width: 100%; display: flex;
    justify-content: space-between; align-items: center; margin-bottom: 0.5rem;
  }
  .pl-filter-group { display: flex; gap: 0.4rem; flex-wrap: wrap; }
  .pl-pill {
    display: inline-flex; align-items: center; justify-content: center;
    border: var(--line); padding: 0.4rem 1rem;
    font-family: 'Pretendard', sans-serif; font-size: 0.75rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.05em;
    background: var(--bg-cream); color: var(--brand-dark);
    cursor: pointer; transition: all 0.1s; border-radius: 0; white-space: nowrap;
  }
  .pl-pill:hover { background: var(--brand-dark); color: var(--bg-cream); }
  .pl-pill.active { background: var(--brand-dark); color: var(--bg-cream); }
  .pl-pill.active-letter-pill { background: var(--letter-a); color: white; border-color: var(--letter-a); }
  .pl-pill.active-question-pill { background: var(--question-a); color: white; border-color: var(--question-a); }
  .pl-pill.admin-active { background: var(--letter-a); color: white; border-color: var(--letter-a); }

  .pl-letter-card {
    width: 300px; padding: 1.75rem;
    background: var(--bg-cream); border: var(--line);
    display: flex; flex-direction: column; gap: 1.25rem;
    box-shadow: 5px 5px 15px rgba(0,0,0,0.12);
    position: relative;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .pl-letter-card:hover {
    transform: scale(1.03) rotate(0deg) !important;
    box-shadow: 8px 8px 25px rgba(0,0,0,0.18); z-index: 10;
  }
  .pl-letter-card::before {
    content: ''; position: absolute;
    top: -10px; left: 50%; transform: translateX(-50%);
    width: 18px; height: 18px; border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(0,0,0,0.2);
    z-index: 2;
  }
  .pl-letter-card.pin-letter::before { background: var(--letter-a); }
  .pl-letter-card.pin-question::before { background: var(--question-a); }
  .pl-letter-card.new-card { animation: popIn 0.4s ease; }
  @keyframes popIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; } }

  .pl-letter-meta { display: flex; justify-content: space-between; align-items: center; }
  .pl-letter-type {
    font-size: 0.65rem; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase; padding: 0.15rem 0.5rem;
    border: 1.5px solid; opacity: 0.7;
  }
  .pl-letter-type.letter { border-color: var(--letter-a); color: var(--letter-a); }
  .pl-letter-type.question { border-color: var(--question-a); color: var(--question-a); }

  .pl-letter-text { font-family: 'Eulyoo1945', serif; font-size: 0.95rem; line-height: 1.7; white-space: pre-wrap; text-align: left; }
  .pl-letter-sig { font-size: 0.85rem; font-weight: 700; text-align: right; color: var(--letter-b); }

  .pl-delete-btn {
    position: absolute; top: 0.75rem; right: 0.75rem;
    background: transparent; border: 1.5px solid var(--letter-a); color: var(--letter-a);
    font-size: 0.65rem; font-weight: 700; padding: 0.2rem 0.5rem;
    cursor: pointer; text-transform: uppercase; transition: all 0.1s;
    font-family: 'Pretendard', sans-serif;
  }
  .pl-delete-btn:hover { background: var(--letter-a); color: white; }

  .pl-admin-bar {
    width: 100%; background: var(--brand-dark); color: var(--bg-cream);
    padding: 0.6rem 1rem; display: flex;
    justify-content: space-between; align-items: center;
    font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.5rem;
  }
  .pl-admin-btn {
    background: transparent; border: 1.5px solid rgba(243,239,231,0.5);
    color: #F3EFE7; font-size: 0.7rem; font-weight: 700;
    padding: 0.25rem 0.6rem; cursor: pointer; text-transform: uppercase;
    transition: all 0.1s; font-family: 'Pretendard', sans-serif; white-space: nowrap;
  }
  .pl-admin-btn:hover { background: rgba(243,239,231,0.15); }
  .pl-admin-btn.csv { border-color: #BDD3A8; color: #BDD3A8; }
  .pl-admin-btn.exit { border-color: #e8a0a0; color: #e8a0a0; }

  .pl-toast {
    position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%);
    background: var(--brand-dark); color: var(--bg-cream);
    padding: 0.6rem 1.4rem; font-size: 0.85rem; font-weight: 600;
    pointer-events: none; white-space: nowrap; z-index: 300;
    animation: toastIn 0.3s ease, toastOut 0.3s ease 1.7s forwards;
    font-family: 'Pretendard', sans-serif;
  }
  @keyframes toastIn  { from { opacity: 0; bottom: 1rem; } to { opacity: 1; bottom: 2rem; } }
  @keyframes toastOut { from { opacity: 1; } to { opacity: 0; } }

  .pl-modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200;
    display: flex; align-items: center; justify-content: center; padding: 1rem;
  }
  .pl-modal {
    background: var(--bg-cream); border: var(--line);
    padding: 2rem; width: 100%; max-width: 320px;
    display: flex; flex-direction: column; gap: 1.25rem;
  }
  .pl-modal-title { font-size: 1.5rem; font-weight: 900; }
  .pl-modal-input {
    background: transparent; border: none; border-bottom: var(--line);
    color: var(--brand-dark); font-size: 1rem; padding: 0.4rem 0; width: 100%;
    font-family: 'Pretendard', sans-serif;
  }
  .pl-modal-input:focus { outline: none; }
  .pl-modal-btns { display: flex; gap: 0.5rem; justify-content: flex-end; }
  .pl-modal-error { font-size: 0.8rem; color: var(--letter-a); font-weight: 700; }

  .pl-empty { color: var(--brand-dark); opacity: 0.5; font-size: 0.95rem; text-align: center; padding: 4rem 0; width: 100%; }
  .pl-loading { color: var(--brand-dark); opacity: 0.5; font-size: 0.95rem; text-align: center; padding: 4rem 0; width: 100%; }

  @media (max-width: 767px) {
    .pl-layout { flex-direction: column; }
    .pl-sidebar {
      width: 100% !important;
      height: auto;
      position: static;
      border-right: none;
      border-bottom: var(--line);
      padding: 1.25rem;
    }
    .pl-bulletin { padding: 1.5rem 1rem; gap: 2rem; }
    .pl-letter-card { width: 280px; }
    .pl-sidebar-footer { margin-top: 1rem; }
  }
`;

const LetterStamp = () => (
  <div className="postal-stamp-container" style={{ color: "var(--letter-a)" }}>
    <div className="oval-stamp">
      <span className="stamp-main">KOREA<br />POST</span>
    </div>
    <div className="wavy-lines">
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" stroke="var(--letter-a)">
        <path d="M0 5 Q 12.5 0, 25 5 T 50 5 T 75 5 T 100 5"/>
        <path d="M0 15 Q 12.5 10, 25 15 T 50 15 T 75 15 T 100 15"/>
        <path d="M0 25 Q 12.5 20, 25 25 T 50 25 T 75 25 T 100 25"/>
        <path d="M0 35 Q 12.5 30, 25 35 T 50 35 T 75 35 T 100 35"/>
      </svg>
    </div>
  </div>
);

const QuestionStamp = () => (
  <div className="postal-stamp-container" style={{ color: "var(--question-a)" }}>
    <div className="oval-stamp">
      <span className="stamp-main">SESSION<br />Q&A</span>
    </div>
    <div className="wavy-lines">
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" stroke="var(--question-a)">
        <path d="M0 5 Q 12.5 0, 25 5 T 50 5 T 75 5 T 100 5"/>
        <path d="M0 15 Q 12.5 10, 25 15 T 50 15 T 75 15 T 100 15"/>
        <path d="M0 25 Q 12.5 20, 25 25 T 50 25 T 75 25 T 100 25"/>
        <path d="M0 35 Q 12.5 30, 25 35 T 50 35 T 75 35 T 100 35"/>
      </svg>
    </div>
  </div>
);

export default function App() {
  const [mode, setMode] = useState("letter");
  const [letters, setLetters] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [letterText, setLetterText] = useState("");
  const [letterFrom, setLetterFrom] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [questionFrom, setQuestionFrom] = useState("");
  const [filter, setFilter] = useState("letter");
  const [sendingL, setSendingL] = useState(false);
  const [sendingQ, setSendingQ] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [newId, setNewId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);
  const [focusedL, setFocusedL] = useState(false);
  const [focusedQ, setFocusedQ] = useState(false);
  const toastTimer = useRef(null);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const [l, q] = await Promise.all([
      supabase.from("letters").select("*").order("created_at", { ascending: false }),
      supabase.from("questions").select("*").order("created_at", { ascending: false }),
    ]);
    if (!l.error) setLetters(l.data || []);
    if (!q.error) setQuestions(q.data || []);
    setLoading(false);
  }

  function showToast(msg) {
    setToast(null);
    setTimeout(() => {
      setToast(msg);
      clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), 2200);
    }, 10);
  }

  async function handleSendLetter() {
    if (!letterText.trim()) { showToast("편지 내용을 입력해주세요"); return; }
    setSendingL(true);
    const { data, error } = await supabase
      .from("letters")
      .insert([{ text: letterText.trim(), from_name: letterFrom.trim() || "익명의 편지", tag: "기타" }])
      .select().single();
    if (error) { showToast("오류가 발생했습니다."); }
    else {
      setLetters(prev => [data, ...prev]);
      setNewId(data.id); setTimeout(() => setNewId(null), 1000);
      setLetterText(""); setLetterFrom("");
      showToast("편지가 전송되었습니다");
    }
    setSendingL(false);
  }

  async function handleSendQuestion() {
    if (!questionText.trim()) { showToast("질문 내용을 입력해주세요"); return; }
    setSendingQ(true);
    const { data, error } = await supabase
      .from("questions")
      .insert([{ text: questionText.trim(), from_name: questionFrom.trim() || "익명" }])
      .select().single();
    if (error) { showToast("오류가 발생했습니다."); }
    else {
      setQuestions(prev => [data, ...prev]);
      setNewId(data.id); setTimeout(() => setNewId(null), 1000);
      setQuestionText(""); setQuestionFrom("");
      showToast("질문이 등록되었습니다");
    }
    setSendingQ(false);
  }

  async function handleDelete(id, table) {
    if (!window.confirm("삭제할까요?")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (!error) {
      if (table === "letters") setLetters(prev => prev.filter(l => l.id !== id));
      else setQuestions(prev => prev.filter(q => q.id !== id));
      showToast("삭제되었습니다");
    }
  }

  function handleAdminLogin() {
    if (pwInput === ADMIN_PASSWORD) {
      setIsAdmin(true); setShowAdminModal(false); setPwInput(""); setPwError(false);
      showToast("관리자 모드 활성화");
    } else { setPwError(true); }
  }

  function exportCSV(data, filename) {
    const headers = ["날짜", "이름", "내용"];
    const rows = data.map(l => [
      formatDate(l.created_at),
      `"${(l.from_name || "").replace(/"/g, '""')}"`,
      `"${(l.text || "").replace(/"/g, '""')}"`,
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    showToast("다운로드 완료");
  }

  const allItems = [
    ...letters.map(l => ({ ...l, _type: "letter" })),
    ...questions.map(q => ({ ...q, _type: "question" })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const displayed = (() => {
    const today = new Date().toDateString();
    if (filter === "letter") return allItems.filter(i => i._type === "letter");
    if (filter === "question") return allItems.filter(i => i._type === "question");
    if (filter === "today") return allItems.filter(i => new Date(i.created_at).toDateString() === today);
    return allItems;
  })();

  return (
    <>
      <style>{styles}</style>
      <div className="pl-layout">

        <aside className="pl-sidebar">
          <div className="pl-event-badge">
            국민연금, 기후에 답하라
          </div>

          <div className="pl-tabs">
            <button
              className={`pl-tab ${mode === "letter" ? "active-letter" : ""}`}
              onClick={() => { setMode("letter"); setFilter("letter"); }}>
              국민연금에게<br />편지 쓰기
            </button>
            <button
              className={`pl-tab ${mode === "question" ? "active-question" : ""}`}
              onClick={() => { setMode("question"); setFilter("question"); }}>
              패널에게<br />질문하기
            </button>
          </div>

          {mode === "letter" && (
            <div className="pl-composer-card letter-card">
              <div className="pl-card-top">
                <div style={{ textAlign: "left" }}>
                  <span className="pl-label">To</span>
                  <h2>국민연금</h2>
                </div>
                <LetterStamp />
              </div>
              <div className="pl-textarea-wrap">
                {!letterText && !focusedL && <span className="pl-cursor letter">|</span>}
                <textarea
                  className="pl-textarea letter"
                  placeholder="당신의 이야기를 적어주세요. 국민연금에 대한 생각, 우려, 혹은 제안. 당신의 목소리가 전달됩니다."
                  value={letterText}
                  onChange={e => setLetterText(e.target.value)}
                  onFocus={() => setFocusedL(true)}
                  onBlur={() => setFocusedL(false)}
                  spellCheck={false}
                />
              </div>
              <div className="pl-char-count">{letterText.length} 자</div>
              <div className="pl-card-bottom">
                <span className="pl-label">From</span>
                <input type="text" className="pl-input-line" placeholder="이름 또는 익명"
                  value={letterFrom} onChange={e => setLetterFrom(e.target.value)} />
                <button className="pl-send-btn letter" onClick={handleSendLetter} disabled={sendingL}>
                  {sendingL ? "전송 중..." : "편지 보내기"}
                </button>
              </div>
            </div>
          )}

          {mode === "question" && (
            <div className="pl-composer-card question-card">
              <div className="pl-card-top">
                <div style={{ textAlign: "left" }}>
                  <span className="pl-label">To. 패널</span>
                  <h2>질문하기</h2>
                </div>
                <QuestionStamp />
              </div>
              <div className="pl-textarea-wrap">
                {!questionText && !focusedQ && <span className="pl-cursor question">|</span>}
                <textarea
                  className="pl-textarea question"
                  placeholder="패널에게 묻고 싶은 것을 자유롭게 적어주세요. 토크 중에 선정된 질문을 함께 나눕니다."
                  value={questionText}
                  onChange={e => setQuestionText(e.target.value)}
                  onFocus={() => setFocusedQ(true)}
                  onBlur={() => setFocusedQ(false)}
                  spellCheck={false}
                />
              </div>
              <div className="pl-char-count">{questionText.length} 자</div>
              <div className="pl-card-bottom">
                <span className="pl-label">From</span>
                <input type="text" className="pl-input-line" placeholder="이름 또는 익명"
                  value={questionFrom} onChange={e => setQuestionFrom(e.target.value)} />
                <button className="pl-send-btn question" onClick={handleSendQuestion} disabled={sendingQ}>
                  {sendingQ ? "등록 중..." : "질문 올리기"}
                </button>
              </div>
            </div>
          )}

          <div className="pl-sidebar-footer">
            국민연금기후행동 1주년 기념 토크 콘서트
          </div>
        </aside>

        <main className="pl-bulletin">
          {isAdmin && (
            <div className="pl-admin-bar">
              <span>관리자 모드</span>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button className="pl-admin-btn csv" onClick={() => exportCSV(letters, `letters-${new Date().toISOString().slice(0,10)}.csv`)}>편지 CSV ({letters.length})</button>
                <button className="pl-admin-btn csv" onClick={() => exportCSV(questions, `questions-${new Date().toISOString().slice(0,10)}.csv`)}>질문 CSV ({questions.length})</button>
                <button className="pl-admin-btn exit" onClick={() => { setIsAdmin(false); showToast("관리자 모드 종료"); }}>종료</button>
              </div>
            </div>
          )}

          <div className="pl-bulletin-header">
            <span className="pl-label">{displayed.length}개</span>
            <div className="pl-filter-group">
              {[
                { key: "all", label: "전체" },
                { key: "letter", label: "편지" },
                { key: "question", label: "질문" },
                { key: "today", label: "오늘" },
              ].map(f => (
                <button key={f.key}
                  className={`pl-pill ${
                    filter === f.key
                      ? f.key === "letter" ? "active-letter-pill"
                      : f.key === "question" ? "active-question-pill"
                      : "active"
                      : ""
                  }`}
                  onClick={() => setFilter(f.key)}>{f.label}
                </button>
              ))}
              <button
                className={`pl-pill ${isAdmin ? "admin-active" : ""}`}
                onClick={() => isAdmin ? setIsAdmin(false) : setShowAdminModal(true)}>
                {isAdmin ? "Admin ON" : "Admin"}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="pl-loading">불러오는 중...</div>
          ) : displayed.length === 0 ? (
            <div className="pl-empty">아직 없습니다.</div>
          ) : (
            displayed.map((item, i) => (
              <article
                key={item.id}
                className={`pl-letter-card ${item._type === "letter" ? "pin-letter" : "pin-question"} ${item.id === newId ? "new-card" : ""}`}
                style={{ transform: `rotate(${ROTATIONS[i % ROTATIONS.length]}deg)` }}
              >
                {isAdmin && (
                  <button className="pl-delete-btn"
                    onClick={() => handleDelete(item.id, item._type === "letter" ? "letters" : "questions")}>
                    삭제
                  </button>
                )}
                <div className="pl-letter-meta">
                  <span className="pl-label">{formatDate(item.created_at)}</span>
                  <span className={`pl-letter-type ${item._type}`}>
                    {item._type === "letter" ? "편지" : "질문"}
                  </span>
                </div>
                <p className="pl-letter-text">{item.text}</p>
                <div className="pl-letter-sig">— {item.from_name}</div>
              </article>
            ))
          )}
        </main>

        {toast && <div className="pl-toast">{toast}</div>}

        {showAdminModal && (
          <div className="pl-modal-overlay" onClick={() => { setShowAdminModal(false); setPwInput(""); setPwError(false); }}>
            <div className="pl-modal" onClick={e => e.stopPropagation()}>
              <div className="pl-modal-title">Admin Login</div>
              <input type="password" className="pl-modal-input" placeholder="비밀번호 입력"
                value={pwInput}
                onChange={e => { setPwInput(e.target.value); setPwError(false); }}
                onKeyDown={e => e.key === "Enter" && handleAdminLogin()}
                autoFocus />
              {pwError && <div className="pl-modal-error">비밀번호가 틀렸습니다</div>}
              <div className="pl-modal-btns">
                <button className="pl-pill" onClick={() => { setShowAdminModal(false); setPwInput(""); setPwError(false); }}>취소</button>
                <button className="pl-pill active" onClick={handleAdminLogin}>확인</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
