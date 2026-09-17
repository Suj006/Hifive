const PARTICLES = [
  { left: "6%", size: 10, delay: "0s", duration: "16s", color: "var(--brand-pink-2)" },
  { left: "16%", size: 6, delay: "2.4s", duration: "13s", color: "var(--brand-gold)" },
  { left: "27%", size: 14, delay: "5s", duration: "19s", color: "var(--brand-teal)" },
  { left: "38%", size: 8, delay: "1.2s", duration: "15s", color: "var(--brand-purple-2)" },
  { left: "50%", size: 12, delay: "7s", duration: "17s", color: "var(--brand-pink-2)" },
  { left: "61%", size: 7, delay: "3.5s", duration: "14s", color: "var(--brand-gold)" },
  { left: "72%", size: 11, delay: "6.2s", duration: "18s", color: "var(--brand-teal)" },
  { left: "83%", size: 9, delay: "0.6s", duration: "16s", color: "var(--brand-purple-2)" },
  { left: "92%", size: 6, delay: "4.4s", duration: "13s", color: "var(--brand-pink-2)" },
  { left: "45%", size: 5, delay: "8.5s", duration: "20s", color: "var(--brand-gold)" },
];

export function FloatingParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="absolute bottom-0 rounded-full opacity-0"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            filter: "blur(0.5px)",
            boxShadow: `0 0 ${p.size}px ${p.color}`,
            animation: `drift-up ${p.duration} ease-in ${p.delay} infinite`,
          }}
        />
      ))}
    </div>
  );
}
