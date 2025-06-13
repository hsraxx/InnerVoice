import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Download, Calendar } from 'lucide-react'
import { format, subDays, isWithinInterval } from 'date-fns'

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
const COLORS = {
  happy: '#22c55e',
  sad: '#3b82f6',
  angry: '#ef4444',
  anxious: '#f59e0b',
  calm: '#8b5cf6',
  neutral: '#6b7280',
}

type DateRange = '7d' | '30d' | '90d' | 'all'

export function EmotionChart() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange>('30d')

  useEffect(() => {
    try {
      const storedEntries = localStorage.getItem(STORAGE_KEY)
      if (storedEntries) {
        setEntries(JSON.parse(storedEntries))
      }
    } catch (err) {
      console.error('Failed to load entries:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const filterEntriesByDateRange = (entries: JournalEntry[]) => {
    if (dateRange === 'all') return entries

    const now = new Date()
    const startDate = subDays(now, {
      '7d': 7,
      '30d': 30,
      '90d': 90,
    }[dateRange])

    return entries.filter(entry =>
      isWithinInterval(new Date(entry.date), {
        start: startDate,
        end: now,
      })
    )
  }

  const exportToCSV = () => {
    const filteredEntries = filterEntriesByDateRange(entries)
    const headers = ['Date', 'Content', 'Emotion', 'Confidence', 'Feedback']
    const csvContent = [
      headers.join(','),
      ...filteredEntries.map(entry => [
        format(new Date(entry.date), 'yyyy-MM-dd HH:mm:ss'),
        `"${entry.content.replace(/"/g, '""')}"`,
        entry.emotion?.label || 'N/A',
        entry.emotion?.confidence ? (entry.emotion.confidence * 100).toFixed(1) + '%' : 'N/A',
        entry.emotion?.feedback === undefined ? 'N/A' : entry.emotion.feedback ? 'Accurate' : 'Inaccurate',
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `innervoice-export-${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Process entries for the line chart
  const processLineChartData = () => {
    const filteredEntries = filterEntriesByDateRange(entries)
    const entriesWithEmotions = filteredEntries.filter(entry => entry.emotion)
    const groupedByDate = entriesWithEmotions.reduce((acc, entry) => {
      const date = new Date(entry.date).toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = {
          date,
          happy: 0,
          sad: 0,
          angry: 0,
          anxious: 0,
          calm: 0,
          neutral: 0,
          count: 0,
        }
      }
      if (entry.emotion) {
        acc[date][entry.emotion.label] += entry.emotion.confidence
        acc[date].count++
      }
      return acc
    }, {} as Record<string, any>)

    return Object.values(groupedByDate)
      .map(day => ({
        ...day,
        happy: day.happy / day.count,
        sad: day.sad / day.count,
        angry: day.angry / day.count,
        anxious: day.anxious / day.count,
        calm: day.calm / day.count,
        neutral: day.neutral / day.count,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  // Process entries for the pie chart
  const processPieChartData = () => {
    const filteredEntries = filterEntriesByDateRange(entries)
    const emotionCounts = filteredEntries.reduce((acc, entry) => {
      if (entry.emotion) {
        acc[entry.emotion.label] = (acc[entry.emotion.label] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    return Object.entries(emotionCounts).map(([label, value]) => ({
      name: label,
      value,
    }))
  }

  // Calculate analytics
  const calculateAnalytics = () => {
    const filteredEntries = filterEntriesByDateRange(entries)
    const entriesWithEmotions = filteredEntries.filter(entry => entry.emotion)
    const totalEntries = entriesWithEmotions.length

    if (totalEntries === 0) return null

    const emotionCounts = entriesWithEmotions.reduce((acc, entry) => {
      if (entry.emotion) {
        acc[entry.emotion.label] = (acc[entry.emotion.label] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const mostCommonEmotion = Object.entries(emotionCounts)
      .sort(([, a], [, b]) => b - a)[0]

    const feedbackCounts = entriesWithEmotions.reduce(
      (acc, entry) => {
        if (entry.emotion?.feedback !== undefined) {
          acc[entry.emotion.feedback ? 'accurate' : 'inaccurate']++
        }
        return acc
      },
      { accurate: 0, inaccurate: 0 }
    )

    const accuracyRate =
      feedbackCounts.accurate + feedbackCounts.inaccurate > 0
        ? (feedbackCounts.accurate / (feedbackCounts.accurate + feedbackCounts.inaccurate)) * 100
        : 0

    return {
      mostCommonEmotion,
      totalEntries,
      accuracyRate,
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    )
  }

  const lineChartData = processLineChartData()
  const pieChartData = processPieChartData()
  const analytics = calculateAnalytics()

  if (!analytics || analytics.totalEntries === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No journal entries yet. Start writing to see your emotion trends.
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Emotion Trends</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
              className="bg-background border rounded-md px-2 py-1 text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={lineChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => new Date(date).toLocaleDateString()}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(date) => new Date(date).toLocaleDateString()}
              formatter={(value: number) => [`${Math.round(value * 100)}%`, '']}
            />
            {Object.entries(COLORS).map(([emotion, color]) => (
              <Line
                key={emotion}
                type="monotone"
                dataKey={emotion}
                stroke={color}
                name={emotion.charAt(0).toUpperCase() + emotion.slice(1)}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Emotion Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {pieChartData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={COLORS[entry.name as keyof typeof COLORS]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-medium mb-2">Most Common Emotion</h3>
            <p className="text-2xl font-bold text-primary">
              {analytics.mostCommonEmotion[0].charAt(0).toUpperCase() +
                analytics.mostCommonEmotion[0].slice(1)}
            </p>
            <p className="text-sm text-muted-foreground">
              {Math.round((analytics.mostCommonEmotion[1] / analytics.totalEntries) * 100)}% of entries
            </p>
          </div>

          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-medium mb-2">Total Entries</h3>
            <p className="text-2xl font-bold text-primary">{analytics.totalEntries}</p>
            <p className="text-sm text-muted-foreground">Journal entries analyzed</p>
          </div>

          <div className="p-4 rounded-lg border bg-card">
            <h3 className="font-medium mb-2">Analysis Accuracy</h3>
            <p className="text-2xl font-bold text-primary">
              {Math.round(analytics.accuracyRate)}%
            </p>
            <p className="text-sm text-muted-foreground">
              Based on user feedback
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 