import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Materi() {
  const [siswa, setSiswa] = useState(null)
  const [chapters, setChapters] = useState([])
  const [selectedChapter, setSelectedChapter] = useState('')
  const [materials, setMaterials] = useState([])
  const [selectedMaterial, setSelectedMaterial] = useState(null)
  
  // State untuk form tugas/lembar kerja
  const [jawabanTeks, setJawabanTeks] = useState('')
  const [fileTugas, setFileTugas] = useState(null)
  const [loadingUpload, setLoadingUpload] = useState(false)
  const [statusPengiriman, setStatusPengiriman] = useState('')

  const navigate = useNavigate()

  useEffect(() => {
    // Cek apakah siswa sudah login
    const dataSiswa = localStorage.getItem('siswaData')
    if (!dataSiswa) {
      navigate('/login')
      return
    }
    const parsedSiswa = JSON.parse(dataSiswa)
    setSiswa(parsedSiswa)

    fetchChapters()
  }, [])

  // Mengambil daftar Bab
  const fetchChapters = async () => {
    const { data } = await supabase.from('chapters').select('*').order('id', { ascending: true })
    if (data && data.length > 0) {
      setChapters(data)
      setSelectedChapter(data[0].id)
      fetchMaterials(data[0].id)
    }
  }

  // Mengambil daftar materi berdasarkan Bab
  const fetchMaterials = async (chapterId) => {
    const { data } = await supabase
      .from('materials')
      .select('*, weeks(minggu_ke, judul_minggu)')
      .eq('chapter_id', chapterId)
    
    if (data) {
      setMaterials(data)
      if (data.length > 0) setSelectedMaterial(data[0])
      else setSelectedMaterial(null)
    }
  }

  const handleChapterChange = (e) => {
    const chapId = e.target.value
    setSelectedChapter(chapId)
    fetchMaterials(chapId)
  }

  // Pengiriman Tugas / Lembar Kerja
  const handleSubmitTugas = async (e) => {
    e.preventDefault()
    if (!selectedMaterial) return

    setLoadingUpload(true)
    setStatusPengiriman('')

    let fileUrl = ''

    // 1. Upload file jika ada
    if (fileTugas) {
      if (fileTugas.size > 15 * 1024 * 1024) {
        setStatusPengiriman('Gagal: Ukuran file melebihi 15 MB!')
        setLoadingUpload(false)
        return
      }

      const fileExt = fileTugas.name.split('.').pop()
      const fileName = `${siswa.id}_${selectedMaterial.id}_${Date.now()}.${fileExt}`
      const filePath = `tugas/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('tugas-siswa')
        .upload(filePath, fileTugas)

      if (uploadError) {
        setStatusPengiriman('Gagal mengunggah file: ' + uploadError.message)
        setLoadingUpload(false)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('tugas-siswa')
        .getPublicUrl(filePath)

      fileUrl = publicUrlData.publicUrl
    }

    // 2. Simpan jawaban/tugas ke database
    const { error: insertError } = await supabase.from('submissions').insert([
      {
        material_id: selectedMaterial.id,
        student_id: siswa.id,
        jawaban_teks: jawabanTeks,
        file_url: fileUrl
      }
    ])

    if (insertError) {
      setStatusPengiriman('Gagal menyimpan jawaban: ' + insertError.message)
    } else {
      setStatusPengiriman('Berhasil dikirim! Jawaban/tugas Anda telah tersimpan.')
      setJawabanTeks('')
      setFileTugas(null)
    }

    setLoadingUpload(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('siswaData')
    navigate('/login')
  }

  if (!siswa) return null

  return (
    <div style={{ maxWidth: '900px', margin: '20px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      {/* Header Info Siswa */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '15px', borderBottom: '2px solid #eee' }}>
        <div>
          <h2 style={{ margin: 0, color: '#2e7d32' }}>Ruang Belajar Sosiologi</h2>
          <p style={{ margin: '5px 0 0 0', color: '#555' }}>
            Selamat datang, <strong>{siswa.nama}</strong> ({siswa.kelas})
          </p>
        </div>
        <button 
          onClick={handleLogout}
          style={{ padding: '8px 16px', backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          Keluar
        </button>
      </div>

      {/* Filter Bab */}
      <div style={{ marginTop: '20px', marginBottom: '20px' }}>
        <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Pilih Bab Materi:</label>
        <select 
          value={selectedChapter} 
          onChange={handleChapterChange}
          style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
        >
          {chapters.length === 0 ? (
            <option value="">Belum ada Bab (Menunggu Guru)</option>
          ) : (
            chapters.map((chap) => (
              <option key={chap.id} value={chap.id}>{chap.judul_bab}</option>
            ))
          )}
        </select>
      </div>

      {/* Area Tampilan Materi & Form Tugas */}
      {materials.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px dashed #ccc' }}>
          <p style={{ color: '#777' }}>Materi atau Lembar Kerja untuk Bab ini belum diunggah oleh Guru.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
          
          {/* Daftar Minggu/Materi di Sisi Kiri */}
          <div style={{ borderRight: '1px solid #eee', paddingRight: '15px' }}>
            <h4>Daftar Pertemuan:</h4>
            {materials.map((mat) => (
              <div 
                key={mat.id}
                onClick={() => setSelectedMaterial(mat)}
                style={{
                  padding: '10px',
                  marginBottom: '8px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: selectedMaterial?.id === mat.id ? '#e8f5e9' : '#f5f5f5',
                  borderLeft: selectedMaterial?.id === mat.id ? '4px solid #2e7d32' : 'none'
                }}
              >
                <strong>Minggu {mat.weeks?.minggu_ke}:</strong> {mat.judul_materi}
              </div>
            ))}
          </div>

          {/* Isi Materi & Form Kirim Tugas di Sisi Kanan */}
          <div>
            {selectedMaterial && (
              <>
                <h3 style={{ marginTop: 0 }}>{selectedMaterial.judul_materi}</h3>
                
                {/* Tampilan Konten HTML Materi jika ada */}
                {selectedMaterial.file_html_url ? (
                  <iframe 
                    src={selectedMaterial.file_html_url} 
                    title="Materi HTML"
                    style={{ width: '100%', height: '400px', border: '1px solid #ddd', borderRadius: '6px', marginBottom: '20px' }}
                  />
                ) : (
                  <p style={{ color: '#666', italic: 'true' }}>Tidak ada file HTML untuk materi ini.</p>
                )}

                {/* Form Lembar Kerja / Tugas */}
                <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                  <h4 style={{ marginTop: 0, color: '#1565c0' }}>Lembar Kerja / Pengiriman Tugas</h4>
                  
                  {statusPengiriman && (
                    <p style={{ 
                      padding: '10px', 
                      borderRadius: '5px', 
                      backgroundColor: statusPengiriman.startsWith('Berhasil') ? '#e8f5e9' : '#ffe6e6',
                      color: statusPengiriman.startsWith('Berhasil') ? '#2e7d32' : '#c62828'
                    }}>
                      {statusPengiriman}
                    </p>
                  )}

                  <form onSubmit={handleSubmitTugas}>
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Jawaban Teks / Catatan:</label>
                      <textarea 
                        rows="4" 
                        value={jawabanTeks}
                        onChange={(e) => setJawabanTeks(e.target.value)}
                        placeholder="Ketik jawaban lembar kerja atau catatan tugas di sini..."
                        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Unggah File Tugas (PDF/Gambar, maks 15MB):</label>
                      <input 
                        type="file" 
                        onChange={(e) => setFileTugas(e.target.files[0])}
                        accept="image/*,.pdf,.doc,.docx"
                        style={{ width: '100%' }}
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={loadingUpload}
                      style={{ padding: '10px 20px', backgroundColor: '#1565c0', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      {loadingUpload ? 'Mengirim...' : 'Kirim Jawaban'}
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>

        </div>
      )}
    </div>
  )
}