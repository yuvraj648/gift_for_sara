import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import Landing from './pages/Landing'
import Surprise from './pages/Surprise'
import Ending from './pages/Ending'

export type RevealItem =
  | { id: string; type: 'quote'; text: string }
  | { id: string; type: 'photo'; src: string; caption?: string }

type Screen = 'landing' | 'surprise' | 'ending'

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing')

  const items = useMemo<RevealItem[]>(
    () => [
      {
        id: 'q1',
        type: 'quote',
        text: "Sara, your smile has the power to turn my worst days into the most beautiful ones.",
      },
      {
        id: 'q2',
        type: 'quote',
        text: 'Strong women change the world, and you have already changed mine.',
      },
      {
        id: 'q3',
        type: 'quote',
        text: 'Every moment with you feels like a memory I want to keep forever.',
      },
      {
        id: 'q4',
        type: 'quote',
        text: 'Your kindness, strength, and beauty make you truly one of a kind.',
      },
      {
        id: 'q5',
        type: 'quote',
        text: 'The world celebrates women today, but I celebrate you every single day.',
      },
      {
        id: 'q6',
        type: 'quote',
        text: 'You are not just special today, Sara… you are special in every moment of my life.',
      },
      {
        id: 'q7',
        type: 'quote',
        text: 'If happiness had a face, it would look exactly like your smile.',
      },
      {
        id: 'q8',
        type: 'quote',
        text: 'No matter where life takes us, you will always be someone incredibly important to me.',
      },
      {
        id: 'q9',
        type: 'quote',
        text: 'I love you Sara ❤️',
      },
    ],
    [],
  )

  return (
    <div className="appRoot">
      <div className="bgGlow" />
      <div className="hearts" aria-hidden="true" />

      <AnimatePresence mode="wait">
        {screen === 'landing' ? (
          <motion.div
            key="landing"
            className="screen"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
          >
            <Landing onStart={() => setScreen('surprise')} />
          </motion.div>
        ) : screen === 'surprise' ? (
          <motion.div
            key="surprise"
            className="screen"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35 }}
          >
            <Surprise items={items} onComplete={() => setScreen('ending')} />
          </motion.div>
        ) : (
          <motion.div
            key="ending"
            className="screen"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Ending onReplay={() => setScreen('landing')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
