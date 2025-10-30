"use client";

import { useRef, useEffect } from "react";

interface ParticleAnimationProps {
  width?: number;
  height?: number;
  particleCount?: number;
  particleColor?: string;
  lineColor?: string;
  connectionDistance?: number;
}

export function ParticleAnimation({
  width = 280,
  height = 200,
  particleCount = 30,
  particleColor = "#8b5cf6", // violet-500
  lineColor = "rgba(139,92,246,0.2)",
  connectionDistance = 50,
}: ParticleAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = canvas.width = width;
    let h = canvas.height = height;
    const particles: { x: number; y: number; vx: number; vy: number }[] = [];

    const init = () => {
      particles.length = 0;
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
        });
      }
    };

    const draw = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      
      // Draw particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce at edges
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = particleColor;
        ctx.fill();
      }

      // Connect nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDistance) {
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(draw);
    };

    init();
    draw();

    const handleResize = () => {
      w = canvas.width = width;
      h = canvas.height = height;
      init();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [width, height, particleCount, particleColor, lineColor, connectionDistance]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-auto rounded-lg"
      style={{ maxWidth: width, maxHeight: height }}
    />
  );
}
