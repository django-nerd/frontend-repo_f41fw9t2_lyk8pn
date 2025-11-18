import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './components/Home'
import Quiz from './components/Quiz'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}> 
        <Route index element={<Home />} />
        <Route path="quiz" element={<Quiz />} />
      </Route>
    </Routes>
  )
}
