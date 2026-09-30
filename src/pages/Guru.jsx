import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Guru() {
  const [searchParams] = useSearchParams()
  const key = searchParams.get('key')
  const KUNCI_GURU = 'sosiologi2026'

  // STATE UNTUK MENU NAVIGASI (Default: Buka Halaman Bab)
  const [activeMenu, setActiveMenu] = useState('bab')

  const [chapters, setChapters] = useState([])
  const [submissions, setSubmissions] = useState([])
  
  // State Halaman 1: Tambah Bab
  const [judulBab, setJudulBab] = useState('')
  const [deskripsiBab, setDeskripsiBab] = useState('')

  // State Halaman 2: Upload Materi
  const [selectedChapterId, setSelectedChapterId] = useState('')
  const [mingguKe, setMingguKe] = useState(1)
  const [judulMateri, setJudulMateri] = useState('')
  const [fileHtml, setFileHtml] = useState(null)
  const [instruksiTugas, setInstruksiTugas] = useState('')
  const [fileLembarKerja, setFileLembarKerja] = useState(null)
  
  const [loadingUpload, setLoadingUpload] = useState(false)

  useEffect(() => {
    if (key === KUNCI_GURU) {
      fetchChapters()
      fetchSubmissions()
    }
  }, [key])

  const fetchChapters = async () => {
    const { data } = await supabase.from('chapters').select('*').order('id', { ascending: true })
    if (data) setChapters(data)
  }

  const fetchSubmissions = async () => {
    const { data } = await supabase.from('submissions').select('*').order('id', { ascending: false })
    if (data) setSubmissions(data)
  }

  // Fungsi Simpan Bab
  const handleAddChapter = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('chapters').insert([{ judul: judulBab, deskripsi: deskripsiBab }])
    if (!error) {
      alert('Bab berhasil ditambahkan!')
      setJudulBab('')
      setDeskripsiBab('')
      fetchChapters()
    } else alert('Gagal menyimpan bab: ' + error.message)
  }

  // Fungsi Upload Materi
  const handleUploadMateri = async (e) => {
    e.preventDefault()
    if (!fileHtml || !selectedChapterId) {
      alert('Pilih Bab dan File HTML Materi terlebih dahulu!')
      return
    }

    setLoadingUpload(true)

    // 1. Upload File Materi HTML
    const htmlName = `materi_${Date.now()}_${fileHtml.name}`
    const { error: htmlError } = await supabase.storage.from('materi-html').upload(htmlName, fileHtml)
    if (htmlError) { alert('Gagal upload HTML: ' + htmlError.message); setLoadingUpload(false); return; }
    const htmlUrl = supabase.storage.from('materi-html').getPublicUrl(htmlName).data.publicUrl

    // 2. Upload File Lembar Kerja (Jika Ada)
    let lembarKerjaUrl = null
    if (fileLembarKerja) {
      const lkName = `tugas_${Date.now()}_${fileLembarKerja.name}`
      const { error: lkError } = await supabase.storage.from('materi-html').upload(lkName, fileLembarKerja)
      if (!lkError) {
        lembarKerjaUrl = supabase.storage.from('materi-html').getPublicUrl(lkName).data.publicUrl
      }
    }

    // 3. Simpan ke database
    const { data: weekData, error: weekError } = await supabase
      .from('weeks')
      .insert([{ chapter_id: selectedChapterId, minggu_ke: mingguKe }])
      .select().single()

    if (weekData && !weekError) {
      const { error: materialError } = await supabase.from('materials').insert([{
        week_id: weekData.id,
        tipe: 'html',
        instruksi_teks: judulMateri,
        file_url: htmlUrl,
        instruksi_tugas: instruksiTugas,
        file_tugas_url: lembarKerjaUrl
      }])

      if (!materialError) {
        alert('Materi dan Tugas Berhasil Diunggah!')
        setJudulMateri(''); setFileHtml(null); setInstruksiTugas(''); setFileLembarKerja(null);
      }
    }
    setLoadingUpload(false)
  }

  if (key !== KUNCI_GURU) {
    return <h2 style={{color:'red', textAlign:'center', marginTop:'50px'}}>Akses Ditolak!</h2>
  }

  // Desain tombol menu/tab
  const tabStyle = (menuName) => ({
    padding: '12px 20px',
    cursor: 'pointer',
    backgroundColor: activeMenu === menuName ? '#2e7d32' : '#f0f0f0',
    color: activeMenu === menuName ? '#fff' : '#333',
    border: 'none',
    fontWeight: 'bold',
    borderRadius: '8px 8px 0 0',
    marginRight: '5px',
    fontSize: '16px'
  })

  return (
    <div style={{ maxWidth: '1000px', margin: '30px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#2e7d32', marginBottom: '20px' }}>Dashboard Pengelolaan Guru</h2>
      
      {/* MENU NAVIGASI TAB */}
      <div style={{ display: 'flex', borderBottom: '3px solid #2e7d32', marginBottom: '25px' }}>
        <button style={tabStyle('bab')} onClick={() => setActiveMenu('bab')}>
          1. Kelola Bab Baru
        </button>
        <button style={tabStyle('materi')} onClick={() => setActiveMenu('materi')}>
          2. Upload Materi & Tugas
        </button>
        <button style={tabStyle('rekap')} onClick={() => setActiveMenu('rekap')}>
          3. Rekap Jawaban Siswa
        </button>
      </div>

      {/* KONTEN HALAMAN */}
      <div style={{ backgroundColor: '#fff', minHeight: '400px' }}>
        
        {/* HALAMAN 1: KELOLA BAB */}
        {activeMenu === 'bab' && (
          <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fdfdfd' }}>
            <h3 style={{ color: '#333', marginTop: 0 }}>Tambah Bab Pembelajaran</h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>Buat bab baru sebelum Anda mengunggah materi di dalamnya.</p>
            
            <form onSubmit={handleAddChapter} style={{ maxWidth: '600px' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Judul Bab:</label>
                <input type="text" value={judulBab} onChange={(e) => setJudulBab(e.target.value)} required placeholder="Contoh: BAB 1 - Kelompok Sosial" style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Deskripsi Singkat:</label>
                <textarea value={deskripsiBab} onChange={(e) => setDeskripsiBab(e.target.value)} rows="3" style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
              </div>
              <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Simpan Bab</button>
            </form>
          </div>
        )}

        {/* HALAMAN 2: UPLOAD MATERI & TUGAS */}
        {activeMenu === 'materi' && (
          <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fdfdfd', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            
            {/* Bagian Kiri: Materi Utama */}
            <div>
              <h3 style={{ marginTop: 0, color: '#333', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Materi Utama (HTML)</h3>
              <form id="formMateri" onSubmit={handleUploadMateri}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Pilih Bab:</label>
                <select value={selectedChapterId} onChange={(e) => setSelectedChapterId(e.target.value)} required style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '5px' }}>
                  <option value="">-- Pilih Bab --</option>
                  {chapters.map((chap) => <option key={chap.id} value={chap.id}>{chap.judul}</option>)}
                </select>
                
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Pertemuan / Minggu Ke-:</label>
                <input type="number" value={mingguKe} onChange={(e) => setMingguKe(e.target.value)} required style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '5px' }} />
                
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Judul Materi:</label>
                <input type="text" value={judulMateri} onChange={(e) => setJudulMateri(e.target.value)} required placeholder="Contoh: Pengertian Kelompok Sosial" style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '5px' }} />
                
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Upload File Materi (.html):</label>
                <input type="file" accept=".html" onChange={(e) => setFileHtml(e.target.files[0])} required style={{ marginBottom: '20px', display: 'block', padding: '10px', border: '1px dashed #ccc', width: '100%', boxSizing: 'border-box' }} />
              </form>
            </div>

            {/* Bagian Kanan: Penugasan Tambahan */}
            <div>
              <h3 style={{ marginTop: 0, color: '#1565c0', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Lampiran Tugas (Opsional)</h3>
              
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Instruksi Lembar Kerja (Untuk Siswa):</label>
              <textarea value={instruksiTugas} onChange={(e) => setInstruksiTugas(e.target.value)} placeholder="Contoh: Unduh file tugas di bawah ini dan kerjakan di buku tulis, lalu foto..." rows="4" style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '5px' }} />
              
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Upload File Lembar Kerja (.doc / .pdf):</label>
              <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFileLembarKerja(e.target.files[0])} style={{ display: 'block', marginBottom: '30px', padding: '10px', border: '1px dashed #ccc', width: '100%', boxSizing: 'border-box' }} />
              
              <button 
                type="submit" 
                form="formMateri" 
                disabled={loadingUpload} 
                style={{ padding: '15px', backgroundColor: '#1565c0', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', width: '100%', fontWeight: 'bold', fontSize: '16px' }}
              >
                {loadingUpload ? 'Proses Mengunggah...' : 'Upload Materi & Tugas Sekarang'}
              </button>
            </div>
            
          </div>
        )}

        {/* HALAMAN 3: REKAP TUGAS */}
        {activeMenu === 'rekap' && (
          <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fdfdfd' }}>
            <h3 style={{ marginTop: 0, color: '#333' }}>Daftar Pengumpulan Tugas Siswa</h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>Berikut adalah daftar siswa yang sudah mengirimkan jawaban teks atau file lembar kerja mereka.</p>
            
            <div style={{ overflowX: 'auto' }}>
              <table border="1" cellPadding="12" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#2e7d32', color: 'white' }}>
                    <th>ID Siswa</th>
                    <th>ID Materi</th>
                    <th>Jawaban Teks Siswa</th>
                    <th>File Lampiran Siswa</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.length === 0 ? (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>Belum ada siswa yang mengumpulkan tugas.</td></tr>
                  ) : (
                    submissions.map((sub) => (
                      <tr key={sub.id} style={{ backgroundColor: '#fff' }}>
                        <td><strong>{sub.student_id}</strong></td>
                        <td>Materi #{sub.material_id}</td>
                        <td style={{ whiteSpace: 'pre-wrap' }}>{sub.jawaban_teks || sub.jawaban || '-'}</td>
                        <td>
                          {sub.file_url ? (
                            <a href={sub.file_url} target="_blank" rel="noreferrer" style={{ color: '#1565c0', fontWeight: 'bold', padding: '5px 10px', backgroundColor: '#e3f2fd', borderRadius: '4px', textDecoration: 'none' }}>⬇️ Buka File</a>
                          ) : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}