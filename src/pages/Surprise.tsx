import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import type { RevealItem } from '../App'
import BalloonField, { type BalloonData } from '../ui/BalloonField'
import Popup from '../ui/Popup'
import MusicToggle from '../ui/MusicToggle'

type Props = {
  items: RevealItem[]
  onComplete: () => void
}

export default function Surprise({ items, onComplete }: Props) {
  const [openItem, setOpenItem] = useState<RevealItem | null>(null)
  const [popped, setPopped] = useState<Set<string>>(() => new Set())
  const [showComplete, setShowComplete] = useState(false)
  const completeShownRef = useRef(false)

  const balloons = useMemo<BalloonData[]>(
    () =>
      items.map((it, idx) => ({
        id: it.id,
        index: idx,
        hue: (idx * 45 + 330) % 360,
        label: it.type === 'quote' ? '💬' : '📷',
      })),
    [items],
  )

  useEffect(() => {
    const allPopped = popped.size === items.length
    if (!allPopped) return
    if (completeShownRef.current) return

    completeShownRef.current = true
    setShowComplete(true)
  }, [items.length, onComplete, popped])

  useEffect(() => {
    if (!showComplete) return
    gsap.fromTo(
      '.completeToast',
      { opacity: 0, y: 10, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'power3.out' },
    )
  }, [showComplete])

  const handlePop = (id: string) => {
    const item = items.find((x) => x.id === id)
    if (!item) return
    setPopped((prev) => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
    setOpenItem(item)
  }

  return (
    <div className="surprise">
      <div className="topBar">
        <div className="instruction">Pop the balloons to reveal messages</div>
        <MusicToggle src="/music.mp3" />
      </div>

      <BalloonField balloons={balloons} popped={popped} onPop={handlePop} />

      <Popup item={openItem} onClose={() => setOpenItem(null)} />

      {showComplete ? (
        <div className="completeCta">
          <div className="completeToast">All balloons popped ✨</div>
          <button className="primaryBtn" onClick={onComplete}>
            Secret Message 💌
          </button>
        </div>
      ) : (
        <div className="progressPill">
          {popped.size}/{items.length} popped
        </div>
      )}
    </div>
  )
}
