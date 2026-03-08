type Props = {
  onStart: () => void
}

export default function Landing({ onStart }: Props) {
  const photos = [
    '/images/sara1.jpg',
    '/images/sara2.jpg',
    '/images/sara3.jpg',
    '/images/sara4.jpg',
    '/images/sara5.jpg',
    '/images/sara6.jpg',
    '/images/sara7.jpg',
    '/images/sara8.jpg',
    '/images/sara9.jpg',
  ]

  return (
    <div className="panel landingPanel">
      <div className="titleStack">
        <div className="kicker">Happy Women's Day</div>
        <h1 className="title">Sara</h1>
        <div className="subtitle">To the most special girl in my life</div>
      </div>

      <div className="carouselWrap" aria-label="Memories">
        <div className="carousel" aria-hidden="true">
          {photos.map((src, i) => (
            <span key={src} className="carouselItem" style={{ ['--i' as never]: i + 1 }}>
              <img className="carouselImg" src={src} alt={`Sara ${i + 1}`} loading="lazy" />
            </span>
          ))}
        </div>
      </div>

      <div className="landingActions">
        <button className="primaryBtn" onClick={onStart}>
          Start the Surprise ✨
        </button>

        <div className="hint">Tap to begin</div>
      </div>
    </div>
  )
}
