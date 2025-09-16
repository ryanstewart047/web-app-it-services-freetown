'use client'

import { useState, useEffect } from 'react'

export default function TrackRecord() {
  const [counters, setCounters] = useState({
    devices: 0,
    customers: 0,
    success: 0,
    response: 0
  })

  const stats = [
    { 
      key: 'devices',
      target: 450, 
      label: 'Devices Repaired',
      suffix: '+',
      color: 'text-blue-900'
    },
    { 
      key: 'customers',
      target: 300, 
      label: 'Happy Customers',
      suffix: '+',
      color: 'text-red-600'
    },
    { 
      key: 'success',
      target: 98, 
      label: 'Success Rate',
      suffix: '%',
      color: 'text-green-600'
    },
    { 
      key: 'response',
      target: 2, 
      label: 'Avg Response Time',
      suffix: 'hrs',
      color: 'text-purple-600'
    }
  ]

  useEffect(() => {
    const animateCounters = () => {
      const duration = 2000
      const steps = 60
      const targets = {
        devices: 450,
        customers: 300,
        success: 98,
        response: 2
      }
      
      const increments = {
        devices: targets.devices / steps,
        customers: targets.customers / steps,
        success: targets.success / steps,
        response: targets.response / steps
      }

      let step = 0
      const timer = setInterval(() => {
        step++
        setCounters({
          devices: Math.min(Math.floor(increments.devices * step), targets.devices),
          customers: Math.min(Math.floor(increments.customers * step), targets.customers),
          success: Math.min(Math.floor(increments.success * step), targets.success),
          response: Math.min(Math.floor(increments.response * step), targets.response)
        })

        if (step >= steps) {
          clearInterval(timer)
          setCounters(targets)
        }
      }, duration / steps)
    }

    // Start animation after component mounts
    const timer = setTimeout(animateCounters, 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Track Record
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Numbers that speak for our commitment to excellence and customer satisfaction
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={stat.key}
              className="text-center"
            >
              <div className={`text-4xl font-bold ${stat.color} mb-2`}>
                {counters[stat.key as keyof typeof counters]}{stat.suffix}
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
