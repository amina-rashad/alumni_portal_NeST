import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './CinematicCTA.css';

const CinematicCTA: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.width = parent.clientWidth;
    let height = canvas.height = parent.clientHeight;

    const particles: Particle[] = [];
    const particleCount = 60;

    class Particle {
      x: number;
      y: number;
      size: number;
      baseY: number;
      speed: number;
      color: string;
      offset: number;
      opacity: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.baseY = this.y;
        this.size = Math.random() * 2 + 1;
        this.speed = Math.random() * 0.5 + 0.2;
        this.offset = Math.random() * Math.PI * 2;
        this.opacity = Math.random() * 0.5 + 0.2;
        
        // Randomly choose between NeST Red and Blue
        const isRed = Math.random() > 0.6;
        this.color = isRed ? '200, 16, 46' : '58, 111, 216';
      }

      update(time: number) {
        this.x += this.speed;
        if (this.x > width) {
          this.x = -10;
        }

        // Wave motion
        this.y = this.baseY + Math.sin(time * 0.001 + this.offset) * 50;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 4);
        gradient.addColorStop(0, `rgba(${this.color}, ${this.opacity})`);
        gradient.addColorStop(1, `rgba(${this.color}, 0)`);
        ctx.fillStyle = gradient;
        ctx.arc(this.x, this.y, this.size * 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Energy Streams
    class Stream {
      points: { x: number; y: number }[] = [];
      color: string;
      offset: number;
      speed: number;
      amplitude: number;

      constructor(color: string, offset: number, speed: number, amplitude: number) {
        this.color = color;
        this.offset = offset;
        this.speed = speed;
        this.amplitude = amplitude;
        
        for (let i = 0; i < 20; i++) {
          this.points.push({ x: (width / 20) * i, y: height / 2 });
        }
      }

      update(time: number) {
        this.points.forEach((p, i) => {
          p.y = (height / 2) + Math.sin(time * this.speed + i * 0.3 + this.offset) * this.amplitude;
        });
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        
        for (let i = 1; i < this.points.length; i++) {
          const xc = (this.points[i].x + this.points[i - 1].x) / 2;
          const yc = (this.points[i].y + this.points[i - 1].y) / 2;
          ctx.quadraticCurveTo(this.points[i - 1].x, this.points[i - 1].y, xc, yc);
        }

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const streams = [
      new Stream('rgba(200, 16, 46, 0.4)', 0, 0.001, 80),
      new Stream('rgba(58, 111, 216, 0.4)', Math.PI, 0.0008, 100),
      new Stream('rgba(255, 255, 255, 0.1)', Math.PI / 2, 0.0012, 60),
    ];

    const render = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      // Background Glow
      const bgGradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width);
      bgGradient.addColorStop(0, '#0a192f');
      bgGradient.addColorStop(1, '#010614');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      streams.forEach(s => {
        s.update(time);
        s.draw();
      });

      particles.forEach(p => {
        p.update(time);
        p.draw();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render(0);

    const handleResize = () => {
      width = canvas.width = parent.clientWidth;
      height = canvas.height = parent.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <section className="cinematic-cta-section">
      <canvas ref={canvasRef} className="cinematic-canvas" />
      <div className="cinematic-overlay" />
      
      <div className="container cinematic-cta-content">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="cinematic-text-wrap"
        >
          <h2 className="cinematic-title">
            Ready to <span className="highlight-red">Transform</span> Your <span className="highlight-blue">Career?</span>
          </h2>
          <p className="cinematic-description">
            Join the elite circle of professionals. NeST Digital connects you with 
            industry-leading projects and a global network of excellence.
          </p>

          <div className="cinematic-actions">
            <Link to="/login" className="cinematic-btn primary">
              <span>Get Started Now</span>
              <div className="btn-glow" />
            </Link>
            <a href="#contact" className="cinematic-btn secondary">
              <span>Contact Support</span>
            </a>
          </div>
        </motion.div>
      </div>

      <div className="cinematic-bottom-glow" />
    </section>
  );
};

export default CinematicCTA;
