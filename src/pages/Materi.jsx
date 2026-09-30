import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

/* =========================================================
   STYLE — ditulis sebagai CSS agar bisa pakai :hover, :focus,
   dan media query (tidak bisa dengan inline style biasa)
   ========================================================= */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.rb {
  --ink: #1d2433;
  --ink-soft: #5b6477;
  --line: #e3e7ee;
  --bg: #f3f5f9;
  --card: #ffffff;
  --teal: #0f766e;
  --teal-soft: #e6f4f2;
  --amber: #b45309;
  --amber-soft: #fdf3e7;
  --red: #b42318;
  --red-soft: #fdecea;
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;
  color: var(--ink);
  background: var(--bg);
  min-height: 100vh;
  line-height: 1.55;
}
.rb *, .rb *::before, .rb *::after { box-sizing: border-box; }
.rb button, .rb select, .rb textarea, .rb input { font-family: inherit; }
.rb :focus-visible { outline: 3px solid #5eead4; outline-offset: 2px; }

/* ---------- Top bar ---------- */
.rb-top {
  background: var(--ink);
  color: #fff;
  position: sticky; top: 0; z-index: 20;
}
.rb-top-inner {
  max-width: 1280px; margin: 0 auto; padding: 14px 24px;
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
}
.rb-brand { display: flex; align-items: center; gap: 12px; }
.rb-logo {
  width: 38px; height: 38px; border-radius: 10px;
  background: var(--teal); display: grid; place-items: center; font-size: 20px;
}
.rb-brand h1 { font-size: 17px; font-weight: 700; margin: 0; letter-spacing: -0.01em; }
.rb-brand p { font-size: 12.5px; margin: 0; color: #aeb6c7; }
.rb-user { display: flex; align-items: center; gap: 12px; }
.rb-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: #2f3a52; display: grid; place-items: center;
  font-weight: 700; font-size: 14px; color: #5eead4;
}
.rb-user-name { font-size: 14px; font-weight: 600; line-height: 1.2; }
.rb-user-class { font-size: 12px; color: #aeb6c7; }
.rb-logout {
  background: transparent; color: #fff; border: 1px solid #4a5570;
  padding: 8px 14px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600;
  transition: background .15s, border-color .15s;
}
.rb-logout:hover { background: var(--red); border-color: var(--red); }

/* ---------- Layout ---------- */
.rb-main { max-width: 1280px; margin: 0 auto; padding: 28px 24px 48px; }
.rb-grid {
  display: grid; grid-template-columns: 300px minmax(0, 1fr); gap: 28px; align-items: start;
}
.rb-grid.expanded { grid-template-columns: minmax(0, 1fr); }

/* ---------- Sidebar ---------- */
.rb-side {
  background: var(--card); border: 1px solid var(--line); border-radius: 16px;
  padding: 20px; position: sticky; top: 90px;
}
.rb-field-label { display: block; font-size: 13px; font-weight: 600; color: var(--ink-soft); margin-bottom: 8px; }
.rb-select {
  width: 100%; padding: 11px 38px 11px 14px; border-radius: 10px;
  border: 1px solid var(--line); background: #f8fafc; color: var(--ink);
  font-size: 14.5px; font-weight: 600; cursor: pointer; appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1.5l5 5 5-5' stroke='%235b6477' stroke-width='1.8' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 14px center;
}
.rb-side h2 { font-size: 14px; font-weight: 700; margin: 24px 0 12px; }

/* Timeline minggu — memang berurutan, jadi pakai nomor */
.rb-weeks { list-style: none; margin: 0; padding: 0; position: relative; }
.rb-weeks::before {
  content: ''; position: absolute; left: 17px; top: 18px; bottom: 18px;
  width: 2px; background: var(--line);
}
.rb-week {
  position: relative; display: flex; gap: 14px; width: 100%; text-align: left;
  padding: 10px 10px 10px 0; background: none; border: none; border-radius: 10px;
  cursor: pointer; color: var(--ink);
}
.rb-week-num {
  flex: 0 0 36px; height: 36px; border-radius: 50%;
  background: #fff; border: 2px solid var(--line);
  display: grid; place-items: center; font-weight: 700; font-size: 14px; color: var(--ink-soft);
  position: relative; z-index: 1; transition: all .15s;
}
.rb-week-text { padding-top: 2px; min-width: 0; }
.rb-week-title { font-size: 12.5px; font-weight: 600; color: var(--ink-soft); }
.rb-week-desc { font-size: 14px; font-weight: 600; margin-top: 2px; overflow-wrap: anywhere; }
.rb-week:hover .rb-week-num { border-color: var(--teal); color: var(--teal); }
.rb-week.active .rb-week-num { background: var(--teal); border-color: var(--teal); color: #fff; }
.rb-week.active .rb-week-title { color: var(--teal); }

/* ---------- Content panel ---------- */
.rb-panel { background: var(--card); border: 1px solid var(--line); border-radius: 16px; overflow: hidden; }
.rb-panel-head {
  padding: 20px 24px; border-bottom: 1px solid var(--line);
  display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap;
}
.rb-panel-meta { font-size: 13px; font-weight: 600; color: var(--teal); margin: 0 0 4px; }
.rb-panel-title { font-size: 22px; font-weight: 800; margin: 0; letter-spacing: -0.02em; line-height: 1.25; }

.rb-tabs { display: flex; gap: 4px; padding: 4px; background: var(--bg); border-radius: 12px; }
.rb-tab {
  border: none; background: transparent; padding: 9px 16px; border-radius: 9px;
  font-size: 14px; font-weight: 600; color: var(--ink-soft); cursor: pointer;
  display: flex; align-items: center; gap: 7px; transition: all .15s;
}
.rb-tab:hover { color: var(--ink); }
.rb-tab.active { background: #fff; color: var(--ink); box-shadow: 0 1px 3px rgba(29,36,51,.12); }

.rb-panel-body { padding: 24px; }

/* Materi */
.rb-toolbar { display: flex; justify-content: flex-end; margin-bottom: 14px; }
.rb-btn-ghost {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 14px; border-radius: 8px; border: 1px solid var(--line); background: #fff;
  font-size: 13.5px; font-weight: 600; color: var(--ink); cursor: pointer; transition: all .15s;
}
.rb-btn-ghost:hover { border-color: var(--ink); }
.rb-frame-wrap { position: relative; border: 1px solid var(--line); border-radius: 12px; overflow: hidden; background: #fff; }
.rb-frame { display: block; width: 100%; height: 70vh; min-height: 480px; border: 0; }
.rb-grid.expanded .rb-frame { height: 80vh; }
.rb-loading {
  position: absolute; inset: 0; display: grid; place-items: center; background: #fff;
  color: var(--ink-soft); font-size: 14px; font-weight: 500;
}
.rb-spinner {
  width: 28px; height: 28px; margin: 0 auto 10px; border-radius: 50%;
  border: 3px solid var(--line); border-top-color: var(--teal); animation: rb-spin .8s linear infinite;
}
@keyframes rb-spin { to { transform: rotate(360deg); } }

/* Tugas */
.rb-task-box {
  background: var(--amber-soft); border: 1px solid #f3d9b8; border-radius: 12px;
  padding: 18px 20px; margin-bottom: 28px;
}
.rb-task-box h3 { font-size: 15px; font-weight: 700; margin: 0 0 8px; color: var(--amber); }
.rb-task-box p { margin: 0; white-space: pre-wrap; font-size: 15px; }
.rb-download {
  display: inline-flex; align-items: center; gap: 8px; margin-top: 14px;
  padding: 10px 16px; border-radius: 9px; background: var(--amber); color: #fff;
  text-decoration: none; font-size: 14px; font-weight: 600; transition: filter .15s;
}
.rb-download:hover { filter: brightness(1.1); }

.rb-form h3 { font-size: 16px; font-weight: 700; margin: 0 0 16px; }
.rb-textarea {
  width: 100%; padding: 14px; border-radius: 10px; border: 1px solid var(--line);
  font-size: 15px; resize: vertical; min-height: 140px; margin-bottom: 20px; color: var(--ink);
  transition: border-color .15s;
}
.rb-textarea:focus { border-color: var(--teal); outline: none; box-shadow: 0 0 0 3px var(--teal-soft); }

.rb-drop {
  display: flex; align-items: center; gap: 14px; padding: 18px;
  border: 2px dashed var(--line); border-radius: 12px; cursor: pointer; margin-bottom: 22px;
  background: #fafbfc; transition: all .15s;
}
.rb-drop:hover, .rb-drop.drag { border-color: var(--teal); background: var(--teal-soft); }
.rb-drop.has-file { border-style: solid; border-color: var(--teal); background: var(--teal-soft); }
.rb-drop-icon {
  flex: 0 0 44px; height: 44px; border-radius: 10px; background: #fff;
  display: grid; place-items: center; font-size: 22px; border: 1px solid var(--line);
}
.rb-drop-main { font-size: 14.5px; font-weight: 600; overflow-wrap: anywhere; }
.rb-drop-sub { font-size: 13px; color: var(--ink-soft); }
.rb-drop-clear {
  margin-left: auto; background: none; border: none; color: var(--ink-soft);
  font-size: 13px; font-weight: 600; cursor: pointer; padding: 6px 8px; border-radius: 6px;
}
.rb-drop-clear:hover { color: var(--red); background: var(--red-soft); }
.rb-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }

.rb-submit {
  padding: 13px 26px; border: none; border-radius: 10px; background: var(--teal); color: #fff;
  font-size: 15px; font-weight: 700; cursor: pointer; transition: filter .15s;
}
.rb-submit:hover:not(:disabled) { filter: brightness(1.12); }
.rb-submit:disabled { opacity: .6; cursor: wait; }

.rb-alert {
  display: flex; gap: 10px; align-items: flex-start;
  padding: 12px 16px; border-radius: 10px; margin-bottom: 20px; font-size: 14.5px; font-weight: 600;
}
.rb-alert.ok { background: var(--teal-soft); color: var(--teal); }
.rb-alert.err { background: var(--red-soft); color: var(--red); }

/* Riwayat pengumpulan */
.rb-history { margin-bottom: 32px; }
.rb-history-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
.rb-history-head h3 { font-size: 16px; font-weight: 700; margin: 0; }
.rb-history-count { font-size: 13px; color: var(--ink-soft); font-weight: 500; }
.rb-history-empty {
  padding: 16px 18px; border-radius: 12px; background: #fafbfc; border: 1px dashed var(--line);
  color: var(--ink-soft); font-size: 14.5px;
}
.rb-sub {
  border: 1px solid var(--line); border-radius: 12px; background: #fff; margin-bottom: 12px; overflow: hidden;
}
.rb-sub.latest { border-color: #b9dcd7; }
.rb-sub-head {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  padding: 12px 16px; border-bottom: 1px solid var(--line); background: #fafbfc;
}
.rb-sub-title { font-size: 14px; font-weight: 700; }
.rb-sub-time { font-size: 12.5px; color: var(--ink-soft); }
.rb-chip {
  margin-left: auto; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 999px;
}
.rb-chip.wait { background: #eef1f6; color: var(--ink-soft); }
.rb-chip.done { background: var(--teal-soft); color: var(--teal); }
.rb-sub-body { padding: 14px 16px; }
.rb-sub-text { margin: 0; white-space: pre-wrap; font-size: 14.5px; overflow-wrap: anywhere; }
.rb-sub-text.none { color: var(--ink-soft); font-style: italic; }
.rb-attach {
  display: inline-flex; align-items: center; gap: 6px; margin-top: 10px;
  font-size: 13.5px; font-weight: 600; color: var(--teal); text-decoration: none;
  padding: 6px 10px; border-radius: 8px; background: var(--teal-soft);
}
.rb-attach:hover { text-decoration: underline; }
.rb-feedback {
  margin: 0 16px 16px; padding: 14px 16px; border-radius: 10px;
  background: #f4f6fb; border-left: 4px solid var(--ink);
}
.rb-feedback-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 6px; }
.rb-feedback-label { font-size: 13px; font-weight: 700; }
.rb-score { font-size: 20px; font-weight: 800; letter-spacing: -0.02em; }
.rb-score small { font-size: 12px; font-weight: 600; color: var(--ink-soft); }
.rb-feedback p { margin: 0; white-space: pre-wrap; font-size: 14.5px; }
.rb-older summary {
  cursor: pointer; font-size: 13.5px; font-weight: 600; color: var(--ink-soft);
  padding: 8px 0; list-style: none;
}
.rb-older summary::-webkit-details-marker { display: none; }
.rb-older summary:hover { color: var(--ink); }
.rb-older[open] summary { margin-bottom: 8px; }

/* Empty */
.rb-empty {
  text-align: center; padding: 64px 24px; background: var(--card);
  border: 2px dashed var(--line); border-radius: 16px; color: var(--ink-soft);
}
.rb-empty-icon { font-size: 40px; margin-bottom: 8px; }
.rb-empty h2 { color: var(--ink); font-size: 18px; margin: 0 0 6px; }
.rb-empty p { margin: 0; }

/* ---------- Responsif ---------- */
@media (max-width: 900px) {
  .rb-grid { grid-template-columns: 1fr; }
  .rb-side { position: static; }
  .rb-expand-btn { display: none; }
}
@media (max-width: 560px) {
  .rb-main { padding: 18px 14px 36px; }
  .rb-top-inner { padding: 12px 14px; }
  .rb-brand p, .rb-user-text { display: none; }
  .rb-panel-head, .rb-panel-body { padding: 16px; }
  .rb-panel-title { font-size: 19px; }
  .rb-tabs { width: 100%; }
  .rb-tab { flex: 1; justify-content: center; }
  .rb-frame { min-height: 420px; }
}
@media (prefers-reduced-motion: reduce) {
  .rb * { transition: none !important; animation-duration: 2s !important; }
}
`

/* Satu kartu pengiriman tugas.
   Kolom komentar_guru dan nilai dibaca jika ada di tabel submissions;
   jika belum ada, kartu tetap tampil dengan status "Menunggu dinilai". */
function KartuPengiriman({ data, urutan, terbaru }) {
  const adaNilai = data.nilai !== null && data.nilai !== undefined && data.nilai !== ''
  const sudahDinilai = adaNilai || !!data.komentar_guru
  return (
    <article className={`rb-sub ${terbaru ? 'latest' : ''}`}>
      <div className="rb-sub-head">
        <span className="rb-sub-title">Pengiriman ke-{urutan}</span>
        <span className="rb-sub-time">
          {new Date(data.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
        </span>
        <span className={`rb-chip ${sudahDinilai ? 'done' : 'wait'}`}>
          {sudahDinilai ? 'Sudah dinilai' : 'Menunggu dinilai'}
        </span>
      </div>
      <div className="rb-sub-body">
        <p className={`rb-sub-text ${data.jawaban_teks ? '' : 'none'}`}>
          {data.jawaban_teks || 'Tanpa jawaban teks'}
        </p>
        {data.file_url && (
          <a className="rb-attach" href={data.file_url} target="_blank" rel="noreferrer">
            <span aria-hidden="true">📎</span> Buka lampiran
          </a>
        )}
      </div>
      {sudahDinilai && (
        <div className="rb-feedback">
          <div className="rb-feedback-head">
            <span className="rb-feedback-label">Umpan balik guru</span>
            {adaNilai && <span className="rb-score">{data.nilai} <small>/ 100</small></span>}
          </div>
          {data.komentar_guru && <p>{data.komentar_guru}</p>}
        </div>
      )}
    </article>
  )
}

export default function Materi() {
  const [siswa, setSiswa] = useState(null)
  const [chapters, setChapters] = useState([])
  const [selectedChapter, setSelectedChapter] = useState('')
  const [materials, setMaterials] = useState([])
  const [selectedMaterial, setSelectedMaterial] = useState(null)

  const [htmlContent, setHtmlContent] = useState('')
  const [loadingMateri, setLoadingMateri] = useState(false)

  const [activeTab, setActiveTab] = useState('materi')
  const [isExpanded, setIsExpanded] = useState(false)

  const [jawabanTeks, setJawabanTeks] = useState('')
  const [fileTugas, setFileTugas] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [loadingUpload, setLoadingUpload] = useState(false)
  const [statusPengiriman, setStatusPengiriman] = useState('')

  // Riwayat pengumpulan tugas siswa untuk pertemuan yang sedang dibuka
  const [riwayatTugas, setRiwayatTugas] = useState([])
  const [loadingRiwayat, setLoadingRiwayat] = useState(false)

  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const dataSiswa = localStorage.getItem('siswaData')
    if (!dataSiswa) return navigate('/login')
    setSiswa(JSON.parse(dataSiswa))
    fetchChapters()
  }, [])

  // Muat file HTML materi (dengan pengaman agar respons lama tidak menimpa yang baru)
  useEffect(() => {
    if (!selectedMaterial?.file_url) {
      setHtmlContent('')
      return
    }
    let batal = false
    setLoadingMateri(true)
    fetch(selectedMaterial.file_url)
      .then(res => res.text())
      .then(text => { if (!batal) setHtmlContent(text) })
      .catch(() => { if (!batal) setHtmlContent('<p style="font-family:sans-serif;padding:24px">Materi tidak bisa dimuat. Periksa koneksi internet lalu pilih ulang pertemuan ini.</p>') })
      .finally(() => { if (!batal) setLoadingMateri(false) })
    return () => { batal = true }
  }, [selectedMaterial])

  // Ambil riwayat setiap kali pertemuan berganti.
  // Dipisah dari effect materi agar tetap jalan walau pertemuan tidak punya file HTML.
  useEffect(() => {
    if (!selectedMaterial || !siswa) { setRiwayatTugas([]); return }
    let batal = false
    fetchRiwayatTugas(selectedMaterial.id, siswa.id, () => batal)
    return () => { batal = true }
  }, [selectedMaterial?.id, siswa?.id])

  const fetchRiwayatTugas = async (materialId, studentId, sudahBatal = () => false) => {
    setLoadingRiwayat(true)
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('material_id', materialId)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
    if (sudahBatal()) return
    setRiwayatTugas(!error && data ? data : [])
    setLoadingRiwayat(false)
  }

  // Tekan Esc untuk keluar dari mode perlebar
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setIsExpanded(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const fetchChapters = async () => {
    const { data } = await supabase.from('chapters').select('*').order('id', { ascending: true })
    if (data && data.length > 0) {
      setChapters(data); setSelectedChapter(data[0].id); fetchMaterials(data[0].id)
    }
  }

  const fetchMaterials = async (chapterId) => {
    const { data } = await supabase
      .from('materials')
      .select('*, weeks!inner(minggu_ke, chapter_id)')
      .eq('weeks.chapter_id', chapterId)
    if (data) {
      const urut = [...data].sort((a, b) => (a.weeks?.minggu_ke ?? 0) - (b.weeks?.minggu_ke ?? 0))
      setMaterials(urut)
      pilihMateri(urut[0] || null)
    }
  }

  const pilihMateri = (mat) => {
    setSelectedMaterial(mat)
    setActiveTab('materi')
    setStatusPengiriman('')
    setJawabanTeks('')
    setFileTugas(null)
  }

  const handleChapterChange = (e) => {
    setSelectedChapter(e.target.value)
    fetchMaterials(e.target.value)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files?.[0]) setFileTugas(e.dataTransfer.files[0])
  }

  const hapusFile = (e) => {
    e.preventDefault()
    setFileTugas(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmitTugas = async (e) => {
    e.preventDefault()
    if (!selectedMaterial) return
    if (!jawabanTeks.trim() && !fileTugas) {
      setStatusPengiriman('Gagal: isi jawaban teks atau pilih file terlebih dahulu.')
      return
    }
    setLoadingUpload(true); setStatusPengiriman('')

    let fileUrl = ''
    if (fileTugas) {
      const fileName = `${siswa.id}_${selectedMaterial.id}_${Date.now()}.${fileTugas.name.split('.').pop()}`
      const { error } = await supabase.storage.from('tugas-siswa').upload(`tugas/${fileName}`, fileTugas)
      if (error) { setStatusPengiriman('Gagal unggah: ' + error.message); setLoadingUpload(false); return }
      fileUrl = supabase.storage.from('tugas-siswa').getPublicUrl(`tugas/${fileName}`).data.publicUrl
    }

    const { error: insertError } = await supabase.from('submissions').insert([{
      material_id: selectedMaterial.id, student_id: siswa.id, jawaban_teks: jawabanTeks, file_url: fileUrl
    }])
    if (insertError) setStatusPengiriman('Gagal menyimpan: ' + insertError.message)
    else {
      setStatusPengiriman('Jawaban terkirim. Guru sudah bisa melihatnya.')
      setJawabanTeks(''); setFileTugas(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      fetchRiwayatTugas(selectedMaterial.id, siswa.id)
    }
    setLoadingUpload(false)
  }

  const handleLogout = () => { localStorage.removeItem('siswaData'); navigate('/login') }

  if (!siswa) return null

  const inisial = (siswa.nama || '?').split(' ').map(k => k[0]).slice(0, 2).join('').toUpperCase()
  const babAktif = chapters.find(c => String(c.id) === String(selectedChapter))
  const gagal = statusPengiriman.startsWith('Gagal')

  return (
    <div className="rb">
      <style>{css}</style>

      {/* ============ TOP BAR ============ */}
      <header className="rb-top">
        <div className="rb-top-inner">
          <div className="rb-brand">
            <div className="rb-logo" aria-hidden="true">🌏</div>
            <div>
              <h1>Ruang Belajar Sosiologi</h1>
              <p>Pelajari materi dan kumpulkan tugas di satu tempat</p>
            </div>
          </div>
          <div className="rb-user">
            <div className="rb-avatar" aria-hidden="true">{inisial}</div>
            <div className="rb-user-text">
              <div className="rb-user-name">{siswa.nama}</div>
              <div className="rb-user-class">Kelas {siswa.kelas}</div>
            </div>
            <button className="rb-logout" onClick={handleLogout}>Keluar</button>
          </div>
        </div>
      </header>

      <main className="rb-main">
        <div className={`rb-grid ${isExpanded ? 'expanded' : ''}`}>

          {/* ============ SIDEBAR ============ */}
          {!isExpanded && (
            <aside className="rb-side">
              <label className="rb-field-label" htmlFor="pilih-bab">Bab materi</label>
              <select id="pilih-bab" className="rb-select" value={selectedChapter} onChange={handleChapterChange}>
                {chapters.length === 0
                  ? <option value="">Belum ada bab</option>
                  : chapters.map(chap => <option key={chap.id} value={chap.id}>{chap.judul}</option>)}
              </select>

              {materials.length > 0 && (
                <>
                  <h2>Pertemuan</h2>
                  <ul className="rb-weeks">
                    {materials.map(mat => {
                      const aktif = selectedMaterial?.id === mat.id
                      return (
                        <li key={mat.id}>
                          <button
                            className={`rb-week ${aktif ? 'active' : ''}`}
                            onClick={() => pilihMateri(mat)}
                            aria-current={aktif ? 'true' : undefined}
                          >
                            <span className="rb-week-num">{mat.weeks?.minggu_ke}</span>
                            <span className="rb-week-text">
                              <span className="rb-week-title">Minggu {mat.weeks?.minggu_ke}</span>
                              <div className="rb-week-desc">{mat.instruksi_teks}</div>
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </>
              )}
            </aside>
          )}

          {/* ============ KONTEN ============ */}
          <section>
            {materials.length === 0 ? (
              <div className="rb-empty">
                <div className="rb-empty-icon" aria-hidden="true">📚</div>
                <h2>Bab ini belum punya materi</h2>
                <p>Pilih bab lain dari daftar di samping, atau cek lagi setelah guru mengunggah materi.</p>
              </div>
            ) : selectedMaterial && (
              <div className="rb-panel">
                <div className="rb-panel-head">
                  <div>
                    <p className="rb-panel-meta">
                      {babAktif?.judul ? `${babAktif.judul}, ` : ''}Minggu {selectedMaterial.weeks?.minggu_ke}
                    </p>
                    <h2 className="rb-panel-title">{selectedMaterial.instruksi_teks}</h2>
                  </div>
                  <div className="rb-tabs" role="tablist">
                    <button role="tab" aria-selected={activeTab === 'materi'}
                      className={`rb-tab ${activeTab === 'materi' ? 'active' : ''}`}
                      onClick={() => setActiveTab('materi')}>
                      <span aria-hidden="true">📖</span> Materi
                    </button>
                    <button role="tab" aria-selected={activeTab === 'tugas'}
                      className={`rb-tab ${activeTab === 'tugas' ? 'active' : ''}`}
                      onClick={() => setActiveTab('tugas')}>
                      <span aria-hidden="true">📝</span> Lembar Kerja
                    </button>
                  </div>
                </div>

                <div className="rb-panel-body">
                  {/* ----- TAB MATERI ----- */}
                  {activeTab === 'materi' && (
                    <>
                      <div className="rb-toolbar">
                        <button className="rb-btn-ghost rb-expand-btn" onClick={() => setIsExpanded(!isExpanded)}>
                          {isExpanded ? '↙ Kecilkan (Esc)' : '↗ Perlebar materi'}
                        </button>
                      </div>
                      <div className="rb-frame-wrap">
                        {htmlContent || !selectedMaterial.file_url ? (
                          <iframe
                            className="rb-frame"
                            srcDoc={htmlContent || '<p style="font-family:sans-serif;padding:24px;color:#5b6477">Guru belum mengunggah file materi untuk pertemuan ini.</p>'}
                            title={`Materi: ${selectedMaterial.instruksi_teks}`}
                          />
                        ) : <div className="rb-frame" />}
                        {loadingMateri && (
                          <div className="rb-loading">
                            <div><div className="rb-spinner" />Memuat materi…</div>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* ----- TAB TUGAS ----- */}
                  {activeTab === 'tugas' && (
                    <>
                      <div className="rb-task-box">
                        <h3>Instruksi dari guru</h3>
                        <p>{selectedMaterial.instruksi_tugas || 'Tidak ada instruksi khusus untuk pertemuan ini.'}</p>
                        {selectedMaterial.file_tugas_url && (
                          <a className="rb-download" href={selectedMaterial.file_tugas_url} target="_blank" rel="noreferrer">
                            <span aria-hidden="true">⬇</span> Unduh lembar kerja
                          </a>
                        )}
                      </div>

                      {/* Riwayat ditaruh di atas form: siswa membaca umpan balik dulu, baru mengirim perbaikan */}
                      <div className="rb-history">
                        <div className="rb-history-head">
                          <h3>Pengumpulanmu</h3>
                          {riwayatTugas.length > 0 && (
                            <span className="rb-history-count">{riwayatTugas.length} kali dikirim</span>
                          )}
                        </div>

                        {loadingRiwayat && riwayatTugas.length === 0 ? (
                          <div className="rb-history-empty">Memuat riwayat…</div>
                        ) : riwayatTugas.length === 0 ? (
                          <div className="rb-history-empty">Kamu belum mengirim jawaban untuk tugas ini.</div>
                        ) : (
                          <>
                            <KartuPengiriman data={riwayatTugas[0]} urutan={riwayatTugas.length} terbaru />
                            {riwayatTugas.length > 1 && (
                              <details className="rb-older">
                                <summary>Lihat {riwayatTugas.length - 1} pengiriman sebelumnya ▾</summary>
                                {riwayatTugas.slice(1).map((r, i) => (
                                  <KartuPengiriman key={r.id} data={r} urutan={riwayatTugas.length - 1 - i} />
                                ))}
                              </details>
                            )}
                          </>
                        )}
                      </div>

                      <form className="rb-form" onSubmit={handleSubmitTugas}>
                        <h3>{riwayatTugas.length > 0 ? 'Kirim perbaikan jawaban' : 'Kirim jawabanmu'}</h3>

                        {statusPengiriman && (
                          <div className={`rb-alert ${gagal ? 'err' : 'ok'}`} role="status">
                            <span aria-hidden="true">{gagal ? '⚠️' : '✅'}</span>
                            <span>{statusPengiriman}</span>
                          </div>
                        )}

                        <label className="rb-field-label" htmlFor="jawaban">Jawaban atau catatan</label>
                        <textarea
                          id="jawaban"
                          className="rb-textarea"
                          value={jawabanTeks}
                          onChange={(e) => setJawabanTeks(e.target.value)}
                          placeholder="Tulis jawabanmu di sini…"
                        />

                        <span className="rb-field-label">File jawaban (opsional)</span>
                        <label
                          className={`rb-drop ${isDragging ? 'drag' : ''} ${fileTugas ? 'has-file' : ''}`}
                          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={handleDrop}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            className="rb-sr"
                            accept=".pdf,.doc,.docx,image/*"
                            onChange={(e) => setFileTugas(e.target.files[0] || null)}
                          />
                          <span className="rb-drop-icon" aria-hidden="true">{fileTugas ? '📄' : '📎'}</span>
                          <span>
                            <div className="rb-drop-main">{fileTugas ? fileTugas.name : 'Pilih file atau seret ke sini'}</div>
                            <div className="rb-drop-sub">
                              {fileTugas ? `${(fileTugas.size / 1024 / 1024).toFixed(2)} MB` : 'Gambar, PDF, atau Word'}
                            </div>
                          </span>
                          {fileTugas && <button type="button" className="rb-drop-clear" onClick={hapusFile}>Hapus</button>}
                        </label>

                        <button type="submit" className="rb-submit" disabled={loadingUpload}>
                          {loadingUpload ? 'Mengirim…' : 'Kirim jawaban'}
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}