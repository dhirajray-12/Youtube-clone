const COLORS = ['#e53935', '#8e24aa', '#3949ab', '#039be5', '#00897b', '#7cb342', '#fb8c00', '#6d4c41'];

export default function Avatar({ name = '?', src, size = 36 }) {
  const style = { width: size, height: size, fontSize: size * 0.45 };
  if (src) return <img className="avatar" src={src} alt={name} style={style} />;
  const color = COLORS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % COLORS.length];
  return (
    <div className="avatar" style={{ ...style, background: color }} aria-label={name}>
      {name[0]?.toUpperCase()}
    </div>
  );
}
