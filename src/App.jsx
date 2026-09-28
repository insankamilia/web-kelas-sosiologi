import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Materi from './pages/Materi'
import Guru from './pages/Guru'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/materi" element={<Materi />} />
      <Route path="/guru" element={<Guru />} />
    </Routes>
  )
}

export default App