import React, { useEffect, useState } from 'react';

function Confetti({ theme = 'kitty', onComplete }) {
  const [confettiPieces, setConfettiPieces] = useState([]);

  useEffect(() => {
    // Générer les confettis
    const pieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 1,
      emoji: getRandomEmoji(),
    }));
    setConfettiPieces(pieces);

    // Nettoyer après l'animation
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 3500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const getRandomEmoji = () => {
    if (theme === 'kitty') {
      const emojis = ['🎀', '💖', '🌸', '✨', '🦄', '🧁', '🍓', '💕', '🌺', '🎂', '🍰', '💝'];
      return emojis[Math.floor(Math.random() * emojis.length)];
    }
    // Pour les autres thèmes
    const emojis = ['🎉', '🎊', '⭐', '✨', '🌟', '💫', '🎈'];
    return emojis[Math.floor(Math.random() * emojis.length)];
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {confettiPieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute text-2xl animate-confetti-fall"
          style={{
            left: `${piece.left}%`,
            top: '-10%',
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
          }}
        >
          {piece.emoji}
        </div>
      ))}
    </div>
  );
}

export default Confetti;
