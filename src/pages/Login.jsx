import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

// Daftar siswa berdasarkan kelas
const daftarSiswa = {
  "XI IPS 1": [
    "AI FITRI PEBRIYANI", "ALIMIN", "ARSA SAPUTRA", "DEDEH SARINAH", "DEDEN AWALUDIN",
    "HANIA MAHMUDAH", "IQBAL", "KARIMATUL ALYA", "LAURA NAJWA LISTIANA", "M AKMAL MAULANA",
    "M RIDHO ALFARIZKY", "MOCH NIZAM MUDIN", "MUHAMAD HILYATUL ARIFIN", "MUHAMAD NOUAF BAHRUL ULUM",
    "MUTIA DWI ANANDA LESTARI", "NURHALIMAH", "RESI SEPTIANI", "RIFFA SAEPUL ANWAR", "SAPA JULIANI",
    "SITI HERNA SARI", "SITI SANTI NOVIANTI", "SRI MEGA PARTIWI", "SYIFA ALMAHRI",
    "VIANNI ALMIRA ZULFAH", "YOGA P"
  ],
  "XI IPS 2": [
    "AGUSTYANA NAMIATI", "AIL MINJAR", "AINA ASTI NUR HADIAN", "ALMIRA JESIKA PEBRIYANI",
    "APDAL MAULANA", "DEVI MELATI", "ENDAN M SAPUTRA", "HILDA AFIFAH", "ILMA AULIA SIFA",
    "MUHAMAD ARIP SOPIAN", "MUHAMAD FADLAN PAUZAN", "MUHAMAD PAHRI", "RAFI SABILIAN",
    "RENDI", "SAHWA", "SALWA SYIFA AULIA", "SANTI ALPIA", "SERLINA PEBRIYANI",
    "SINTIA NURMALASARI", "SUSILAWATI", "SYAPA SITI NUR HOLIPA", "TAUFIK HIDAYAT",
    "WALDI SUPRIADI", "WILLY DWI PUTRA"
  ]
}

export default function Login() {
  const [kelas, setKelas] = useState('XI IPS 1')
  const [nama, setNama] = useState('')
  const [password, setPassword] = useState('')
  const [pesanError, setPesanError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Fungsi saat kelas diubah (nama di-reset agar tidak tertukar)
  const handleKelasChange = (e) => {
    setKelas(e.target.value)
    setNama('') 
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    
    // Cegah login jika nama belum dipilih
    if (!nama) {
      setPesanError('Silakan pilih nama Anda terlebih dahulu!')
      return
    }

    setLoading(true)
    setPesanError('')

    // Cek database Supabase
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('kelas', kelas)
      .eq('nama', nama) 
      .eq('password', password)
      .single()

    if (error || !data) {
      setPesanError('Maaf, Password (Nama Tokoh) Anda salah!')
    } else {
      localStorage.setItem('siswaData', JSON.stringify(data))
      navigate('/materi') 
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center', color: '#333' }}>Masuk ke Kelas Sosiologi</h2>
      
      {pesanError && <p style={{ color: 'red', textAlign: 'center', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '5px' }}>{pesanError}</p>}
      
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Kelas:</label>
          <select 
            value={kelas} 
            onChange={handleKelasChange}
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          >
            <option value="XI IPS 1">XI IPS 1</option>
            <option value="XI IPS 2">XI IPS 2</option>
          </select>
        </div>

        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Nama Lengkap:</label>
          <select 
            value={nama} 
            onChange={(e) => setNama(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          >
            <option value="" disabled>-- Pilih Nama Anda --</option>
            {daftarSiswa[kelas].map((siswaMasingMasing, index) => (
              <option key={index} value={siswaMasingMasing}>
                {siswaMasingMasing}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Password (Nama Tokoh):</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Masukkan nama sosiolog"
            required
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '12px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '10px' }}
        >
          {loading ? 'Mengecek...' : 'Masuk'}
        </button>
      </form>
    </div>
  )
}