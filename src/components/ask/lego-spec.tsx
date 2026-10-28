const SPEC_BRICKS = ["#f2cd37", "#c91a09", "#0055bf", "#00852b"];

export function LegoSpec() {
  return (
    <aside className="lego-spec" aria-label="Build sheet">
      <div className="lego-spec__top">
        <p className="lego-kicker">Build sheet</p>
        <span className="lego-spec__set">SET 003</span>
      </div>

      <dl className="lego-spec__list">
        <div>
          <dt>Subject</dt>
          <dd>Ibtasaam Amjad</dd>
        </div>
        <div>
          <dt>Guide</dt>
          <dd>Brick</dd>
        </div>
        <div>
          <dt>Source</dt>
          <dd>Public knowledge</dd>
        </div>
        <div>
          <dt>Mode</dt>
          <dd>Ask anything</dd>
        </div>
      </dl>

      <div className="lego-spec__bricks" aria-hidden>
        {SPEC_BRICKS.map((color, index) => (
          <span
            key={color}
            className="lego-spec__brick"
            style={{
              background: color,
              animationDelay: `${index * 80}ms`,
            }}
          />
        ))}
      </div>

      <p className="lego-spec__note">Built from Ibtasaam&apos;s public profile.</p>
    </aside>
  );
}
