import React, { useState, useEffect } from 'react'

const WorkflowAnimation = () => {
  const [activeStep, setActiveStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(true)

  const steps = [
    {
      title: 'User Query',
      description: 'Pharmaceutical researcher asks: "Which respiratory diseases show low competition but high patient burden in India?"',
      icon: '❓',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      details: [
        'Complex research question',
        'Multi-domain analysis required',
        'Real-world applicability focus'
      ]
    },
    {
      title: 'Master Agent Analysis',
      description: 'Master Agent interprets the query and decomposes it into specific research tasks for worker agents',
      icon: '🧠',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      details: [
        'Query decomposition',
        'Task prioritization',
        'Agent routing logic'
      ]
    },
    {
      title: 'Parallel Agent Execution',
      description: 'Six specialized agents simultaneously search their respective data sources',
      icon: '⚡',
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
      details: [
        '📊 IQVIA: Market analysis',
        '📦 EXIM: Trade data',
        '📜 Patent: IP landscape',
        '🏥 Clinical: Trials data',
        '📁 Internal: Documents',
        '🌐 Web: Real-time news'
      ]
    },
    {
      title: 'Data Aggregation',
      description: 'Raw data from all agents is collected and processed for synthesis',
      icon: '🗂️',
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
      details: [
        'Cross-reference findings',
        'Validate data accuracy',
        'Eliminate redundancies'
      ]
    },
    {
      title: 'Synthesis & Analysis',
      description: 'Master Agent combines insights from all sources to identify patterns and opportunities',
      icon: '🔗',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950/30',
      details: [
        'Identify market gaps',
        'Spot innovation angles',
        'Risk assessment'
      ]
    },
    {
      title: 'Report Generation',
      description: 'Comprehensive, actionable report with charts, tables, and recommendations delivered to user',
      icon: '📋',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      details: [
        'COPD market opportunity',
        'Patent white space',
        'Clinical evidence gaps',
        'Revenue projections'
      ]
    }
  ]

  useEffect(() => {
    if (!isAnimating) return

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [isAnimating, steps.length])

  return (
    <section id='workflow' className='w-full py-20 bg-white dark:bg-[#0a0a0a] border-t-2 border-emerald-300 dark:border-gray-800'>
      <div className='max-w-7xl mx-auto px-6'>
        <div className='text-center mb-16'>
          <h2 className='text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4'>
            Research Workflow in Action
          </h2>
          <p className='text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto'>
            See how PharmaPilot orchestrates research across multiple data sources in real-time
          </p>
        </div>

        {/* Step Visualization */}
        <div className='mb-12'>
          {/* Step Indicators */}
          <div className='flex justify-between items-center mb-12 overflow-x-auto pb-4'>
            {steps.map((step, index) => (
              <div key={index} className='flex flex-col items-center flex-shrink-0 px-2'>
                <button
                  onClick={() => {
                    setActiveStep(index)
                    setIsAnimating(false)
                  }}
                  className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl mb-2 transition-all duration-300 ${
                    index === activeStep
                      ? `bg-gradient-to-br ${step.color} text-white shadow-lg scale-110`
                      : index < activeStep
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {index < activeStep ? '✓' : step.icon}
                </button>
                <p className='text-xs font-semibold text-gray-700 dark:text-gray-300 text-center whitespace-nowrap'>
                  {step.title.split(' ')[0]}
                </p>
              </div>
            ))}
          </div>

          {/* Connecting Lines */}
          <div className='relative h-1 bg-gray-200 dark:bg-gray-700 mb-12 rounded-full overflow-hidden'>
            <div
              className='h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500'
              style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Active Step Details */}
        <div className={`p-8 rounded-xl border-2 transition-all duration-500 ${steps[activeStep].bgColor} border-gray-300 dark:border-gray-700`}>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            {/* Left: Animation */}
            <div className='flex flex-col items-center justify-center'>
              <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${steps[activeStep].color} flex items-center justify-center text-6xl mb-6 shadow-2xl animate-pulse`}>
                {steps[activeStep].icon}
              </div>
              <h3 className='text-2xl font-bold text-gray-900 dark:text-white text-center mb-2'>
                {steps[activeStep].title}
              </h3>
              <p className='text-gray-700 dark:text-gray-300 text-center text-sm leading-relaxed'>
                {steps[activeStep].description}
              </p>
            </div>

            {/* Right: Details */}
            <div>
              <h4 className='font-bold text-gray-900 dark:text-white mb-4 text-lg'>
                {activeStep === 0 && '📝 Query Components'}
                {activeStep === 1 && '🔄 Decomposition Steps'}
                {activeStep === 2 && '🤖 Agents Running in Parallel'}
                {activeStep === 3 && '📊 Data Processing'}
                {activeStep === 4 && '💡 Analysis Insights'}
                {activeStep === 5 && '✅ Deliverables'}
              </h4>
              <ul className='space-y-3'>
                {steps[activeStep].details.map((detail, idx) => (
                  <li
                    key={idx}
                    className={`flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 transition-all duration-300 ${
                      activeStep === 2 ? 'animate-slide-in' : ''
                    }`}
                    style={{
                      animationDelay: `${idx * 100}ms`
                    }}
                  >
                    <span className='text-lg flex-shrink-0'>
                      {activeStep === 0 && '→'}
                      {activeStep === 1 && '→'}
                      {activeStep === 2 && '⚡'}
                      {activeStep === 3 && '✓'}
                      {activeStep === 4 && '💡'}
                      {activeStep === 5 && '✓'}
                    </span>
                    <span className='text-gray-700 dark:text-gray-300 text-sm leading-relaxed'>
                      {detail}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className='flex justify-center items-center gap-4 mt-12'>
          <button
            onClick={() => {
              setActiveStep((prev) => (prev - 1 + steps.length) % steps.length)
              setIsAnimating(false)
            }}
            className='px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 font-semibold text-gray-900 dark:text-white transition-colors'
          >
            ← Previous
          </button>
          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              isAnimating
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isAnimating ? '⏸ Pause' : '▶ Auto-play'}
          </button>
          <button
            onClick={() => {
              setActiveStep((prev) => (prev + 1) % steps.length)
              setIsAnimating(false)
            }}
            className='px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 font-semibold text-gray-900 dark:text-white transition-colors'
          >
            Next →
          </button>
        </div>

        {/* Timeline */}
        <div className='mt-12 p-6 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700'>
          <h3 className='font-bold text-gray-900 dark:text-white mb-4'>Performance Metrics</h3>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='text-center'>
              <p className='text-2xl font-bold text-emerald-600 dark:text-emerald-400'>&lt;5 sec</p>
              <p className='text-sm text-gray-700 dark:text-gray-300'>Total Analysis Time</p>
            </div>
            <div className='text-center'>
              <p className='text-2xl font-bold text-blue-600 dark:text-blue-400'>6</p>
              <p className='text-sm text-gray-700 dark:text-gray-300'>Parallel Agents</p>
            </div>
            <div className='text-center'>
              <p className='text-2xl font-bold text-purple-600 dark:text-purple-400'>500M+</p>
              <p className='text-sm text-gray-700 dark:text-gray-300'>Data Records Searched</p>
            </div>
            <div className='text-center'>
              <p className='text-2xl font-bold text-orange-600 dark:text-orange-400'>100%</p>
              <p className='text-sm text-gray-700 dark:text-gray-300'>Cited Sources</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.5s ease-out forwards;
        }
      `}</style>
    </section>
  )
}

export default WorkflowAnimation
