import { useEffect, useMemo, useRef } from 'react'
import gsap from 'gsap'

export type BalloonData = {
  id: string
  index: number
  hue: number
  label: string
}

type Props = {
  balloons: BalloonData[]
  popped: Set<string>
  onPop: (id: string) => void
}

type Runtime = {
  x: number
  y: number
  vx: number
  vy: number
  drift: number
  el: HTMLButtonElement | null
  popped: boolean
}

export default function BalloonField({ balloons, popped, onPop }: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const runtimeRef = useRef<Map<string, Runtime>>(new Map())

  const seeded = useMemo(() => {
    return balloons.map((b) => {
      const s = 0.19 + (b.index % 7) * 0.01
      return { ...b, seed: (b.index + 1) * 9973, s }
    })
  }, [balloons])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const rect = () => root.getBoundingClientRect()

    for (const b of seeded) {
      const existing = runtimeRef.current.get(b.id)
      if (existing) continue

      const r = rect()
      const rx = ((b.seed % 97) / 97) * r.width
      const ry = ((b.seed % 53) / 53) * r.height

      runtimeRef.current.set(b.id, {
        x: rx,
        y: ry,
        vx: (0.2 + ((b.seed % 13) / 13) * 0.6) * (b.index % 2 === 0 ? 1 : -1),
        vy: -0.55 - ((b.seed % 17) / 17) * 0.8,
        drift: (b.seed % 19) / 19,
        el: null,
        popped: false,
      })
    }

    const step = () => {
      const r = rect()
      const now = performance.now()

      runtimeRef.current.forEach((rt: Runtime) => {
        if (!rt.el) return
        if (rt.popped) return

        rt.x += rt.vx
        rt.y += rt.vy

        const wave = Math.sin(now / 900 + rt.drift * 10) * 0.7
        rt.x += wave

        if (rt.y < -120) {
          rt.y = r.height + 120
        }
        if (rt.x < -80) rt.x = r.width + 80
        if (rt.x > r.width + 80) rt.x = -80

        rt.el.style.transform = `translate3d(${rt.x}px, ${rt.y}px, 0)`
      })

      rafRef.current = window.requestAnimationFrame(step)
    }

    rafRef.current = window.requestAnimationFrame(step)

    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [seeded])

  useEffect(() => {
    popped.forEach((id) => {
      const rt = runtimeRef.current.get(id)
      if (!rt) return
      rt.popped = true
    })
  }, [popped])

  const pop = (id: string) => {
    const rt = runtimeRef.current.get(id)
    if (!rt || rt.popped || !rt.el) return

    rt.popped = true
    const el = rt.el

    const burst = el.querySelector<HTMLDivElement>('.confetti')
    if (burst) burst.dataset.active = '1'

    gsap.to(el, {
      scale: 0.05,
      opacity: 0,
      duration: 0.28,
      ease: 'back.in(2.2)',
      onComplete: () => {
        onPop(id)
      },
    })
  }

  return (
    <div ref={rootRef} className="balloonField" role="application" aria-label="Balloons">
      {seeded.map((b: (BalloonData & { seed: number; s: number })) => {
        const isPopped = popped.has(b.id)
        const size = 74 + (b.index % 4) * 10
        const glow = `hsla(${b.hue}, 95%, 65%, 0.45)`
        const fill = `linear-gradient(180deg, hsla(${b.hue}, 98%, 74%, 1), hsla(${b.hue}, 92%, 52%, 1))`

        return (
          <button
            key={b.id}
            className="balloon"
            aria-label={isPopped ? 'Popped balloon' : 'Balloon'}
            disabled={isPopped}
            ref={(node: HTMLButtonElement | null) => {
              const rt = runtimeRef.current.get(b.id)
              if (!rt) return
              rt.el = node
              if (node && isPopped) {
                rt.popped = true
                node.style.opacity = '0'
                node.style.transform = 'translate3d(-9999px, -9999px, 0)'
              }
            }}
            onClick={() => pop(b.id)}
            style={{
              width: `${size}px`,
              height: `${size * 1.18}px`,
              ['--balloon-fill' as never]: fill,
              ['--balloon-glow' as never]: glow,
              ['--balloon-hue' as never]: b.hue,
            }}
          >
            <div className="balloonBody">
              <div className="balloonShine" />
              <div className="balloonLabel">{b.label}</div>
            </div>
            <div className="balloonKnot" />
            <div className="balloonString" />
            <div className="confetti" aria-hidden="true">
              {Array.from({ length: 14 }).map((_, i) => {
                const angle = (i / 14) * Math.PI * 2
                const dx = Math.cos(angle) * (26 + (i % 4) * 8)
                const dy = Math.sin(angle) * (26 + (i % 3) * 10)
                const hue = (b.hue + i * 12) % 360
                return (
                  <span
                    key={i}
                    className="confettiPiece"
                    style={{
                      ['--dx' as never]: `${dx}px`,
                      ['--dy' as never]: `${dy}px`,
                      ['--c' as never]: `hsla(${hue}, 95%, 65%, 1)`,
                    }}
                  />
                )
              })}
            </div>
          </button>
        )
      })}

      <div className="balloonBounds" aria-hidden="true" />
    </div>
  )
}
