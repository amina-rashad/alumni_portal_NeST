import React from 'react';
import { motion } from 'framer-motion';

const CorporateBackground: React.FC = () => {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      backgroundColor: '#020307',
      overflow: 'hidden',
      zIndex: 0
    }}>
      {/* 1. Main Ambient Glow (Soft Vortex on the Right) */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.45, 0.3],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          position: 'absolute',
          top: '10%',
          right: '-10%',
          width: '80%',
          height: '80%',
          background: 'radial-gradient(circle at center, rgba(0, 119, 255, 0.25) 0%, rgba(30, 79, 160, 0.2) 40%, transparent 70%)',
          filter: 'blur(100px)',
          borderRadius: '50%',
        }}
      />

      {/* 2. Secondary Purple/Deep Blue Accent */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
          x: [0, 50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          position: 'absolute',
          bottom: '-20%',
          left: '10%',
          width: '60%',
          height: '60%',
          background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.2) 0%, transparent 60%)',
          filter: 'blur(120px)',
        }}
      />

      {/* 3. Radial Energy Waves (Expanding Rings) */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`wave-${i}`}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{
            scale: [0.5, 2],
            opacity: [0, 0.2, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: i * 2.5,
            ease: "easeOut"
          }}
          style={{
            position: 'absolute',
            top: '50%',
            right: '10%',
            transform: 'translate(50%, -50%)',
            width: '600px',
            height: '600px',
            border: '1px solid rgba(30, 79, 160, 0.3)',
            borderRadius: '50%',
            zIndex: 1
          }}
        />
      ))}

      {/* 4. Flowing Radial Lines / Light Streaks */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`streak-${i}`}
            animate={{
              rotate: [i * 30, i * 30 + 10],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 10 + Math.random() * 5,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              position: 'absolute',
              top: '50%',
              right: '10%',
              width: '1000px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(30, 79, 160, 0.15), transparent)',
              transformOrigin: 'left center',
              filter: 'blur(2px)',
            }}
          />
        ))}
      </div>

      {/* 5. Moving Particle Twinkle */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 50 - 25, 0],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: 5 + Math.random() * 10,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
          style={{
            position: 'absolute',
            top: Math.random() * 100 + '%',
            left: Math.random() * 100 + '%',
            width: '2px',
            height: '2px',
            backgroundColor: '#1E4FA0',
            borderRadius: '50%',
            boxShadow: '0 0 10px #1E4FA0',
          }}
        />
      ))}

      {/* 6. Cinematic Tech Grid overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), 
                          linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)`,
        backgroundSize: '100px 100px',
        maskImage: 'radial-gradient(circle at 80% 50%, black 20%, transparent 90%)',
        WebkitMaskImage: 'radial-gradient(circle at 80% 50%, black 20%, transparent 90%)',
        opacity: 0.5
      }} />

      {/* 7. Final Atmospheric Layer (Vignette) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 80% 50%, transparent 0%, rgba(2, 3, 7, 0.9) 100%)',
      }} />
    </div>
  );
};

export default CorporateBackground;
