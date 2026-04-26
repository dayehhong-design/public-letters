import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";

const TAG_COLORS = {
  "세대 공감": "#e8d5c4", "정책 제안": "#c4d5e8", "기타": "#d5c4e8",
  "응원": "#c4e8d5", "우려": "#e8c4c4", "제안": "#e8e4c4",
};

const ADMIN_PASSWORD = "NPSCA2026!";

function formatDate(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")}`;
}

const ROTATIONS = [-1.5, 2, -2.5, 1.2, -0.8, 1.8, -1.2, 2.3, -0.5, 1.5];

const styles = `
  @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg-green: #BDD3A8;
    --bg-cream: #FFFEF0;
    --brand-dark: #2E2D2B;
    --airmail-red: #E63946;
    --airmail-blue: #1D3557;
    --line: 2px solid #2E2D2B;
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
    width: 360px; flex-shrink: 0;
    border-right: var(--line); padding: 2rem 1.5rem;
    display: flex; flex-direction: column;
    justify-content: center; align-items: center;
    position: sticky; top: 0; height: 100vh;
    background: rgba(189,211,168,0.3);
  }

  .pl-composer-card {
    width: 100%;
    background: var(--bg-cream);
    border: 10px solid transparent;
    border-image: repeating-linear-gradient(
      -45deg,
      var(--airmail-red), var(--airmail-red) 15px,
      var(--bg-cream) 15px, var(--bg-cream) 30px,
      var(--airmail-blue) 30px, var(--airmail-blue) 45px,
      var(--bg-cream) 45px, var(--bg-cream) 60px
    ) 10;
    padding: 1.5rem 1.75rem;
    box-shadow: 0 15px 40px rgba(0,0,0,0.2);
    display: flex; flex-direction: column; gap: 1rem;
  }

  .pl-card-top {
    display: flex; justify-content: space-between; align-items: flex-end;
    border-bottom: var(--line); padding-bottom: 0.75rem;
  }

  .pl-card-top h2 {
    font-family: 'Pretendard', sans-serif;
    font-size: 2.2rem; font-weight: 900;
    line-height: 1; letter-spacing: -0.02em;
  }

  .pl-postmark {
    width: 55px; height: 55px;
    border: 2px solid var(--brand-dark); border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    opacity: 0.6; text-align: center;
    font-size: 0.35rem; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase; line-height: 1.4;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  .pl-textarea-wrap { position: relative; }

  .pl-cursor {
    position: absolute;
    top: 0; left: 0;
    font-size: 1.1rem; line-height: 1.7;
    color: var(--airmail-red);
    font-weight: 300;
    animation: blink 1s step-end infinite;
    pointer-events: none;
    user-select: none;
  }

  .pl-textarea {
    width: 100%; height: 220px;
    background: transparent; border: none; resize: none;
    font-family: 'Pretendard', sans-serif;
    font-size: 1rem; line-height: 1.7;
    color: var(--brand-dark);
    caret-color: var(--airmail-red);
    position: relative; z-index: 1;
  }
  .pl-textarea:focus { outline: none; }
  .pl-textarea::placeholder { color: var(--brand-dark); opacity: 0.38; }

  .pl-char-count {
    font-size: 0.7rem; opacity: 0.35; font-weight: 600; text-align: right;
  }

  .pl-card-bottom {
    display: flex; flex-direction: column; gap: 0.75rem;
    border-top: 1px solid rgba(46,45,43,0.15); padding-top: 0.75rem;
  }

  .pl-input-line {
    background: transparent; border: none; border-bottom: var(--line);
    padding: 0.25rem 0; font-family: 'Pretendard', sans-serif;
    font-size: 0.9rem; font-weight: 600; color: var(--brand-dark); width: 100%;
  }
  .pl-input-line:focus { outline: none; }
  .pl-input-line::placeholder { color: var(--brand-dark); opacity: 0.38; font-weight: 400; }

  .pl-send-btn {
    background: var(--brand-dark); color: var(--bg-cream);
    border: var(--line); padding: 0.75rem;
    font-family: 'Pretendard', sans-serif; font-size: 0.85rem;
    font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
    cursor: pointer; width: 100%; transition: all 0.1s;
  }
  .pl-send-btn:hover { background: transparent; color: var(--brand-dark); }
  .pl-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .pl-label {
    font-size: 0.72rem; text-transform: uppercase;
    letter-spacing: 0.1em; font-weight: 700; display: block;
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
  .pl-pill.admin-active { background: #c0392b; color: white; border-color: #c0392b; }

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
    width: 18px; height: 18px;
    background: var(--airmail-red); border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(0,0,0,0.2);
    z-index: 2;
  }
  .pl-letter-card.new-card { animation: popIn 0.4s ease; }
  @keyframes popIn {
    from { opacity: 0; transform: scale(0.8); }
    to   { opacity: 1; }
  }

  .pl-letter-meta { display: flex; justify-content: space-between; align-items: center; }
  .pl-letter-text { font-size: 0.95rem; line-height: 1.7; white-space: pre-wrap; }
  .pl-letter-sig { font-size: 0.85rem; font-weight: 700; text-align: right; }

  .pl-delete-btn {
    position: absolute; top: 0.75rem; right: 0.75rem;
    background: transparent; border: 1.5px solid #c0392b; color: #c0392b;
    font-size: 0.65rem; font-weight: 700; padding: 0.2rem 0.5rem;
    cursor: pointer; text-transform: uppercase; transition: all 0.1s;
    font-family: 'Pretendard', sans-serif;
  }
  .pl-delete-btn:hover { background: #c0392b; color: white; }

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
  .pl-modal-error { font-size: 0.8rem; color: #c0392b; font-weight: 700; }

  .pl-empty { color: var(--brand-dark); opacity: 0.5; font-size: 0.95rem; text-align: center; padding: 4rem 0; width: 100%; }
  .pl-loading { color: var(--brand-dark); opacity: 0.5; font-size: 0.95rem; text-align: center; padding: 4rem 0; width: 100%; }

  @media (max-width: 767px) {
    .pl-layout { flex-direction: column; }
    .pl-sidebar { width: 100%; height: auto; position: static; border-right: none; border-bottom: var(--line); padding: 1.5rem 1rem; }
    .pl-bulletin { padding: 2rem 1rem; gap: 2rem; }
    .pl-letter-card { width: 280px; }
  }
`;

export default function App() {
  const [letters, setLetters] = useState([]);
  const [text, setText] = useState("");
  const [from, setFrom] = useState("");
  const [filter, setFilter] = useState("all");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [newId, setNewId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);
  const [focused, setFocused] = useState(false);
  const toastTimer = useRef(null);

  useEffect(() => { fetchLetters(); }, []);

  async function fetchLetters() {
    setLoading(true);
    const { data, error } = await supabase
      .from("letters").select("*").order("created_at", { ascending: false });
    if (!error) setLetters(data || []);
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

  async function handleSend() {
    if (!text.trim()) { showToast("편지 내용을 입력해주세요"); return; }
    setSending(true);
    const { data, error } = await supabase
      .from("letters")
      .insert([{ text: text.trim(), from_name: from.trim() || "익명의 편지", tag: "기타" }])
      .select().single();
    if (error) {
      showToast("오류가 발생했습니다. 다시 시도해주세요.");
    } else {
      setLetters(prev => [data, ...prev]);
      setNewId(data.id);
      setTimeout(() => setNewId(null), 1000);
      setText(""); setFrom(""); setFilter("all");
      showToast("편지가 전송되었습니다");
    }
    setSending(false);
  }

  async function handleDelete(id) {
    if (!window.confirm("이 편지를 삭제할까요?")) return;
    const { error } = await supabase.from("letters").delete().eq("id", id);
    if (!error) {
      setLetters(prev => prev.filter(l => l.id !== id));
      showToast("편지가 삭제되었습니다");
    }
  }

  function handleAdminLogin() {
    if (pwInput === ADMIN_PASSWORD) {
      setIsAdmin(true); setShowAdminModal(false); setPwInput(""); setPwError(false);
      showToast("관리자 모드 활성화");
    } else {
      setPwError(true);
    }
  }

  function exportCSV() {
    const headers = ["날짜", "이름", "내용"];
    const rows = letters.map(l => [
      formatDate(l.created_at),
      `"${(l.from_name || "").replace(/"/g, '""')}"`,
      `"${(l.text || "").replace(/"/g, '""')}"`,
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `public-letters-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`${letters.length}개 편지 다운로드 완료`);
  }

  const filtered = letters.filter(l => {
    if (filter === "recent") {
      return new Date(l.created_at).toDateString() === new Date().toDateString();
    }
    return true;
  });

  return (
    <>
      <style>{styles}</style>
      <div className="pl-layout">

        <aside className="pl-sidebar">
          <div className="pl-composer-card">
            <div className="pl-card-top">
              <div>
                <span className="pl-label">To</span>
                <h2>국민연금</h2>
              </div>
              <div className="pl-postmark">KOREA<br />POST</div>
            </div>

            {/* 커서 깜빡임 */}
            <div className="pl-textarea-wrap">
              {!text && !focused && (
                <span className="pl-cursor">|</span>
              )}
              <textarea
                className="pl-textarea"
                placeholder={focused ? "당신의 이야기를 적어주세요. 국민연금에 대한 생각, 우려, 혹은 제안. 당신의 목소리가 전달됩니다." : ""}
                value={text}
                onChange={e => setText(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                spellCheck={false}
              />
            </div>
            <div className="pl-char-count">{text.length} 자</div>

            <div className="pl-card-bottom">
              <input
                type="text"
                className="pl-input-line"
                placeholder="이름 또는 익명"
                value={from}
                onChange={e => setFrom(e.target.value)}
              />
              <button className="pl-send-btn" onClick={handleSend} disabled={sending}>
                {sending ? "전송 중..." : "편지 보내기"}
              </button>
            </div>
          </div>
        </aside>

        <main className="pl-bulletin">
          {isAdmin && (
            <div className="pl-admin-bar">
              <span>관리자 모드</span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button className="pl-admin-btn csv" onClick={exportCSV}>CSV ({letters.length}개)</button>
                <button className="pl-admin-btn exit" onClick={() => { setIsAdmin(false); showToast("관리자 모드 종료"); }}>종료</button>
              </div>
            </div>
          )}

          <div className="pl-bulletin-header">
            <span className="pl-label">{filtered.length}편의 편지</span>
            <div className="pl-filter-group">
              {[{ key: "all", label: "전체" }, { key: "recent", label: "오늘" }].map(f => (
                <button key={f.key}
                  className={`pl-pill ${filter === f.key ? "active" : ""}`}
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
          ) : filtered.length === 0 ? (
            <div className="pl-empty">아직 편지가 없습니다.</div>
          ) : (
            filtered.map((letter, i) => (
              <article
                key={letter.id}
                className={`pl-letter-card ${letter.id === newId ? "new-card" : ""}`}
                style={{ transform: `rotate(${ROTATIONS[i % ROTATIONS.length]}deg)` }}
              >
                {isAdmin && (
                  <button className="pl-delete-btn" onClick={() => handleDelete(letter.id)}>삭제</button>
                )}
                <div className="pl-letter-meta">
                  <span className="pl-label">{formatDate(letter.created_at)}</span>
                </div>
                <p className="pl-letter-text">{letter.text}</p>
                <div className="pl-letter-sig">— {letter.from_name}</div>
              </article>
            ))
          )}
        </main>

        {toast && <div className="pl-toast">{toast}</div>}

        {showAdminModal && (
          <div className="pl-modal-overlay" onClick={() => { setShowAdminModal(false); setPwInput(""); setPwError(false); }}>
            <div className="pl-modal" onClick={e => e.stopPropagation()}>
              <div className="pl-modal-title">Admin Login</div>
              <input
                type="password" className="pl-modal-input" placeholder="비밀번호 입력"
                value={pwInput}
                onChange={e => { setPwInput(e.target.value); setPwError(false); }}
                onKeyDown={e => e.key === "Enter" && handleAdminLogin()}
                autoFocus
              />
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
