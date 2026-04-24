import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";

const TAGS = ["세대 공감", "정책 제안", "기타", "응원", "우려", "제안"];
const TAG_COLORS = {
  "세대 공감": "#e8d5c4", "정책 제안": "#c4d5e8", "기타": "#d5c4e8",
  "응원": "#c4e8d5", "우려": "#e8c4c4", "제안": "#e8e4c4",
};

const ADMIN_PASSWORD = "NPSCA2026!";

function formatDate(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")}`;
}

const styles = `
  @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

@font-face {
  font-family: 'HSZandari';
  src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_2108@1.1/HSZandariM.woff') format('woff');
  font-weight: normal;
}
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .pl-root {
    --bg-cream: #F3EFE7; --bg-green: #BDD3A8; --brand-dark: #2E2D2B;
    --line: 2px solid #2E2D2B;
    font-family: 'Pretendard', -apple-system, sans-serif;
    background: var(--bg-cream); color: var(--brand-dark);
    -webkit-font-smoothing: antialiased;
    min-height: 100vh;
  }

  /* 데스크탑: 좌우 2컬럼 */
  @media (min-width: 768px) {
    body { overflow: hidden; }
    .pl-root { display: flex; height: 100vh; overflow: hidden; }
    .pl-left {
      flex: 1; border-right: var(--line); padding: 2rem 2.5rem;
      display: flex; flex-direction: column; height: 100vh; overflow: hidden;
    }
    .pl-right {
      flex: 1; overflow-y: auto; background: var(--bg-green);
      display: flex; flex-direction: column;
    }
    .pl-logo { font-size: 3.2rem; line-height: 0.85; }
    .pl-recipient-title { font-size: 4rem; }
    .pl-composer { flex: 1; display: flex; flex-direction: column; margin-top: 0.5rem; }
    .pl-textarea { min-height: 140px; flex: 1; }
    .pl-footer { flex-direction: row; align-items: flex-start; }
    .pl-card { grid-template-columns: 1fr 2.5fr; }
  }

  /* 모바일: 위아래 1컬럼 */
  @media (max-width: 767px) {
    body { overflow-x: hidden; }
    .pl-root { display: flex; flex-direction: column; }
    .pl-left {
      padding: 1.5rem 1.25rem 1.25rem;
      border-bottom: var(--line);
      display: flex; flex-direction: column;
    }
    .pl-right {
      background: var(--bg-green);
      display: flex; flex-direction: column;
    }
    .pl-logo { font-size: 2.2rem; line-height: 0.85; }
    .pl-recipient-title { font-size: 3rem; }
    .pl-composer { display: flex; flex-direction: column; margin-top: 0.5rem; }
    .pl-textarea { min-height: 120px; }
    .pl-footer { flex-direction: column; gap: 1rem; }
    .pl-footer-row { display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap; }
    .pl-send-btn-wrap { display: flex; justify-content: flex-end; }
    .pl-card { grid-template-columns: 1fr; gap: 1rem; padding: 1.5rem 1.25rem; }
    .pl-gallery-header { padding: 1.25rem; }
    .pl-admin-bar { padding: 0.75rem 1.25rem; flex-wrap: wrap; gap: 0.5rem; }
    .pl-delete-btn { top: 1rem; right: 1rem; }
    .pl-filter-group { flex-wrap: wrap; }
  }

  .pl-logo {
    font-family: 'HSZandari', sans-serif;
    letter-spacing: 0.02em; text-transform: uppercase;
  }
  .pl-header {
    display: flex; justify-content: space-between; align-items: center;
    padding-bottom: 1.25rem;
  }
  .pl-label {
    font-size: 0.7rem; text-transform: uppercase;
    letter-spacing: 0.12em; font-weight: 700;
  }
  .pl-recipient-section { border-bottom: var(--line); padding-bottom: 1rem; margin-bottom: 1.25rem; }
  .pl-recipient-title {
    font-family: 'HSZandari', sans-serif;
    line-height: 0.9; letter-spacing: 0.02em; margin-top: 0.4rem;
  }
  .pl-textarea {
    width: 100%; background: transparent; border: none; resize: none;
    color: var(--brand-dark); font-family: 'Noto Sans KR', sans-serif;
    font-size: 1rem; line-height: 1.65; padding: 0;
  }
  .pl-textarea:focus { outline: none; }
  .pl-textarea::placeholder { color: var(--brand-dark); opacity: 0.38; }
  .pl-footer {
    border-top: var(--line); padding-top: 1.25rem; margin-top: 1rem;
    display: flex; justify-content: space-between; gap: 0.75rem;
  }
  .pl-footer-left { display: flex; flex-direction: column; gap: 0.75rem; }
  .pl-input-line {
    background: transparent; border: none; border-bottom: var(--line);
    color: var(--brand-dark); font-family: 'Noto Sans KR', sans-serif;
    font-size: 0.95rem; font-weight: 600; padding: 0.3rem 0; width: 130px;
  }
  .pl-input-line:focus { outline: none; border-bottom-width: 4px; }
  .pl-input-line::placeholder { color: var(--brand-dark); opacity: 0.38; font-weight: 400; }
  .pl-tag-select {
    background: transparent; border: none; border-bottom: var(--line);
    color: var(--brand-dark); font-family: 'Noto Sans KR', sans-serif;
    font-size: 0.85rem; font-weight: 600; padding: 0.3rem 0; width: 130px;
    cursor: pointer; appearance: none; -webkit-appearance: none;
  }
  .pl-tag-select:focus { outline: none; }
  .pl-pill {
    display: inline-flex; align-items: center; justify-content: center;
    border: var(--line); padding: 0.45rem 1.1rem;
    font-family: 'Noto Sans KR', sans-serif; font-size: 0.8rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.05em;
    background: transparent; color: var(--brand-dark); cursor: pointer;
    transition: background-color 0.1s, color 0.1s; border-radius: 0; white-space: nowrap;
  }
  .pl-pill:hover { background-color: var(--brand-dark); color: var(--bg-cream); }
  .pl-pill.solid { background-color: var(--brand-dark); color: var(--bg-cream); }
  .pl-pill.solid:hover { background-color: transparent; color: var(--brand-dark); }
  .pl-pill.right-active { background-color: var(--brand-dark); color: var(--bg-green); }
  .pl-pill.admin-active { background-color: #c0392b; color: white; border-color: #c0392b; }
  .pl-pill:disabled { opacity: 0.4; cursor: not-allowed; }
  .pl-gallery-header {
    position: sticky; top: 0; background: var(--bg-green);
    padding: 1.5rem 2.5rem; border-bottom: var(--line);
    display: flex; justify-content: space-between; align-items: center; z-index: 10;
  }
  .pl-filter-group { display: flex; gap: 0.4rem; }
  .pl-admin-bar {
    background: #2E2D2B; color: #F3EFE7;
    padding: 0.75rem 2.5rem; display: flex; align-items: center;
    justify-content: space-between; font-size: 0.72rem; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase; gap: 0.5rem;
  }
  .pl-admin-btn {
    background: transparent; border: 1.5px solid rgba(243,239,231,0.5);
    color: #F3EFE7; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.06em;
    padding: 0.3rem 0.7rem; cursor: pointer; text-transform: uppercase;
    transition: all 0.1s; font-family: 'Noto Sans KR', sans-serif; white-space: nowrap;
  }
  .pl-admin-btn:hover { background: rgba(243,239,231,0.15); }
  .pl-admin-btn.csv { border-color: #BDD3A8; color: #BDD3A8; }
  .pl-admin-btn.exit { border-color: #e8a0a0; color: #e8a0a0; }
  .pl-card {
    padding: 2.5rem; border-bottom: var(--line);
    display: grid; gap: 1.5rem;
    transition: background-color 0.15s; position: relative;
  }
  .pl-card:hover { background: rgba(46,45,43,0.04); }
  .pl-card.new-card { animation: fadeSlide 0.4s ease; }
  @keyframes fadeSlide { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
  .pl-card-meta { display: flex; flex-direction: row; gap: 1rem; align-items: center; flex-wrap: wrap; }
  .pl-tag-badge {
    display: inline-block; border: var(--line); padding: 0.3rem 0.8rem;
    font-size: 0.75rem; font-weight: 700; letter-spacing: 0.04em;
  }
  .pl-card-content { display: flex; flex-direction: column; gap: 1rem; }
  .pl-letter-text { font-size: 1rem; line-height: 1.7; white-space: pre-wrap; }
  .pl-signature { font-size: 0.9rem; font-weight: 700; text-align: right; text-transform: uppercase; letter-spacing: 0.04em; }
  .pl-count { font-size: 0.7rem; letter-spacing: 0.08em; font-weight: 700; opacity: 0.5; }
  .pl-empty { padding: 4rem 2.5rem; text-align: center; opacity: 0.4; font-size: 0.9rem; line-height: 1.7; }
  .pl-loading { padding: 4rem 2.5rem; text-align: center; opacity: 0.4; font-size: 0.9rem; }
  .pl-delete-btn {
    position: absolute; top: 1.25rem; right: 1.25rem;
    background: transparent; border: 1.5px solid #c0392b; color: #c0392b;
    font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em;
    padding: 0.25rem 0.6rem; cursor: pointer; text-transform: uppercase;
    transition: all 0.1s; font-family: 'Noto Sans KR', sans-serif;
  }
  .pl-delete-btn:hover { background: #c0392b; color: white; }
  .pl-toast {
    position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%);
    background: var(--brand-dark); color: var(--bg-cream);
    padding: 0.6rem 1.4rem; font-size: 0.85rem; font-weight: 600;
    letter-spacing: 0.04em; pointer-events: none; white-space: nowrap; z-index: 300;
    animation: toastIn 0.3s ease, toastOut 0.3s ease 1.7s forwards;
  }
  @keyframes toastIn  { from { opacity: 0; bottom: 1rem; } to { opacity: 1; bottom: 2rem; } }
  @keyframes toastOut { from { opacity: 1; } to { opacity: 0; } }
  .pl-char-count {
    font-size: 0.7rem; opacity: 0.35; font-weight: 600;
    letter-spacing: 0.06em; text-align: right; margin-bottom: 0.25rem;
  }
  .pl-modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200;
    display: flex; align-items: center; justify-content: center; padding: 1rem;
  }
  .pl-modal {
    background: var(--bg-cream); border: 2px solid var(--brand-dark);
    padding: 2rem; width: 100%; max-width: 320px;
    display: flex; flex-direction: column; gap: 1.25rem;
  }
  .pl-modal-title { font-family: 'Bebas Neue', sans-serif; font-size: 2rem; }
  .pl-modal-input {
    background: transparent; border: none; border-bottom: 2px solid var(--brand-dark);
    color: var(--brand-dark); font-size: 1rem; padding: 0.4rem 0; width: 100%;
    font-family: 'Noto Sans KR', sans-serif;
  }
  .pl-modal-input:focus { outline: none; }
  .pl-modal-btns { display: flex; gap: 0.5rem; justify-content: flex-end; }
  .pl-modal-error { font-size: 0.8rem; color: #c0392b; font-weight: 700; }
  .pl-right::-webkit-scrollbar { width: 6px; }
  .pl-right::-webkit-scrollbar-track { background: var(--bg-green); }
  .pl-right::-webkit-scrollbar-thumb { background: var(--brand-dark); }

  /* 데스크탑에서 card-meta 세로로 */
  @media (min-width: 768px) {
    .pl-card-meta { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
  }
`;

export default function App() {
  const [letters, setLetters] = useState([]);
  const [text, setText] = useState("");
  const [from, setFrom] = useState("");
  const [tag, setTag] = useState("기타");
  const [filter, setFilter] = useState("all");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [newId, setNewId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);
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
      .insert([{ text: text.trim(), from_name: from.trim() || "익명의 편지", tag }])
      .select().single();
    if (error) {
      showToast("오류가 발생했습니다. 다시 시도해주세요.");
    } else {
      setLetters(prev => [data, ...prev]);
      setNewId(data.id);
      setTimeout(() => setNewId(null), 1000);
      setText(""); setFrom(""); setTag("기타"); setFilter("all");
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
    const headers = ["날짜", "이름", "태그", "내용"];
    const rows = letters.map(l => [
      formatDate(l.created_at),
      `"${(l.from_name || "").replace(/"/g, '""')}"`,
      l.tag,
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
      <div className="pl-root">

        {/* 왼쪽 / 상단 — 편지 작성 */}
        <main className="pl-left">
          <header className="pl-header">
            <div className="pl-logo">국민연금에게<br />보내는 편지</div>
            <span className="pl-label">Write</span>
          </header>
          <section className="pl-composer">
            <div className="pl-recipient-section">
              <span className="pl-label">To</span>
              <h1 className="pl-recipient-title">국민연금</h1>
            </div>
            <textarea
              className="pl-textarea"
              placeholder="당신의 이야기를 적어주세요. 연금에 대한 생각, 우려, 혹은 제안. 당신의 목소리가 기록됩니다..."
              value={text} onChange={e => setText(e.target.value)} spellCheck={false}
            />
            <div className="pl-char-count">{text.length} 자</div>
            <div className="pl-footer">
              <div className="pl-footer-left">
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span className="pl-label">From</span>
                  <input type="text" className="pl-input-line" placeholder="이름 또는 익명"
                    value={from} onChange={e => setFrom(e.target.value)} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span className="pl-label">Tag</span>
                  <select className="pl-tag-select" value={tag} onChange={e => setTag(e.target.value)}>
                    {TAGS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <button className="pl-pill solid" onClick={handleSend} disabled={sending}>
                  {sending ? "전송 중..." : "Send letter"}
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* 오른쪽 / 하단 — 편지 목록 */}
        <aside className="pl-right">
          {isAdmin && (
            <div className="pl-admin-bar">
              <span>관리자 모드</span>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button className="pl-admin-btn csv" onClick={exportCSV}>
                  CSV ({letters.length}개)
                </button>
                <button className="pl-admin-btn exit" onClick={() => { setIsAdmin(false); showToast("관리자 모드 종료"); }}>
                  종료
                </button>
              </div>
            </div>
          )}

          <div className="pl-gallery-header">
            <div>
              <span className="pl-label">Archive</span>
              <div className="pl-count" style={{ marginTop: "0.25rem" }}>{filtered.length}편의 편지</div>
            </div>
            <div className="pl-filter-group">
              {[{ key: "all", label: "All" }, { key: "recent", label: "Today" }].map(f => (
                <button key={f.key}
                  className={`pl-pill ${filter === f.key ? "right-active" : ""}`}
                  onClick={() => setFilter(f.key)}>{f.label}
                </button>
              ))}
              <button
                className={`pl-pill ${isAdmin ? "admin-active" : ""}`}
                style={{ fontSize: "0.72rem", padding: "0.45rem 0.8rem" }}
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
            filtered.map(letter => (
              <article key={letter.id} className={`pl-card ${letter.id === newId ? "new-card" : ""}`}>
                {isAdmin && (
                  <button className="pl-delete-btn" onClick={() => handleDelete(letter.id)}>삭제</button>
                )}
                <div className="pl-card-meta">
                  <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{formatDate(letter.created_at)}</div>
                  <span className="pl-tag-badge" style={{ background: TAG_COLORS[letter.tag] || "#e8e4c4" }}>
                    {letter.tag}
                  </span>
                </div>
                <div className="pl-card-content">
                  <p className="pl-letter-text">{letter.text}</p>
                  <div className="pl-signature">— {letter.from_name}</div>
                </div>
              </article>
            ))
          )}
        </aside>

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
                <button className="pl-pill solid" onClick={handleAdminLogin}>확인</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
