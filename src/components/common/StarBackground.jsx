import React from 'react';

export default function StarBackground() {
  // Generate random star positions
  const stars = React.useMemo(() => {
    return Array.from({ length: 80 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.6 + 0.3,
      delay: Math.random() * 60
    }));
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <style>{`
        @keyframes starDrift {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(100vw, 100vh);
          }
        }
      `}</style>
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            animation: `starDrift 120s linear ${star.delay}s infinite`
          }}
        />
      ))}
    </div>
  );
}