import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Guru() {
  const [searchParams] = useSearchParams()
  const key = searchParams.get('key')
  
  // KUNCI RAHASIA GURU (Bisa Anda ubah sesuka hati)
  const KUNCI_GURU = 'sosiologi2026'

  const [chapters, setChapters] = useState([])
  const [submissions, setSubmissions] = useState([])
  
  // Form Tambah Bab
  const [judulBab, setJudulBab] = useState('')
  const [deskripsiBab, setDeskripsiBab] = useState('')

  // Form Upload Materi HTML
  const [selectedChapterId, setSelectedChapterId] = useState('')
  const [mingguKe, setMingguKe] = useState(1)
  const [judulMateri, setJudulMateri] = useState('')
  const [fileHtml, setFileHtml] = useState(null)
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
    const { data } = await supabase
      .from('submissions')
      .select('*, students(nama, kelas), materials(judul_materi)')
      .order('created_at', { ascending: false })
    if (data) setSubmissions(data)
  }

  // 1. Tambah Bab Baru
  const handleAddChapter = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('chapters').insert([{ judul_bab: judulBab, deskripsi: deskripsiBab }])
    if (!error) {
      alert('Bab berhasil ditambahkan!')
      setJudulBab('')
      setDeskripsiBab('')
      fetchChapters()
    }
  }

  // 2. Upload File Materi HTML ke Supabase Storage
  const handleUploadMateri = async (e) => {
    e.preventDefault()
    if (!fileHtml || !selectedChapterId) {
      alert('Pilih Bab dan File HTML terlebih dahulu!')
      return
    }

    setLoadingUpload(true)

    // Upload file HTML ke bucket 'materi-html'
    const fileName = `materi_${Date.now()}_${fileHtml.name}`
    const { error: uploadError } = await supabase.storage
      .from('materi-html')
      .upload(fileName, fileHtml)

    if (uploadError) {
      alert('Gagal upload file HTML: ' + uploadError.message)
      setLoadingUpload(false)
      return
    }

    // Ambil Link Public dari File HTML
    const { data: publicUrlData } = supabase.storage
      .from('materi-html')
      .getPublicUrl(fileName)

    const htmlUrl = publicUrlData.publicUrl

    // Simpan data minggu & materi ke Database
    const { data: weekData, error: weekError } = await supabase
      .from('weeks')
      .insert([{ chapter_id: selectedChapterId, minggu_ke: mingguKe, judul_minggu: judulMateri }])
      .select()
      .single()

    if (!weekError && weekData) {
      await supabase.from('materials').insert([
        {
          chapter_id: selectedChapterId,
          week_id: weekData.id,
          judul_materi: judulMateri,
          file_html_url: htmlUrl
        }
      ])
      alert('Materi HTML Berhasil Diunggah!')
      setJudulMateri('')
      setFileHtml(null)
    }

    setLoadingUpload(false)
  }

  // Jika Key di URL salah / tidak ada
  if (key !== KUNCI_GURU) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
        <h2 style={{ color: 'red' }}>Akses Ditolak!</h2>
        <p>Anda tidak memiliki izin untuk mengakses halaman Guru ini.</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '30px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2 style={{ borderBottom: '2px solid #2e7d32', paddingBottom: '10px' }}>Dashboard Pengelolaan Guru</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '20px' }}>
        
        {/* Form 1: Tambah Bab */}
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fdfdfd' }}>
          <h3>1. Tambah Bab Baru</h3>
          <form onSubmit={handleAddChapter}>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block' }}>Judul Bab:</label>
              <input 
                type="text" 
                value={judulBab} 
                onChange={(e) => setJudulBab(e.target.value)}
                placeholder="Contoh: BAB 1 - Perubahan Sosial"
                required
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block' }}>Deskripsi Singkat:</label>
              <textarea 
                value={deskripsiBab} 
                onChange={(e) => setDeskripsiBab(e.target.value)}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>
            <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Simpan Bab
            </button>
          </form>
        </div>

        {/* Form 2: Upload Materi HTML */}
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fdfdfd' }}>
          <h3>2. Upload File Materi HTML</h3>
          <form onSubmit={handleUploadMateri}>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block' }}>Pilih Bab:</label>
              <select 
                value={selectedChapterId} 
                onChange={(e) => setSelectedChapterId(e.target.value)}
                required
                style={{ width: '100%', padding: '8px' }}
              >
                <option value="">-- Pilih Bab --</option>
                {chapters.map((chap) => (
                  <option key={chap.id} value={chap.id}>{chap.judul_bab}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block' }}>Pertemuan / Minggu Ke-:</label>
              <input 
                type="number" 
                value={mingguKe} 
                onChange={(e) => setMingguKe(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block' }}>Judul Materi Pertemuan:</label>
              <input 
                type="text" 
                value={judulMateri} 
                onChange={(e) => setJudulMateri(e.target.value)}
                placeholder="Contoh: Bentuk-bentuk Perubahan Sosial"
                required
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block' }}>Pilih File HTML (.html):</label>
              <input 
                type="file" 
                accept=".html"
                onChange={(e) => setFileHtml(e.target.files[0])}
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loadingUpload}
              style={{ padding: '8px 16px', backgroundColor: '#1565c0', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              {loadingUpload ? 'Mengunggah...' : 'Upload Materi HTML'}
            </button>
          </form>
        </div>

      </div>

      {/* Tabel Hasil Pengiriman Tugas Siswa */}
      <div style={{ marginTop: '40px' }}>
        <h3>3. Rekap Tugas & Jawaban Siswa</h3>
        <table border="1" cellPadding="10" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th>Siswa</th>
              <th>Kelas</th>
              <th>Materi</th>
              <th>Jawaban Teks</th>
              <th>File Tugas</th>
            </tr>
          </thead>
          <tbody>
            {submissions.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center' }}>Belum ada siswa yang mengirim tugas.</td></tr>
            ) : (
              submissions.map((sub) => (
                <tr key={sub.id}>
                  <td><strong>{sub.students?.nama}</strong></td>
                  <td>{sub.students?.kelas}</td>
                  <td>{sub.materials?.judul_materi}</td>
                  <td>{sub.jawaban_teks || '-'}</td>
                  <td>
                    {sub.file_url ? (
                      <a href={sub.file_url} target="_blank" rel="noreferrer" style={{ color: '#1565c0', fontWeight: 'bold' }}>Lihat File</a>
                    ) : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}