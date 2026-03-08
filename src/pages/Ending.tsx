type Props = {
  onReplay: () => void
}

export default function Ending({ onReplay }: Props) {
  return (
    <div className="panel">
      <div className="endingCard">
        <div className="endingName">Sara ❤️</div>
        <div className="endingText">
          <div>On this International Women’s Day,</div>
          <div>I just want you to know something very special.</div>
          <div className="spacer" />
          <div>You are strong.</div>
          <div>You are inspiring.</div>
          <div>You are beautiful in ways words cannot describe.</div>
          <div className="spacer" />
          <div>But most importantly…</div>
          <div>You are someone who made my world brighter just by being in it.</div>
          <div className="spacer" />
          <div className="endingWish">Happy Women's Day.</div>
          <div className="spacer" />
          <div className="sign">– Yuvraj</div>
        </div>
      </div>

      <details className="lastThing">
        <summary className="secondaryBtn">One Last Thing…</summary>
        <div className="lastThingText">And Sara… if I had to choose again, I would still choose you.</div>
      </details>

      <button className="secondaryBtn" onClick={onReplay}>
        Replay Surprise
      </button>
    </div>
  )
}
