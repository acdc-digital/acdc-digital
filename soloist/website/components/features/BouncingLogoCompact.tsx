"use client"

import { useEffect, useRef } from "react"

interface BouncingLogoCompactProps {
  size?: number
  className?: string
}

export function BouncingLogoCompact({ size = 40, className = "" }: BouncingLogoCompactProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ballRef = useRef({
    x: 0,
    y: 0,
    vx: 3,
    vy: 2.5,
    radius: 0,
  })
  const targetRef = useRef({
    angle: Math.random() * Math.PI * 2,
    attempts: 0,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    // Enable high-quality rendering
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    
    // Set actual canvas size (accounting for device pixel ratio)
    canvas.width = size * dpr
    canvas.height = size * dpr
    
    // Set display size (css pixels)
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    
    // Scale context to account for pixel ratio
    ctx.scale(dpr, dpr)

    // Circle dimensions
    const centerX = size / 2
    const centerY = size / 2
    const outerRadius = size / 2
    const ballRadius = size / 6.5

    // Initialize ball position
    ballRef.current = {
      x: centerX + outerRadius - ballRadius - 5,
      y: centerY + 5,
      vx: 0.08,
      vy: 0.06,
      radius: ballRadius,
    }

    let animationId: number

    const animate = () => {
      const ball = ballRef.current
      const target = targetRef.current
      const targetX = centerX + Math.cos(target.angle) * (outerRadius - ballRadius)
      const targetY = centerY + Math.sin(target.angle) * (outerRadius - ballRadius)

      // Clear canvas
      ctx.clearRect(0, 0, size, size)

      // Draw outer black circle
      ctx.fillStyle = "#1a1a1a"
      ctx.beginPath()
      ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2)
      ctx.fill()

      const toTargetX = targetX - ball.x
      const toTargetY = targetY - ball.y
      const distToTarget = Math.sqrt(toTargetX * toTargetX + toTargetY * toTargetY)

      if (distToTarget > 1) {
        const force = 0.005
        ball.vx += (toTargetX / distToTarget) * force
        ball.vy += (toTargetY / distToTarget) * force
      }

      // Update ball position
      ball.x += ball.vx
      ball.y += ball.vy

      // Calculate distance from center
      const dx = ball.x - centerX
      const dy = ball.y - centerY
      const distanceFromCenter = Math.sqrt(dx * dx + dy * dy)

      // Check collision with outer circle
      if (distanceFromCenter + ball.radius > outerRadius) {
        target.attempts++

        // Calculate normal vector
        const normalX = dx / distanceFromCenter
        const normalY = dy / distanceFromCenter

        // Reflect velocity
        const dotProduct = ball.vx * normalX + ball.vy * normalY
        ball.vx = ball.vx - 2 * dotProduct * normalX
        ball.vy = ball.vy - 2 * dotProduct * normalY

        // Move ball back inside
        const overlap = distanceFromCenter + ball.radius - outerRadius
        ball.x -= normalX * overlap
        ball.y -= normalY * overlap

        const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy)
        const targetSpeed = 0.4 + target.attempts * 0.004
        ball.vx = (ball.vx / speed) * targetSpeed
        ball.vy = (ball.vy / speed) * targetSpeed

        if (target.attempts > Math.random() * 20 + 20) {
          target.angle = Math.random() * Math.PI * 2
          target.attempts = 0
        }
      }

      // Draw white ball
      ctx.fillStyle = "#ffffff"
      ctx.beginPath()
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
      ctx.fill()

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [size])

  return <canvas ref={canvasRef} className={className} width={size} height={size} />
}
