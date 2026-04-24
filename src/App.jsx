import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";

const TAGS = ["세대 공감", "정책 제안", "기타", "응원", "우려", "제안"];

const TAG_COLORS = {
  "세대 공감": "#e8d5c4",
  "정책 제안": "#c4d5e8",
  "기타": "#d5c4e8",
  "응원": "#c4e8d5",
  "우려": "#e8c4c4",
  "제안": "#e8e4c4",
};

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")}`;
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Noto+Sans+KR:wght@400;700;900&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    overflow: hidden;
  }

  .pl-root {
    --bg-cream: #F3EFE7;
    --bg-green: #BDD3A8;
    --brand-dark: #2E2D2B;
    --line: 2px solid #2E2D2B;
    font-family: 'Noto Sans KR', -apple-system, sans-serif;
    display: flex;
    height: 100vh;
    overflow: hidden;
    background: var(--bg-cream);
    color: var(--brand-dark);
    -webkit-font-smoothing: antialiased;
  }

  .pl-left {
    flex: 1;
    border-right: var(--line);
    padding: 2rem 2.5rem;
    display: flex;
    flex-direction: column;
    background: var(--bg-cream);
    min-width: 0;
  }

  .pl-right {
    flex: 1;
    overflow-y: auto;
    background: var(--bg-green);
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .pl-logo {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 3.2rem;
    letter-spacing: 0.02em;
    line-height: 0.85;
    text-transform: uppercase;
  }

  .pl-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 1.5rem;
  }

  .pl-label {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-weight: 700;
  }

  .pl-recipient-section {
    border-bottom: var(--line);
    padding-bottom: 1rem;
    margin-bottom: 1.5rem;
  }

  .pl-recipient-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 4.5rem;
    line-height: 0.9;
    letter-spacing: 0.02em;
    margin-top: 0.4rem;
  }

  .pl-textarea {
    width: 100%;
    flex: 1;
    background: transparent;
    border: none;
    resize: none;
    color: var(--brand-dark);
    font-family: 'Noto Sans KR', sans-serif;
    font-size: 1.05rem;
    line-height: 1.65;
    padding: 0;
    min-height: 140px;
  }
  .pl-textarea:focus { outline: none; }
  .pl-textarea::placeholder { color: var(--brand-dark); opacity: 0.38; }

  .pl-composer {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin-top: 0.5rem;
  }

  .pl-footer {
    border-top: var(--line);
    padding-top: 1.25rem;
    margin-top: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }

  .pl-footer-left {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .pl-input-line {
    background: transparent;
    border: none;
    border-bottom: var(--line);
    color: var(--brand-dark);
    font-family: 'Noto Sans KR', sans-serif;
    font-size: 0.95rem;
    font-weight: 600;
    padding: 0.3rem 0;
    width: 130px;
  }
  .pl-input-line:focus { outline: none; border-bottom-width: 4px; }
  .pl-input-line::placeholder { color: var(--brand-dark); opacity: 0.38; font-weight: 400; }

  .pl-tag-select {
    background: transparent;
    border: none;
    border-bottom: var(--line);
    color: var(--brand-dark);
    font-family: 'Noto Sans KR', sans-serif;
    font-size: 0.85rem;
    font-weight: 600;
    padding: 0.3rem 0;
    width: 130px;
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
  }
  .pl-tag-select:focus { outline: none; }

  .pl-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: var(--line);
    padding: 0.45rem 1.1rem;
    font-family: 'Noto Sans KR', sans-serif;
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: transparent;
    color: var(--brand-dark);
    cursor: pointer;
    transition: background-color 0.1s, color 0.1s;
    border-radius: 0;
    white-space: nowrap;
  }
  .pl-pill:hover { background-color: var(--brand-dark); color: var(--bg-cream); }
  .pl-pill.solid { background-color: var(--brand-dark); color: var(--bg-cream); }
  .pl-pill.solid:hover { background-color: transparent; color: var(--brand-dark); }
  .pl-pill.right-active { background-color: var(--brand-dark); color: var(--bg-green); }
  .pl-pill:disabled { opacity: 0.4; cursor: not-allowed; background: transparent; color: var(--brand-dark); }

  .pl-gallery-header {
    position: sticky;
    top: 0;
    background: var(--bg-green);
    padding: 1.5rem 2.5rem;
    border-bottom: var(--line);
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 10;
  }

  .pl-filter-group { display: flex; gap: 0.4rem; }

  .pl-card {
    padding: 2.5rem;
    border-bottom: var(--line);
    display: grid;
    grid-template-columns: 1fr 2.5fr;
    gap: 1.5rem;
    transition: background-color 0.15s;
  }
  .pl-card:hover { background: rgba(46,45,43,0.04); }
  .pl-card.new-card { animation: fadeSlide 0.4s ease; }
  @keyframes fadeSlide {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .pl-card-meta {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }

  .pl-tag-badge {
    display: inline-block;
    border: var(--line);
    padding: 0.3rem 0.8rem;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.04em;
  }

  .pl-card-content {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .pl-letter-text {
    font-size: 1.05rem;
    line-height: 1.65;
    white-space: pre-wrap;
  }

  .pl-signature {
    font-size: 0.9rem;
    font-weight: 700;
    text-align: right;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .pl-count {
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    font-weight: 700;
    opacity: 0.5;
  }

  .pl-empty {
    padding: 4rem 2.5rem;
    text-align: center;
    opacity: 0.4;
    font-size: 0.9rem;
    line-height: 1.7;
  }

  .pl-loading {
    padding: 4rem 2.5rem;
    text-align: center;
    opacity: 0.4;
    font-size: 0.9rem;
  }

  .pl-toast {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    background: var(--brand-dark);
    color: var(--bg-cream);
    padding: 0.6rem 1.4rem;
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    animation: toastIn 0.3s ease, toastOut 0.3s ease 1.7s forwards;
    pointer-events: none;
    white-space: nowrap;
    z-index: 100;
  }
  @keyframes toastIn  { from { opacity: 0; bottom: 1rem; } to { opacity: 1; bottom: 2rem; } }
  @keyframes toastOut { from { opacity: 1; } to { opacity: 0; } }

  .pl-char-count {
    font-size: 0.7rem;
    opacity: 0.35;
    font-weight: 600;
    letter-spacing: 0.06em;
    align-self: flex-end;
    margin-bottom: 0.25rem;
  }

  .pl-right::-webkit-scrollbar { width: 6px; }
  .pl-right::-webkit-scrollbar-track { background: var(--bg-green); }
  .pl-right::-webkit-scrollbar-thumb { background: var(--brand-dark); }
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
  const toastTimer = useRef(null);

  useEffect(() => {
    fetchLetters();
  }, []);

  async function fetchLetters() {
    setLoading(true);
    const { data, error } = await supabase
      .from("letters")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setLetters(data || []);
    setLoading(false);
  }

  function showToast(msg) {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }

  async function handleSend() {
    if (!text.trim()) { showToast("편지 내용을 입력해주세요"); return; }
    setSending(true);

    const { data, error } = await supabase
      .from("letters")
      .insert([{
        text: text.trim(),
        from_name: from.trim() || "익명의 편지",
        tag,
      }])
      .select()
      .single();

    if (error) {
      showToast("오류가 발생했습니다. 다시 시도해주세요.");
    } else {
      setLetters(prev => [data, ...prev]);
      setNewId(data.id);
      setTimeout(() => setNewId(null), 1000);
      setText("");
      setFrom("");
      setTag("기타");
      setFilter("all");
      showToast("편지가 전송되었습니다");
    }
    setSending(false);
  }

  const filtered = letters.filter(l => {
    if (filter === "recent") {
      const d = new Date(l.created_at);
      const today = new Date();
      return d.toDateString() === today.toDateString();
    }
    return true;
  });

  function formatDate(iso) {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")}`;
  }

  return (
    <>
      <style>{styles}</style>
      <div className="pl-root">

        {/* 왼쪽 — 편지 작성 */}
        <main className="pl-left">
          <header className="pl-header">
            <div className="pl-logo">Public<br />Letters</div>
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
              value={text}
              onChange={e => setText(e.target.value)}
              spellCheck={false}
            />

            <div className="pl-char-count">{text.length} 자</div>

            <div className="pl-footer">
              <div className="pl-footer-left">
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span className="pl-label">From</span>
                  <input
                    type="text"
                    className="pl-input-line"
                    placeholder="이름 또는 익명"
                    value={from}
                    onChange={e => setFrom(e.target.value)}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span className="pl-label">Tag</span>
                  <select
                    className="pl-tag-select"
                    value={tag}
                    onChange={e => setTag(e.target.value)}
                  >
                    {TAGS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <button
                className="pl-pill solid"
                onClick={handleSend}
                disabled={sending}
              >
                {sending ? "전송 중..." : "Send letter"}
              </button>
            </div>
          </section>
        </main>

        {/* 오른쪽 — 편지 목록 */}
        <aside className="pl-right">
          <div className="pl-gallery-header">
            <div>
              <span className="pl-label">Archive</span>
              <div className="pl-count" style={{ marginTop: "0.25rem" }}>{filtered.length}편의 편지</div>
            </div>
            <div className="pl-filter-group">
              {[
                { key: "all", label: "All" },
                { key: "recent", label: "Today" },
              ].map(f => (
                <button
                  key={f.key}
                  className={`pl-pill ${filter === f.key ? "right-active" : ""}`}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="pl-loading">불러오는 중...</div>
          ) : filtered.length === 0 ? (
            <div className="pl-empty">아직 편지가 없습니다.</div>
          ) : (
            filtered.map((letter) => (
              <article
                key={letter.id}
                className={`pl-card ${letter.id === newId ? "new-card" : ""}`}
              >
                <div className="pl-card-meta">
                  <span className="pl-label">Date</span>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                    {formatDate(letter.created_at)}
                  </div>
                  <div style={{ marginTop: "0.5rem" }}>
                    <span
                      className="pl-tag-badge"
                      style={{ background: TAG_COLORS[letter.tag] || "#e8e4c4" }}
                    >
                      {letter.tag}
                    </span>
                  </div>
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
      </div>
    </>
  );
}
