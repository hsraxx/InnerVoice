import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Journal } from './Journal'
import '@testing-library/jest-dom'

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

// Mock fetch
global.fetch = jest.fn()

describe('Journal Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  it('renders empty state correctly', () => {
    render(<Journal />)
    expect(screen.getByText('Start your journaling journey')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('How are you feeling today?')).toBeInTheDocument()
  })

  it('loads saved entries from localStorage', () => {
    const mockEntries = [
      {
        id: '1',
        content: 'Test entry',
        date: new Date().toISOString(),
        emotion: { label: 'happy', confidence: 0.9 }
      }
    ]
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockEntries))
    
    render(<Journal />)
    expect(screen.getByText('Test entry')).toBeInTheDocument()
  })

  it('submits new entry and shows emotion analysis', async () => {
    const mockEmotionResponse = {
      label: 'happy',
      confidence: 0.9
    }
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockEmotionResponse)
    })

    render(<Journal />)
    
    const textarea = screen.getByPlaceholderText('How are you feeling today?')
    const submitButton = screen.getByRole('button', { name: /save/i })

    fireEvent.change(textarea, { target: { value: 'I am feeling great today!' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('I am feeling great today!')).toBeInTheDocument()
      expect(screen.getByText('Happy')).toBeInTheDocument()
      expect(screen.getByText('90%')).toBeInTheDocument()
    })
  })

  it('handles emotion analysis error gracefully', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'))

    render(<Journal />)
    
    const textarea = screen.getByPlaceholderText('How are you feeling today?')
    const submitButton = screen.getByRole('button', { name: /save/i })

    fireEvent.change(textarea, { target: { value: 'Test entry' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Failed to analyze emotions')).toBeInTheDocument()
    })
  })

  it('allows providing feedback on emotion analysis', async () => {
    const mockEmotionResponse = {
      label: 'happy',
      confidence: 0.9
    }
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockEmotionResponse)
    })

    render(<Journal />)
    
    const textarea = screen.getByPlaceholderText('How are you feeling today?')
    const submitButton = screen.getByRole('button', { name: /save/i })

    fireEvent.change(textarea, { target: { value: 'Test entry' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      const thumbsUpButton = screen.getByRole('button', { name: /accurate/i })
      fireEvent.click(thumbsUpButton)
      expect(screen.getByText('✓')).toBeInTheDocument()
    })
  })
}) 