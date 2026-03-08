import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState, type MouseEvent } from 'react'
import type { RevealItem } from '../App'

type Props = {
  item: RevealItem | null
  onClose: () => void
}

export default function Popup({ item, onClose }: Props) {
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    setImgError(false)
  }, [item?.id])

  return (
    <AnimatePresence>
      {item ? (
        <motion.div
          className="modalOverlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            onClick={(e: MouseEvent) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button className="modalClose" onClick={onClose} aria-label="Close">
              ✕
            </button>

            {item.type === 'quote' ? (
              <div className="quoteCard">
                <div className="quoteMark">“</div>
                <div className="quoteText">{item.text}</div>
                <div className="quoteMark quoteMarkEnd">”</div>
              </div>
            ) : (
              <div className="photoCard">
                {!imgError ? (
                  <img
                    className="photo"
                    src={item.src}
                    alt={item.caption ?? 'Photo'}
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="quoteCard">
                    <div className="quoteText">
                      Add Sara's photo at:
                      {'\n'}
                      <b>{item.src}</b>
                    </div>
                  </div>
                )}
                {item.caption ? <div className="caption">{item.caption}</div> : null}
              </div>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
