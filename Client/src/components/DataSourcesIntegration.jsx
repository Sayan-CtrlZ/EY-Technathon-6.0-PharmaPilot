import React from 'react'

const DataSourcesIntegration = () => {
  const dataSources = [
    {
      category: 'Market Intelligence',
      icon: '📊',
      color: 'blue',
      sources: [
        { name: 'IQVIA Datasets', type: 'Subscription', coverage: 'Sales, market size, CAGR, competitor data' },
        { name: 'CMS Medicare Data', type: 'Public', coverage: 'US reimbursement, pricing trends' },
        { name: 'WHO NCD Database', type: 'Public', coverage: 'Global disease burden, prevalence' }
      ]
    },
    {
      category: 'Trade & Supply Chain',
      icon: '📦',
      color: 'cyan',
      sources: [
        { name: 'EXIM Datasets', type: 'Subscription', coverage: 'Export-import volumes by molecule, API sourcing' },
        { name: 'UN Trade Data', type: 'Public', coverage: 'International trade statistics, tariff info' },
        { name: 'Company Databases', type: 'Internal', coverage: 'Sourcing costs, supplier relationships' }
      ]
    },
    {
      category: 'Patents & IP',
      icon: '📜',
      color: 'yellow',
      sources: [
        { name: 'USPTO Database', type: 'Public', coverage: 'US patent filings, expiry dates, FTO' },
        { name: 'EPO Espacenet', type: 'Public', coverage: 'European and international patents' },
        { name: 'WIPO PATENTSCOPE', type: 'Public', coverage: 'Global patent filings' }
      ]
    },
    {
      category: 'Clinical Research',
      icon: '🏥',
      color: 'red',
      sources: [
        { name: 'ClinicalTrials.gov', type: 'Public', coverage: '500K+ trials, sponsors, phases' },
        { name: 'WHO ICTRP', type: 'Public', coverage: 'Global trial registry' },
        { name: 'PubMed', type: 'Public', coverage: '35M+ scientific publications' }
      ]
    },
    {
      category: 'Scientific Literature',
      icon: '📚',
      color: 'purple',
      sources: [
        { name: 'PubMed/MEDLINE', type: 'Public', coverage: 'Biomedical literature, clinical evidence' },
        { name: 'bioRxiv/medRxiv', type: 'Public', coverage: 'Preprints, latest research' },
        { name: 'Journal APIs', type: 'Subscription', coverage: 'Nature, Science, Cell, specialty journals' }
      ]
    },
    {
      category: 'Regulatory & Guidelines',
      icon: '⚖️',
      color: 'emerald',
      sources: [
        { name: 'FDA Website', type: 'Public', coverage: 'Approvals, Orange Book, guidance documents' },
        { name: 'EMA Database', type: 'Public', coverage: 'European approvals, assessments' },
        { name: 'WHO Prequalified', type: 'Public', coverage: 'Global regulatory status' }
      ]
    },
    {
      category: 'Internal Knowledge',
      icon: '📁',
      color: 'orange',
      sources: [
        { name: 'Strategy Documents', type: 'Internal', coverage: 'Corporate strategy, portfolio plans' },
        { name: 'Field Reports', type: 'Internal', coverage: 'Market feedback, sales insights' },
        { name: 'Historical Data', type: 'Internal', coverage: 'Past initiatives, lessons learned' }
      ]
    },
    {
      category: 'Real-Time Intelligence',
      icon: '🌐',
      color: 'green',
      sources: [
        { name: 'Web Search APIs', type: 'Real-time', coverage: 'News, company announcements, trends' },
        { name: 'Social Media', type: 'Real-time', coverage: 'Patient forums, healthcare discussions' },
        { name: 'Healthcare News', type: 'Real-time', coverage: 'Breaking regulatory, clinical news' }
      ]
    }
  ]

  const colorMap = {
    blue: 'from-blue-400 to-blue-600',
    cyan: 'from-cyan-400 to-cyan-600',
    yellow: 'from-yellow-400 to-yellow-600',
    red: 'from-red-400 to-red-600',
    purple: 'from-purple-400 to-purple-600',
    emerald: 'from-emerald-400 to-emerald-600',
    orange: 'from-orange-400 to-orange-600',
    green: 'from-green-400 to-green-600'
  }

  const colorBg = {
    blue: 'bg-blue-50 dark:bg-blue-950/30',
    cyan: 'bg-cyan-50 dark:bg-cyan-950/30',
    yellow: 'bg-yellow-50 dark:bg-yellow-950/30',
    red: 'bg-red-50 dark:bg-red-950/30',
    purple: 'bg-purple-50 dark:bg-purple-950/30',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/30',
    orange: 'bg-orange-50 dark:bg-orange-950/30',
    green: 'bg-green-50 dark:bg-green-950/30'
  }

  return (
    <section id='data-sources' className='w-full py-20 bg-gray-50 dark:bg-[#1a1a1a] border-t-2 border-emerald-300 dark:border-gray-800'>
      <div className='max-w-7xl mx-auto px-6'>
        <div className='text-center mb-16'>
          <h2 className='text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4'>
            Integrated Data Sources
          </h2>
          <p className='text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto'>
            PharmaPilot connects to a comprehensive ecosystem of public, commercial, and internal data sources
          </p>
        </div>

        {/* Data Sources Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16'>
          {dataSources.map((category, index) => (
            <div
              key={index}
              className={`p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl hover:scale-105 hover:-translate-y-2 transition-all duration-700 cursor-pointer ${colorBg[category.color]}`}
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorMap[category.color]} flex items-center justify-center text-2xl mb-4 shadow-md`}>
                {category.icon}
              </div>
              <h3 className='text-lg font-bold text-gray-900 dark:text-white mb-4'>
                {category.category}
              </h3>
              <div className='space-y-3'>
                {category.sources.map((source, idx) => (
                  <div key={idx} className='pb-3 border-b border-gray-300 dark:border-gray-600 last:border-b-0'>
                    <p className='font-semibold text-gray-900 dark:text-white text-sm'>
                      {source.name}
                    </p>
                    <div className='flex items-center gap-2 mt-1'>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        source.type === 'Public' ? 'bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-100' :
                        source.type === 'Subscription' ? 'bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-100' :
                        source.type === 'Internal' ? 'bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-100' :
                        'bg-orange-200 dark:bg-orange-900 text-orange-800 dark:text-orange-100'
                      }`}>
                        {source.type}
                      </span>
                    </div>
                    <p className='text-xs text-gray-600 dark:text-gray-400 mt-2 leading-snug'>
                      {source.coverage}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Integration Architecture */}
        <div className='p-8 rounded-xl bg-white dark:bg-[#0a0a0a] border-2 border-gray-200 dark:border-gray-700 shadow-lg mb-12'>
          <h3 className='text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center'>
            Data Integration Architecture
          </h3>

          <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
            <div className='p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-300 dark:border-blue-700 text-center'>
              <p className='font-bold text-blue-900 dark:text-blue-100 mb-2'>🔌 APIs & Connectors</p>
              <p className='text-sm text-blue-800 dark:text-blue-200'>Direct integrations with 20+ data providers via REST APIs and webhooks</p>
            </div>
            <div className='p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-300 dark:border-purple-700 text-center'>
              <p className='font-bold text-purple-900 dark:text-purple-100 mb-2'>🔄 ETL Pipeline</p>
              <p className='text-sm text-purple-800 dark:text-purple-200'>Automated data extraction, transformation, and loading with daily updates</p>
            </div>
            <div className='p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-700 text-center'>
              <p className='font-bold text-emerald-900 dark:text-emerald-100 mb-2'>💾 Data Lake</p>
              <p className='text-sm text-emerald-800 dark:text-emerald-200'>Unified data warehouse with 500M+ records of pharmaceutical intelligence</p>
            </div>
            <div className='p-4 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-300 dark:border-orange-700 text-center'>
              <p className='font-bold text-orange-900 dark:text-orange-100 mb-2'>🤖 AI Processing</p>
              <p className='text-sm text-orange-800 dark:text-orange-200'>Agent-based intelligence layer with NLP and knowledge graphs</p>
            </div>
          </div>

          {/* Data Flow Diagram */}
          <div className='space-y-3'>
            <div className='flex items-center gap-3'>
              <div className='px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 font-semibold text-gray-900 dark:text-white'>
                Data Sources
              </div>
              <div className='flex-1 h-1 bg-gradient-to-r from-emerald-400 to-transparent'></div>
              <span className='text-emerald-600 dark:text-emerald-400 font-bold'>→</span>
            </div>
            <div className='flex items-center gap-3 pl-8'>
              <div className='px-4 py-2 rounded-lg bg-blue-100 dark:bg-blue-900 font-semibold text-blue-900 dark:text-blue-100'>
                API Layer
              </div>
              <div className='flex-1 h-1 bg-gradient-to-r from-blue-400 to-transparent'></div>
              <span className='text-blue-600 dark:text-blue-400 font-bold'>→</span>
            </div>
            <div className='flex items-center gap-3 pl-16'>
              <div className='px-4 py-2 rounded-lg bg-purple-100 dark:bg-purple-900 font-semibold text-purple-900 dark:text-purple-100'>
                Data Pipeline
              </div>
              <div className='flex-1 h-1 bg-gradient-to-r from-purple-400 to-transparent'></div>
              <span className='text-purple-600 dark:text-purple-400 font-bold'>→</span>
            </div>
            <div className='flex items-center gap-3 pl-24'>
              <div className='px-4 py-2 rounded-lg bg-emerald-100 dark:bg-emerald-900 font-semibold text-emerald-900 dark:text-emerald-100'>
                Unified Data Lake
              </div>
              <div className='flex-1 h-1 bg-gradient-to-r from-emerald-400 to-transparent'></div>
              <span className='text-emerald-600 dark:text-emerald-400 font-bold'>→</span>
            </div>
            <div className='flex items-center gap-3 pl-32'>
              <div className='px-4 py-2 rounded-lg bg-orange-100 dark:bg-orange-900 font-semibold text-orange-900 dark:text-orange-100'>
                Worker Agents
              </div>
              <div className='flex-1 h-1 bg-gradient-to-r from-orange-400 to-transparent'></div>
              <span className='text-orange-600 dark:text-orange-400 font-bold'>→</span>
            </div>
            <div className='flex items-center gap-3 pl-40'>
              <div className='px-4 py-2 rounded-lg bg-green-100 dark:bg-green-900 font-semibold text-green-900 dark:text-green-100'>
                User Results
              </div>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='p-6 rounded-xl bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 shadow-lg'>
            <p className='text-3xl mb-3'>⚡</p>
            <h4 className='font-bold text-gray-900 dark:text-white mb-2'>Real-Time Updates</h4>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              Data syncs continuously from public sources and subscription databases with minutes latency for FDA/EMA updates.
            </p>
          </div>
          <div className='p-6 rounded-xl bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 shadow-lg'>
            <p className='text-3xl mb-3'>🔐</p>
            <h4 className='font-bold text-gray-900 dark:text-white mb-2'>Secure Integration</h4>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              All connections use encrypted OAuth 2.0, with compliance audit logs and data isolation for proprietary sources.
            </p>
          </div>
          <div className='p-6 rounded-xl bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 shadow-lg'>
            <p className='text-3xl mb-3'>🎯</p>
            <h4 className='font-bold text-gray-900 dark:text-white mb-2'>Smart Queries</h4>
            <p className='text-sm text-gray-700 dark:text-gray-300'>
              Agents automatically route queries to optimal data sources and cross-reference for accuracy and completeness.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default DataSourcesIntegration
