import { useEffect, useMemo, useRef } from 'react'
import gsap from 'gsap'

// Register GSAP plugins if needed (not strictly required for basic to/from)
// but helpful for ensuring GSAP is initialized in the bundle
gsap.config({
  nullTargetWarn: false,
});

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

      // If rect is 0 (not rendered yet), skip this frame
      if (r.width === 0 || r.height === 0) {
        rafRef.current = window.requestAnimationFrame(step)
        return
      }

      runtimeRef.current.forEach((rt: Runtime) => {
        if (!rt.el) {
          return
        }
        if (rt.popped) return

        rt.x += rt.vx
        rt.y += rt.vy

        const wave = Math.sin(now / 900 + rt.drift * 10) * 0.7
        rt.x += wave

        // Buffer for wrap-around
        const buffer = 100

        if (rt.y < -buffer) {
          rt.y = r.height + buffer
        }
        if (rt.x < -buffer) rt.x = r.width + buffer
        if (rt.x > r.width + buffer) rt.x = -buffer

        if (rt.el) {
          rt.el.style.transform = `translate3d(${rt.x}px, ${rt.y}px, 0)`
          // Force visibility in case GSAP/CSS didn't catch it
          rt.el.style.opacity = '1'
          rt.el.style.display = 'block'
        }
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

    // Find the balloon data
    const balloon = balloons.find(b => b.id === id);
    const isLastBalloon = balloon?.index === balloons.length - 1;
    const othersPopped = popped.size === balloons.length - 1;

    // Prevent popping the last balloon until all others are popped
    if (isLastBalloon && !othersPopped) {
      gsap.to(rt.el, {
        x: '+=10',
        duration: 0.05,
        repeat: 3,
        yoyo: true,
        ease: 'power1.inOut'
      });
      return;
    }

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
        const isLast = b.index === balloons.length - 1;
        const size = 74 + (b.index % 4) * 10
        const glow = `hsla(${b.hue}, 95%, 65%, 0.45)`
        const fill = isLast 
          ? `linear-gradient(180deg, #ff4fa3, #ff007a)` 
          : `linear-gradient(180deg, hsla(${b.hue}, 98%, 74%, 1), hsla(${b.hue}, 92%, 52%, 1))`

        return (
          <button
            key={b.id}
            className={`balloon ${isLast ? 'lastBalloon' : ''}`}
            aria-label={isPopped ? 'Popped balloon' : (isLast ? 'Special balloon' : 'Balloon')}
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
              <div className="balloonLabel">{isLast ? '❤️' : b.label}</div>
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
