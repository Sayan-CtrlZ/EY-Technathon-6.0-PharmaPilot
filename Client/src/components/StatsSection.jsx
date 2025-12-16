import React from 'react'

const StatsSection = () => {
  const stats = [
    {
      icon: '🔬',
      number: '500K+',
      label: 'Clinical Trials Indexed',
      description: 'Global clinical trial database coverage'
    },
    {
      icon: '📚',
      number: '5M+',
      label: 'Scientific Publications',
      description: 'PubMed, bioRxiv, and more'
    },
    {
      icon: '📜',
      number: '2M+',
      label: 'Patents Analyzed',
      description: 'USPTO, EPO, WIPO databases'
    },
    {
      icon: '🏥',
      number: '100K+',
      label: 'FDA Records',
      description: 'Drug approvals, adverse events'
    },
    {
      icon: '⏱️',
      number: '<5 sec',
      label: 'Average Response Time',
      description: 'From query to insights'
    },
    {
      icon: '🎯',
      number: '98%',
      label: 'Citation Accuracy',
      description: 'Verified and traceable sources'
    },
    {
      icon: '🌍',
      number: '50+',
      label: 'Regulatory Bodies',
      description: 'FDA, EMA, CDSCO, and more'
    },
    {
      icon: '👥',
      number: '1000+',
      label: 'Active Users',
      description: 'From leading pharma companies'
    }
  ]

  return (
    <section id='stats' className='w-full py-16 bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-900 dark:to-emerald-800'>
      <div className='max-w-7xl mx-auto px-6'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl md:text-4xl font-extrabold text-white mb-4'>
            Powered by Comprehensive Data
          </h2>
          <p className='text-lg text-emerald-50'>
            Access to the world's most comprehensive pharmaceutical research database
          </p>
        </div>

        <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
          {stats.map((stat, index) => (
            <div key={index} className='text-center text-white'>
              <div className='text-5xl mb-3'>{stat.icon}</div>
              <h3 className='text-2xl md:text-3xl font-bold mb-1'>{stat.number}</h3>
              <p className='font-semibold text-emerald-100 mb-1'>{stat.label}</p>
              <p className='text-sm text-emerald-50'>{stat.description}</p>
            </div>
          ))}
        </div>

        <div className='mt-12 pt-8 border-t border-emerald-500/30'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 text-white'>
            <div className='text-center'>
              <p className='text-4xl font-bold mb-2'>Real-Time</p>
              <p className='text-emerald-100'>Database updated daily with latest research & approvals</p>
            </div>
            <div className='text-center'>
              <p className='text-4xl font-bold mb-2'>Global</p>
              <p className='text-emerald-100'>Coverage across FDA, EMA, PMDA, CDSCO & 50+ regulators</p>
            </div>
            <div className='text-center'>
              <p className='text-4xl font-bold mb-2'>Verified</p>
              <p className='text-emerald-100'>All sources traced & citations verified for accuracy</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default StatsSection
