import React, { useState, useEffect } from 'react';
import { Download, CheckCircle2, Loader2 } from 'lucide-react';

interface CertificateProgressButtonProps {
  onGenerate: () => void;
  label?: string;
  className?: string;
}

const CertificateProgressButton: React.FC<CertificateProgressButtonProps> = ({ 
  onGenerate, 
  label = "Download Certificate",
  className = "" 
}) => {
  const [status, setStatus] = useState<'idle' | 'downloading' | 'completed'>('idle');
  const [progress, setProgress] = useState(0);

  const handleDownload = async () => {
    if (status !== 'idle') return;

    setStatus('downloading');
    setProgress(0);

    // Simulate progress that matches a realistic generation/download time
    // We use a non-linear progress for a more "premium" feel
    const duration = 1800; // 1.8 seconds
    const interval = 30;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const newProgress = Math.min(Math.round((currentStep / steps) * 100), 98);
      setProgress(newProgress);

      if (currentStep >= steps) {
        clearInterval(timer);
        completeDownload();
      }
    }, interval);
  };

  const completeDownload = () => {
    setProgress(100);
    setStatus('completed');
    
    // Trigger the actual PDF generation
    onGenerate();

    // Reset back to idle after a delay
    setTimeout(() => {
      setStatus('idle');
      setProgress(0);
    }, 3000);
  };

  return (
    <button
      onClick={handleDownload}
      className={`progress-button ${status} ${className}`}
      disabled={status === 'downloading'}
    >
      {/* Progress Fill Layer */}
      <div 
        className="progress-fill" 
        style={{ width: `${progress}%` }}
      />

      {/* Content Layer */}
      <span className="button-text">
        {status === 'idle' && (
          <>
            <Download size={18} />
            {label}
          </>
        )}
        
        {status === 'downloading' && (
          <>
            <Loader2 size={18} className="animate-spin" />
            Downloading... {progress}%
          </>
        )}
        
        {status === 'completed' && (
          <>
            <CheckCircle2 size={18} />
            Certificate Saved
          </>
        )}
      </span>
    </button>
  );
};

export default CertificateProgressButton;
