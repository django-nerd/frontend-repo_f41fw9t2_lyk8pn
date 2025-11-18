import { useEffect, useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Radio({ name, value, checked, onChange, label }) {
  return (
    <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-700/60 hover:border-blue-500/50 transition-colors cursor-pointer">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="mt-1 h-4 w-4 text-blue-500 focus:ring-blue-500"
      />
      <span className="text-slate-200">{label}</span>
    </label>
  )
}

export default function Quiz() {
  const [topic, setTopic] = useState('Web Development')
  const [loading, setLoading] = useState(false)
  const [quiz, setQuiz] = useState(null)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const canSubmit = useMemo(() => {
    if (!quiz) return false
    return quiz.questions.every(q => typeof answers[q.id] === 'number') && name.trim().length > 1
  }, [quiz, answers, name])

  const startQuiz = async () => {
    setError('')
    setResult(null)
    setQuiz(null)
    setAnswers({})
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/quiz?topic=${encodeURIComponent(topic)}`)
      const data = await res.json()
      setQuiz(data)
    } catch (e) {
      setError('Failed to load quiz. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const submitQuiz = async () => {
    if (!quiz) return
    setLoading(true)
    setError('')
    try {
      const payload = {
        name,
        topic: quiz.topic,
        answers: quiz.questions.map(q => answers[q.id])
      }
      const res = await fetch(`${API_BASE}/api/quiz/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Submit failed')
      const data = await res.json()
      setResult(data)
    } catch (e) {
      setError('Could not submit quiz. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Skill Quiz</h2>
        <p className="text-blue-200/80">Test yourself and earn a shareable certificate if you pass.</p>
      </div>

      <div className="bg-slate-800/50 border border-blue-500/20 rounded-2xl p-6 mb-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-blue-200/80 mb-2">Choose a topic</label>
            <input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g. React, Data Science"
              className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-blue-200/80 mb-2">Your name (for certificate)</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Jane Doe"
              className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button
            onClick={startQuiz}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Start quiz'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 border border-red-500/30 bg-red-900/20 text-red-200 rounded-lg">
          {error}
        </div>
      )}

      {quiz && (
        <div className="space-y-6">
          {quiz.questions.map((q, idx) => (
            <div key={q.id} className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
                  {idx + 1}
                </div>
                <h3 className="text-white text-lg font-semibold leading-snug">{q.question}</h3>
              </div>
              <div className="mt-4 grid gap-2">
                {q.options.map((opt, i) => (
                  <Radio
                    key={i}
                    name={`q-${q.id}`}
                    value={i}
                    checked={answers[q.id] === i}
                    onChange={() => setAnswers(prev => ({ ...prev, [q.id]: i }))}
                    label={opt}
                  />
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <button
              onClick={submitQuiz}
              disabled={!canSubmit || loading}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit and get result'}
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="mt-8 bg-slate-900/60 border border-emerald-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className={`h-12 w-12 rounded-full flex items-center justify-center text-2xl ${result.passed ? 'bg-emerald-600' : 'bg-red-600'} text-white`}>
              {result.passed ? '✓' : '✕'}
            </div>
            <div>
              <h3 className="text-white text-xl font-bold">{result.passed ? 'Passed' : 'Try again'}</h3>
              <p className="text-blue-200/80">Score: {result.score}% • {result.correct}/{result.total} correct</p>
            </div>
          </div>

          {result.certificate_id && (
            <div className="mt-4 p-4 rounded-lg bg-emerald-900/20 border border-emerald-500/30 text-emerald-200">
              <p className="mb-2">Certificate issued!</p>
              <a
                href={`${API_BASE}/api/certificate/${result.certificate_id}`}
                target="_blank"
                className="underline"
                rel="noreferrer"
              >
                View certificate JSON
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
