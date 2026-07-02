import React, { useState, useEffect } from 'react'

interface ReservationTimerProps {
  expiresAt: number
  onExpire?: () => void
}

export function ReservationTimer({ expiresAt, onExpire }: ReservationTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now()
      const diff = expiresAt - now

      if (diff <= 0) {
        setTimeLeft('Expired')
        setIsExpired(true)
        onExpire?.()
        return
      }

      const minutes = Math.floor(diff / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [expiresAt, onExpire])

  const isWarning = timeLeft.startsWith('0:') || timeLeft.startsWith('1:') || timeLeft.startsWith('2:') || timeLeft.startsWith('3:') || timeLeft.startsWith('4:')

  return (
    <div className={`flex items-center gap-2 ${isExpired ? 'text-accent' : isWarning ? 'text-accent' : 'text-primary'}`}>
      <span className="text-sm font-semibold">{isExpired ? 'Expired' : `Expires in ${timeLeft}`}</span>
      {isWarning && !isExpired && (
        <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
      )}
    </div>
  )
}
