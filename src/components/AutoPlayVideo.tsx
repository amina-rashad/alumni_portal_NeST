import React, { useRef, useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface AutoPlayVideoProps {
  src: string;
  className?: string;
  style?: React.CSSProperties;
  controls?: boolean;
  loop?: boolean;
  autoPlay?: boolean;
  showSoundToggle?: boolean;
  maxHeight?: string;
}

const AutoPlayVideo: React.FC<AutoPlayVideoProps> = ({
  src,
  className = '',
  style = {},
  controls = true,
  loop = true,
  autoPlay = true,
  showSoundToggle = true,
  maxHeight = '450px'
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Browser autoplay policy requires the media element to start muted
    video.defaultMuted = true;
    video.muted = true;
    setIsMuted(true);

    if (autoPlay) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          // Autoplay was prevented or delayed
          console.debug('[AutoPlayVideo] autoplay prevented:', err);
        });
      }
    }

    // Use IntersectionObserver so the video plays automatically whenever it is scrolled into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (video.paused && autoPlay) {
              video.play().catch(() => {});
            }
          } else {
            if (!video.paused) {
              video.pause();
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, [src, autoPlay]);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const video = videoRef.current;
    if (!video) return;

    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);

    // If unmuting while video is paused, start playback
    if (!nextMuted && video.paused) {
      video.play().catch(() => {});
    }
  };

  const handleVolumeChange = () => {
    if (videoRef.current) {
      setIsMuted(videoRef.current.muted || videoRef.current.volume === 0);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: '#000000',
        borderRadius: style.borderRadius || '14px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: style.boxShadow || '0 8px 24px rgba(0,0,0,0.12)',
        ...style
      }}
      className={className}
    >
      <video
        ref={videoRef}
        src={src}
        controls={controls}
        loop={loop}
        autoPlay={autoPlay}
        muted
        playsInline
        onVolumeChange={handleVolumeChange}
        style={{
          width: '100%',
          maxHeight,
          outline: 'none',
          display: 'block',
          objectFit: 'contain'
        }}
      />

      {/* Floating Sound Toggle Icon & Pill */}
      {showSoundToggle && (
        <button
          type="button"
          onClick={toggleSound}
          title={isMuted ? 'Click to unmute' : 'Click to mute'}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '100px',
            backgroundColor: isMuted ? 'rgba(15, 23, 42, 0.8)' : 'rgba(200, 16, 46, 0.9)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 700,
            transition: 'all 0.2s ease',
            userSelect: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {isMuted ? (
            <>
              <VolumeX size={15} />
              <span>Unmute</span>
            </>
          ) : (
            <>
              <Volume2 size={15} />
              <span>Mute</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default AutoPlayVideo;
