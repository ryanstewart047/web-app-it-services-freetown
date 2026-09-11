'use client'

import { useState, useEffect, useRef } from 'react'

interface TrackRecordStats {
  devices: number
  customers: number
  success: number
  response: number
}

const DEFAULT_TARGETS: TrackRecordStats = {
  devices: 450,
  customers: 300,
  success: 98,
  response: 2,
}

export default function TrackRecord() {
  const [counters, setCounters] = useState<TrackRecordStats>({
    devices: 0,
    customers: 0,
    success: 0,
    response: 0,
  })

  const [targets, setTargets] = useState<TrackRecordStats>(DEFAULT_TARGETS)
  const animFrameRef = useRef<number | null>(null)

  // Fetch real-time live data from API
  useEffect(() => {
    let isMounted = true

    async function fetchLiveStats() {
      try {
        const res = await fetch('/api/track-record')
        if (!res.ok) return
        const data = await res.json()

        if (isMounted && data) {
          setTargets({
            devices: Number(data.devices) || DEFAULT_TARGETS.devices,
            customers: Number(data.customers) || DEFAULT_TARGETS.customers,
            success: Number(data.successRate) || DEFAULT_TARGETS.success,
            response: Number(data.responseTime) || DEFAULT_TARGETS.response,
          })
        }
      } catch (err) {
        console.warn('[TrackRecord] Failed to fetch live data, using defaults:', err)
      }
    }

    fetchLiveStats()

    return () => {
      isMounted = false
    }
  }, [])

  // Smooth counter animation
  useEffect(() => {
    const duration = 2000 // 2 seconds
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease-out cubic easing for a smooth premium slowdown
      const easeOut = 1 - Math.pow(1 - progress, 3)

      setCounters({
        devices: Math.round(targets.devices * easeOut),
        customers: Math.round(targets.customers * easeOut),
        success: Math.round(targets.success * easeOut),
        response: Math.round(targets.response * easeOut),
      })

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate)
      } else {
        setCounters(targets)
      }
    }

    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [targets])

  const stats = [
    {
      key: 'devices',
      value: counters.devices,
      label: 'Devices Repaired',
      suffix: '+',
      color: 'text-[#040e40]',
    },
    {
      key: 'customers',
      value: counters.customers,
      label: 'Happy Customers',
      suffix: '+',
      color: 'text-red-600',
    },
    {
      key: 'success',
      value: counters.success,
      label: 'Success Rate',
      suffix: '%',
      color: 'text-green-600',
    },
    {
      key: 'response',
      value: counters.response,
      label: 'Avg Response Time',
      suffix: 'hrs',
      color: 'text-purple-600',
    },
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" data-animate="fade">
            Our Track Record
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto" data-animate="fade">
            Numbers that speak for our commitment to excellence and customer satisfaction
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div
              key={stat.key}
              className="text-center"
              data-animate="scale"
            >
              <div className={`text-4xl font-bold ${stat.color} mb-2`}>
                {stat.value}{stat.suffix}
              </div>
              <p className="text-gray-600 font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
