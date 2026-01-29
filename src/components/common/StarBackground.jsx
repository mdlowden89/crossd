import React from 'react';

export default function StarBackground() {
  // Generate star clusters - 6 stars per cluster in a line
  const starClusters = React.useMemo(() => {
    const clusters = [];
    const numClusters = 30;
    
    for (let i = 0; i < numClusters; i++) {
      const clusterStartX = Math.random() * 120;
      const clusterStartY = Math.random() * 120;
      const delay = Math.random() * 40;
      
      // Create 6 stars in a horizontal line for this cluster
      for (let j = 0; j < 6; j++) {
        clusters.push({
          id: `${i}-${j}`,
          left: `${clusterStartX + (j * 3)}%`,
          top: `${clusterStartY}%`,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.6 + 0.3,
          delay: delay + (j * 0.2)
        });
      }
    }
    
    return clusters;
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
            animation: `starDrift 40s linear ${star.delay}s infinite`
          }}
        />
      ))}
    </div>
  );
}