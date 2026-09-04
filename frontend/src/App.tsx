import { useState, useEffect, useCallback } from 'react'

interface Player {
  id: number
  name: string
  word?: string
  isImpost?: boolean
  votes?: number
  eliminated?: boolean
}

interface WordPair {
  normal: string
  impost: string
}

interface Game {
  id: string
  players: Player[]
  maxPlayers: number
  phase: string
  wordPair: WordPair
  currentReveal: number
  votes: Record<number, number>
  votingActive: boolean
  eliminatedIds: number[]
  winner?: string
  impostRevealed?: boolean
}

const API_BASE = import.meta.env.VITE_API_URL || '/api'

function App() {
  const [game, setGame] = useState<Game | null>(null)
  const [step, setStep] = useState<'landing' | 'select' | 'names' | 'waiting'>('landing')
  const [playerCount, setPlayerCount] = useState(6)
  const [playerName, setPlayerName] = useState('')
  const [playerNames, setPlayerNames] = useState<string[]>([])
  const [currentPlayerId, setCurrentPlayerId] = useState<number | null>(null)
  const [showCard, setShowCard] = useState(false)
  const [currentWord, setCurrentWord] = useState('')
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchGame = useCallback(async (gameId: string) => {
    try {
      const res = await fetch(`${API_BASE}/game/${gameId}`)
      if (res.ok) {
        const data = await res.json()
        setGame(data)
      }
    } catch (err) {
      setError('Failed to fetch game')
    }
  }, [])

  useEffect(() => {
    if (game?.id && game.phase !== 'setup') {
      const interval = setInterval(() => fetchGame(game.id), 2000)
      return () => clearInterval(interval)
    }
  }, [game?.id, game?.phase, fetchGame])

  const createGame = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxPlayers: playerCount }),
      })
      if (res.ok) {
        const data = await res.json()
        setGame(data)
        setStep('names')
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to create game')
      }
    } catch (err) {
      setError('Failed to create game')
    }
    setLoading(false)
  }

  const addPlayer = () => {
    if (!playerName.trim()) return
    if (playerNames.some(n => n.toLowerCase() === playerName.trim().toLowerCase())) {
      setError('Player name already exists')
      return
    }
    setPlayerNames([...playerNames, playerName.trim()])
    setPlayerName('')
    setError('')
  }

  const removePlayer = (index: number) => {
    setPlayerNames(playerNames.filter((_, i) => i !== index))
  }

  const startGame = async () => {
    if (!game?.id || playerNames.length !== playerCount) return
    setLoading(true)
    setError('')

    try {
      for (const name of playerNames) {
        const res = await fetch(`${API_BASE}/game/${game.id}/player`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        })
        if (!res.ok) {
          const data = await res.json()
          setError(data.error || 'Failed to add player')
          setLoading(false)
          return
        }
      }

      const startRes = await fetch(`${API_BASE}/game/${game.id}/start`, { method: 'POST' })
      if (startRes.ok) {
        const data = await startRes.json()
        setGame(data)
        setStep('waiting')
        setCurrentPlayerId(1)
      } else {
        const data = await startRes.json()
        setError(data.error || 'Failed to start game')
      }
    } catch (err) {
      setError('Failed to start game')
    }
    setLoading(false)
  }

  const viewMyCard = async () => {
    if (!game?.id) return
    const revealPlayerId = game.players[game.currentReveal]?.id
    if (!revealPlayerId) return
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/game/${game.id}/player/${revealPlayerId}/word`)
      if (res.ok) {
        const data = await res.json()
        setCurrentWord(data.word)
        setShowCard(true)
      }
    } catch (err) {
      setError('Failed to view card')
    }
    setLoading(false)
  }

  const nextReveal = async () => {
    if (!game?.id) return
    setShowCard(false)
    setCurrentWord('')
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/game/${game.id}/next-reveal`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setGame(data)
      }
    } catch (err) {
      setError('Failed to proceed')
    }
    setLoading(false)
  }

  const startVoting = async () => {
    if (!game?.id) return
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/game/${game.id}/start-voting`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setGame(data)
      }
    } catch (err) {
      setError('Failed to start voting')
    }
    setLoading(false)
  }

  const castVote = async () => {
    if (!game?.id || selectedTarget === null) return

    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/game/${game.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId: selectedTarget }),
      })
      if (res.ok) {
        const data = await res.json()
        setGame(data)
        setSelectedTarget(null)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to vote')
      }
    } catch (err) {
      setError('Failed to cast vote')
    }
    setLoading(false)
  }

  const continueGame = async () => {
    if (!game?.id) return
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/game/${game.id}/continue`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setGame(data)
      }
    } catch (err) {
      setError('Failed to continue')
    }
    setLoading(false)
  }

  const nextPlayerTurn = () => {
    if (!game) return
    const nextId = currentPlayerId! + 1
    if (nextId > game.players.length) {
      setCurrentPlayerId(1)
    } else {
      setCurrentPlayerId(nextId)
    }
    setShowCard(false)
  }

  const resetGame = () => {
    setGame(null)
    setStep('landing')
    setPlayerNames([])
    setCurrentPlayerId(null)
    setShowCard(false)
    setSelectedTarget(null)
    setError('')
  }

  const getActivePlayers = () => game?.players.filter(p => !p.eliminated) || []
  const getImpostorCount = () => game?.players.filter(p => p.isImpost && !p.eliminated).length || 0
  const getVillagerCount = () => game?.players.filter(p => !p.isImpost && !p.eliminated).length || 0

  // Landing page
  if (step === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-2">🕵️ Imposter</h1>
            <p className="text-purple-200">A game of deception and deduction</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-3">Welcome!</h2>
              <p className="text-purple-200 leading-relaxed">
                One player is secretly the Imposter with a slightly different word.
                Everyone else shares the same word. Discuss, question, and vote to
                find the Imposter before they blend in too well!
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-3 text-center">How to Play</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                  <span className="text-2xl">👥</span>
                  <div>
                    <p className="text-white font-medium text-sm">Gather Players</p>
                    <p className="text-purple-300 text-xs">4-20 players can join the game</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                  <span className="text-2xl">🃏</span>
                  <div>
                    <p className="text-white font-medium text-sm">View Your Card</p>
                    <p className="text-purple-300 text-xs">Each player secretly sees their word</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                  <span className="text-2xl">💬</span>
                  <div>
                    <p className="text-white font-medium text-sm">Discuss & Question</p>
                    <p className="text-purple-300 text-xs">Ask creative questions to find the Imposter</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                  <span className="text-2xl">🗳️</span>
                  <div>
                    <p className="text-white font-medium text-sm">Vote & Eliminate</p>
                    <p className="text-purple-300 text-xs">Vote to eliminate one player each round</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-400/20">
              <h3 className="text-lg font-bold text-white mb-2 text-center">Win Conditions</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-400 font-bold">Villagers:</span>
                  <span className="text-purple-200">Find and eliminate the Imposter</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-400 font-bold">Imposter:</span>
                  <span className="text-purple-200">Survive until only one Villager remains</span>
                </div>
              </div>
            </div>

            <div className="mb-6 p-4 bg-white/5 rounded-xl">
              <h3 className="text-lg font-bold text-white mb-2 text-center">Game Flow</h3>
              <div className="flex items-center justify-center gap-2 text-sm text-purple-200">
                <span className="px-2 py-1 bg-white/10 rounded">Setup</span>
                <span>→</span>
                <span className="px-2 py-1 bg-white/10 rounded">Reveal</span>
                <span>→</span>
                <span className="px-2 py-1 bg-white/10 rounded">Discuss</span>
                <span>→</span>
                <span className="px-2 py-1 bg-white/10 rounded">Vote</span>
                <span>→</span>
                <span className="px-2 py-1 bg-white/10 rounded">Result</span>
              </div>
            </div>

            <button
              onClick={() => setStep('select')}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg text-lg"
            >
              🎮 Start Playing
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Step 1: Select player count
  if (step === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-2">🕵️ Imposter</h1>
            <p className="text-purple-200">Find the imposter among you!</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-400/50 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}

            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white mb-2">How many players?</h2>
              <p className="text-purple-200 text-sm">Choose between 4 and 20 players</p>
            </div>

            <div className="flex items-center justify-center gap-4 mb-8">
              <button
                onClick={() => setPlayerCount(Math.max(4, playerCount - 1))}
                className="w-14 h-14 rounded-full bg-white/10 border border-white/30 text-white text-2xl font-bold hover:bg-white/20 transition-all"
              >
                -
              </button>
              <div className="w-32 h-24 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-5xl font-bold text-white">{playerCount}</span>
              </div>
              <button
                onClick={() => setPlayerCount(Math.min(20, playerCount + 1))}
                className="w-14 h-14 rounded-full bg-white/10 border border-white/30 text-white text-2xl font-bold hover:bg-white/20 transition-all"
              >
                +
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2 mb-8">
              {Array.from({ length: 17 }, (_, i) => i + 4).map(num => (
                <button
                  key={num}
                  onClick={() => setPlayerCount(num)}
                  className={`py-2 rounded-lg text-sm font-medium transition-all ${
                    playerCount === num
                      ? 'bg-pink-500 text-white scale-110'
                      : 'bg-white/10 text-purple-200 hover:bg-white/20'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            <button
              onClick={createGame}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 shadow-lg text-lg"
            >
              {loading ? 'Creating...' : '🎮 Create Game'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Step 2: Enter player names
  if (step === 'names') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-white mb-2">🕵️ Imposter</h1>
            <p className="text-purple-200">Enter player names</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-400/50 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}

            <div className="text-center mb-4">
              <span className="text-3xl font-bold text-white">{playerNames.length}</span>
              <span className="text-purple-200"> / {playerCount} players</span>
            </div>

            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Player ${playerNames.length + 1} name`}
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  disabled={playerNames.length >= playerCount}
                />
                <button
                  onClick={addPlayer}
                  disabled={!playerName.trim() || playerNames.length >= playerCount}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl transition-all disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>

            {playerNames.length > 0 && (
              <div className="mb-4 max-h-60 overflow-y-auto space-y-2">
                {playerNames.map((name, index) => (
                  <div key={index} className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                      {name[0].toUpperCase()}
                    </div>
                    <span className="text-white flex-1">{name}</span>
                    <button
                      onClick={() => removePlayer(index)}
                      className="w-6 h-6 rounded-full bg-red-500/30 text-red-300 hover:bg-red-500/50 flex items-center justify-center text-sm"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => { setStep('select'); setGame(null); setPlayerNames([]); }}
                className="flex-1 py-3 bg-white/10 border border-white/30 text-white font-bold rounded-xl hover:bg-white/20 transition-all"
              >
                Back
              </button>
              <button
                onClick={startGame}
                disabled={playerNames.length !== playerCount || loading}
                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg"
              >
                {loading ? 'Starting...' : '🚀 Start Game'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Game phases
  if (!game) return null

  const currentRevealPlayer = game.players[game.currentReveal]

  // Reveal Phase
  if (game.phase === 'reveal') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">🕵️ Imposter</h1>
            <p className="text-purple-200">Card Reveal Phase</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-400/50 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}

            <div className="text-center mb-6">
              <p className="text-purple-200 text-sm mb-2">Current Player</p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                  {currentRevealPlayer?.name[0].toUpperCase()}
                </div>
                <span className="text-2xl font-bold text-white">{currentRevealPlayer?.name}</span>
              </div>
              <p className="text-purple-300 text-sm mt-2">
                Player {game.currentReveal + 1} of {game.players.length}
              </p>
            </div>

            {!showCard ? (
              <div className="space-y-4">
                <p className="text-center text-purple-200">
                  Pass the device to <span className="text-white font-bold">{currentRevealPlayer?.name}</span>
                </p>
                <button
                  onClick={viewMyCard}
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 shadow-lg text-lg"
                >
                  {loading ? 'Loading...' : '🃏 Tap to View Your Card'}
                </button>
                <p className="text-center text-purple-400 text-xs">
                  Only {currentRevealPlayer?.name} should tap this button!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl blur opacity-75"></div>
                  <div className="relative bg-gradient-to-br from-amber-100 to-orange-200 rounded-2xl p-8 text-center">
                    <div className="text-6xl mb-4">📋</div>
                    <p className="text-amber-800 text-sm font-medium mb-2">Your word is</p>
                    <p className="text-4xl font-bold text-amber-900">{currentWord}</p>
                    <p className="text-amber-700 text-xs mt-3">Remember this word! Don't reveal it to others.</p>
                  </div>
                </div>

                <button
                  onClick={() => { nextReveal(); }}
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 shadow-lg"
                >
                  {loading ? 'Processing...' : '✅ I memorized it! Pass to next'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Discuss Phase
  if (game.phase === 'discuss') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">🕵️ Imposter</h1>
            <p className="text-purple-200">Discussion Phase</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-400/50 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}

            <div className="text-center mb-6">
              <div className="text-6xl mb-4">💬</div>
              <h2 className="text-2xl font-bold text-white mb-2">Discuss!</h2>
              <p className="text-purple-200">
                Talk with other players to figure out who the Imposter is.
                Don't reveal your word directly!
              </p>
            </div>

            <div className="mb-6">
              <p className="text-purple-200 text-sm mb-3">Active Players ({getActivePlayers().length})</p>
              <div className="grid grid-cols-2 gap-2">
                {getActivePlayers().map((p) => (
                  <div key={p.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${p.id === currentPlayerId ? 'bg-green-500/20 border border-green-400/50' : 'bg-white/10'}`}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                      {p.name[0].toUpperCase()}
                    </div>
                    <span className="text-white text-sm">{p.name}</span>
                    {p.id === currentPlayerId && (
                      <span className="ml-auto text-xs text-green-300">(You)</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={startVoting}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 shadow-lg text-lg"
            >
              {loading ? 'Starting...' : '🗳️ Start Voting'}
            </button>

            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-purple-300 text-xs text-center">
                Hint: The Imposter has a similar but different word. Ask creative questions!
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Voting Phase
  if (game.phase === 'voting') {
    const activePlayers = getActivePlayers()

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">🕵️ Imposter</h1>
            <p className="text-purple-200">Voting Round {(game.eliminatedIds || []).length + 1}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-400/50 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}

            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🗳️</div>
              <h2 className="text-2xl font-bold text-white mb-2">Who is the Imposter?</h2>
              <p className="text-purple-200 text-sm">
                Vote to eliminate one player
              </p>
              <p className="text-purple-300 text-xs mt-1">
                {activePlayers.length} players remaining
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {activePlayers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedTarget(p.id)}
                  disabled={loading}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    selectedTarget === p.id
                      ? 'bg-red-500/40 border-2 border-red-400 scale-105'
                      : 'bg-white/10 border border-white/20 hover:bg-white/20'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold">
                    {p.name[0].toUpperCase()}
                  </div>
                  <span className="text-white font-medium flex-1 text-left">{p.name}</span>
                  {selectedTarget === p.id && (
                    <span className="text-2xl">❌</span>
                  )}
                </button>
              ))}
            </div>

            {selectedTarget && (
              <div className="space-y-3">
                <button
                  onClick={castVote}
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 shadow-lg"
                >
                  {loading ? 'Voting...' : '🗳️ Confirm Vote'}
                </button>
                <button
                  onClick={() => setSelectedTarget(null)}
                  disabled={loading}
                  className="w-full py-3 bg-white/10 border border-white/30 text-white font-medium rounded-xl hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-purple-300 text-xs text-center">
                The player voted out will be eliminated. Discuss wisely!
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Result Phase
  if (game.phase === 'result') {
    const lastEliminated = game.players.find(p => p.eliminated && (game.eliminatedIds || []).includes(p.id))

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">🕵️ Imposter</h1>
            <p className="text-purple-200">Elimination Result</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-400/50 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}

            <div className="text-center mb-6">
              <div className="text-6xl mb-4">👋</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {lastEliminated?.name} has been eliminated!
              </h2>
              <p className="text-purple-200">
                They were <span className="text-green-400 font-bold">NOT</span> the Imposter
              </p>
              <p className="text-purple-300 text-sm mt-2">
                The Imposter is still hiding among you!
              </p>
            </div>

            <div className="mb-6">
              <p className="text-purple-200 text-sm mb-3">Active Players ({getActivePlayers().length})</p>
              <div className="grid grid-cols-2 gap-2">
                {getActivePlayers().map((p) => (
                  <div key={p.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                      {p.name[0].toUpperCase()}
                    </div>
                    <span className="text-white text-sm">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {(game.eliminatedIds || []).length > 0 && (
              <div className="mb-6">
                <p className="text-purple-200 text-sm mb-3">Eliminated ({(game.eliminatedIds || []).length})</p>
                <div className="grid grid-cols-2 gap-2">
                  {game.players.filter(p => p.eliminated).map((p) => (
                    <div key={p.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 opacity-50">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-sm font-bold">
                        {p.name[0].toUpperCase()}
                      </div>
                      <span className="text-purple-300 text-sm line-through">{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center mb-6 p-4 bg-white/5 rounded-xl">
              <p className="text-purple-300 text-sm">
                Remaining: {getVillagerCount()} Villagers vs {getImpostorCount()} Imposter(s)
              </p>
            </div>

            <button
              onClick={continueGame}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 shadow-lg"
            >
              {loading ? 'Continuing...' : '🗳️ Next Voting Round'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Game Over Phase
  if (game.phase === 'gameover') {
    const impostors = game.players.filter(p => p.isImpost)

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">🕵️ Imposter</h1>
            <p className="text-purple-200">Game Over</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
            <div className="text-center mb-6">
              <div className="text-7xl mb-4">
                {game.winner === 'villagers' ? '🎉' : '😈'}
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {game.winner === 'villagers' ? 'Villagers Win!' : 'Imposter Wins!'}
              </h2>
              <p className="text-purple-200">
                {game.winner === 'villagers'
                  ? 'The Imposter has been caught!'
                  : 'The Imposter survived until the end!'}
              </p>
            </div>

            <div className="mb-6 p-4 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl border border-red-400/30">
              <p className="text-center text-purple-200 text-sm mb-2">The Imposter was</p>
              <div className="flex items-center justify-center gap-3">
                {impostors.map(p => (
                  <div key={p.id} className="flex items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
                      {p.name[0].toUpperCase()}
                    </div>
                    <span className="text-white font-bold text-xl">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6 p-6 bg-gradient-to-br from-amber-100 to-orange-200 rounded-xl">
              <p className="text-center text-amber-800 text-sm font-medium mb-3">The Secret Words Were</p>
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <p className="text-amber-700 text-xs mb-1">Villagers had</p>
                  <p className="text-3xl font-bold text-amber-900">{game.wordPair.normal}</p>
                </div>
                <div className="text-amber-600 text-2xl">vs</div>
                <div className="text-center">
                  <p className="text-red-600 text-xs mb-1">Imposter had</p>
                  <p className="text-3xl font-bold text-red-700">{game.wordPair.impost}</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-purple-200 text-sm mb-3">All Players</p>
              <div className="space-y-2">
                {game.players.map((p) => (
                  <div key={p.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${p.isImpost ? 'bg-red-500/20 border border-red-400/50' : p.eliminated ? 'bg-white/5 opacity-50' : 'bg-white/10'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${p.isImpost ? 'bg-gradient-to-br from-red-400 to-orange-500' : 'bg-gradient-to-br from-pink-400 to-purple-500'}`}>
                      {p.name[0].toUpperCase()}
                    </div>
                    <span className="text-white text-sm flex-1">{p.name}</span>
                    {p.isImpost && <span className="text-xs text-red-300">🎭 Imposter</span>}
                    {p.eliminated && <span className="text-xs text-purple-400">Eliminated</span>}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={resetGame}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 shadow-lg"
            >
              {loading ? 'Resetting...' : '🔄 Play Again'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default App
