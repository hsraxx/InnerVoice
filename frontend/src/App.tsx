import { useState } from 'react'
import { ThemeProvider } from './components/theme-provider'
import { Journal } from './components/journal/Journal'
import { EmotionChart } from './components/charts/EmotionChart'
import { ThemeToggle } from './components/ui/theme-toggle'

function App() {
  const [activeTab, setActiveTab] = useState<'journal' | 'analytics'>('journal')

  return (
    <ThemeProvider defaultTheme="light" storageKey="innervoice-theme">
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container flex h-16 items-center justify-between px-4">
            <h1 className="text-2xl font-bold">InnerVoice</h1>
            <div className="flex items-center gap-4">
              <nav className="flex items-center gap-4">
                <button
                  onClick={() => setActiveTab('journal')}
                  className={`px-3 py-2 rounded-md ${
                    activeTab === 'journal'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  Journal
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`px-3 py-2 rounded-md ${
                    activeTab === 'analytics'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  Analytics
                </button>
              </nav>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {activeTab === 'journal' ? <Journal /> : <EmotionChart />}
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App
