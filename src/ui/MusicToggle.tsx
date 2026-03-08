import { useEffect, useMemo, useRef, useState } from 'react'

type Props = {
  src: string
}

export default function MusicToggle({ src }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [enabled, setEnabled] = useState(false)
  const [ready, setReady] = useState(false)

  const label = useMemo(() => {
    return enabled ? 'Music: On' : 'Music: Off'
  }, [enabled])

  useEffect(() => {
    const audio = new Audio(src)
    audio.loop = true
    audio.volume = 0.6
    audioRef.current = audio

    const onCanPlay = () => setReady(true)
    audio.addEventListener('canplay', onCanPlay)

    return () => {
      audio.pause()
      audio.removeEventListener('canplay', onCanPlay)
      audioRef.current = null
    }
  }, [src])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (!enabled) {
      audio.pause()
      return
    }

    audio.play().catch(() => {
      setEnabled(false)
    })
  }, [enabled])

  return (
    <button
      className="musicBtn"
      onClick={() => setEnabled((v: boolean) => !v)}
      disabled={!ready}
      aria-label={label}
      title={!ready ? 'Add /public/music.mp3 to enable' : label}
    >
      {enabled ? '♪ On' : '♪ Off'}
    </button>
  )
}
