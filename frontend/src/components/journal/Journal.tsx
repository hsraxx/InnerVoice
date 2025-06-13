import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { config } from '../../config'

interface JournalEntry {
  id: string
  content: string
  date: string
  emotion?: {
    label: string
    confidence: number
    feedback?: boolean
  }
}

const STORAGE_KEY = 'innervoice-entries'

export function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [currentEntry, setCurrentEntry] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingEntries, setIsLoadingEntries] = useState(true)

  // Load entries from localStorage on component mount
  useEffect(() => {
    try {
      const storedEntries = localStorage.getItem(STORAGE_KEY)
      if (storedEntries) {
        setEntries(JSON.parse(storedEntries))
      }
    } catch (err) {
      console.error('Failed to load entries from localStorage:', err)
    } finally {
      setIsLoadingEntries(false)
    }
  }, [])

  // Save entries to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
    } catch (err) {
      console.error('Failed to save entries to localStorage:', err)
    }
  }, [entries])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentEntry.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`${config.apiUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: currentEntry }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze emotions')
      }

      const data = await response.json()
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        content: currentEntry,
        date: new Date().toISOString(),
        emotion: {
          label: data.label,
          confidence: data.confidence,
        },
      }

      setEntries([newEntry, ...entries])
      setCurrentEntry('')
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to analyze emotions')
    } finally {
      setLoading(false)
    }
  }

  const handleFeedback = (entryId: string, isAccurate: boolean) => {
    setEntries(entries.map(entry => 
      entry.id === entryId 
        ? { ...entry, emotion: entry.emotion ? { ...entry.emotion, feedback: isAccurate } : undefined }
        : entry
    ))
  }

  if (isLoadingEntries) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading your journal entries...</div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="journal-entry" className="text-sm font-medium">
            How are you feeling today?
          </label>
          <textarea
            id="journal-entry"
            value={currentEntry}
            onChange={(e) => setCurrentEntry(e.target.value)}
            className="w-full min-h-[200px] p-4 rounded-lg border bg-background"
            placeholder="Write your thoughts here..."
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Analyzing...' : 'Save Entry'}
        </button>
        {error && <div className="text-red-500 text-sm">{error}</div>}
      </form>

      <div className="mt-8 space-y-4">
        {entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No entries yet. Start by writing your first journal entry above.
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="p-4 rounded-lg border bg-card text-card-foreground"
            >
              <div className="flex justify-between items-start mb-2">
                <time className="text-sm text-muted-foreground">
                  {format(new Date(entry.date), 'MMMM d, yyyy h:mm a')}
                </time>
                {entry.emotion && (
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-xs rounded-full bg-secondary">
                      {entry.emotion.label} ({Math.round(entry.emotion.confidence * 100)}%)
                    </span>
                    {entry.emotion.feedback === undefined && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <span>Was this accurate?</span>
                        <button
                          onClick={() => handleFeedback(entry.id, true)}
                          className="p-1 hover:text-primary"
                          title="Yes, this is accurate"
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleFeedback(entry.id, false)}
                          className="p-1 hover:text-primary"
                          title="No, this is not accurate"
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    {entry.emotion.feedback !== undefined && (
                      <span className="text-xs text-muted-foreground">
                        {entry.emotion.feedback ? '✓ Accurate' : '✗ Inaccurate'}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <p className="whitespace-pre-wrap">{entry.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 