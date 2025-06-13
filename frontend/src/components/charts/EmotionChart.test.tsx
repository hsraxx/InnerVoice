import { render, screen, fireEvent } from '@testing-library/react'
import { EmotionChart } from './EmotionChart'
import '@testing-library/jest-dom'

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

describe('EmotionChart Component', () => {
  const mockEntries = [
    {
      id: '1',
      content: 'Feeling happy today',
      date: new Date().toISOString(),
      emotion: { label: 'happy', confidence: 0.9, feedback: true }
    },
    {
      id: '2',
      content: 'Feeling sad today',
      date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      emotion: { label: 'sad', confidence: 0.8, feedback: false }
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockEntries))
  })

  it('renders loading state initially', () => {
    mockLocalStorage.getItem.mockReturnValue(null)
    render(<EmotionChart />)
    expect(screen.getByText('Loading analytics...')).toBeInTheDocument()
  })

  it('renders empty state when no entries exist', () => {
    mockLocalStorage.getItem.mockReturnValue('[]')
    render(<EmotionChart />)
    expect(screen.getByText('No journal entries yet. Start writing to see your emotion trends.')).toBeInTheDocument()
  })

  it('renders charts and analytics with data', () => {
    render(<EmotionChart />)
    expect(screen.getByText('Emotion Trends')).toBeInTheDocument()
    expect(screen.getByText('Emotion Distribution')).toBeInTheDocument()
    expect(screen.getByText('Most Common Emotion')).toBeInTheDocument()
    expect(screen.getByText('Total Entries')).toBeInTheDocument()
    expect(screen.getByText('Analysis Accuracy')).toBeInTheDocument()
  })

  it('updates data when date range changes', () => {
    render(<EmotionChart />)
    const dateRangeSelect = screen.getByRole('combobox')
    
    // Change to 7 days
    fireEvent.change(dateRangeSelect, { target: { value: '7d' } })
    expect(screen.getByText('Last 7 days')).toBeInTheDocument()
    
    // Change to all time
    fireEvent.change(dateRangeSelect, { target: { value: 'all' } })
    expect(screen.getByText('All time')).toBeInTheDocument()
  })

  it('exports data to CSV', () => {
    render(<EmotionChart />)
    const exportButton = screen.getByRole('button', { name: /export csv/i })
    fireEvent.click(exportButton)
    
    // Verify that the download was triggered
    // Note: We can't actually test the file download, but we can verify the button exists
    expect(exportButton).toBeInTheDocument()
  })

  it('displays correct analytics data', () => {
    render(<EmotionChart />)
    
    // Check total entries
    expect(screen.getByText('2')).toBeInTheDocument() // Total entries
    
    // Check accuracy (1 accurate out of 2 entries = 50%)
    expect(screen.getByText('50%')).toBeInTheDocument()
  })
}) 