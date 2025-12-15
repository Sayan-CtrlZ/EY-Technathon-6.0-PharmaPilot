import React, { useState } from 'react'

const UseCases = () => {
  const [expandedCase, setExpandedCase] = useState(0)

  const useCases = [
    {
      title: 'Respiratory Disease - India Market',
      subtitle: 'Finding unmet needs in emerging markets',
      icon: '🫁',
      query: 'Which respiratory diseases show low competition but high patient burden in India?',
      discovery: [
        {
          step: 'Market Analysis',
          content: 'IQVIA agent identifies chronic obstructive pulmonary disease (COPD) with high patient population but limited branded options in India (only 3 major brands).',
          color: 'bg-blue-100 dark:bg-blue-900/30'
        },
        {
          step: 'Patent Check',
          content: 'Patent Landscape agent confirms that combination therapy (bronchodilator + corticosteroid) has expired patents with no recent filings blocking value-add formulations.',
          color: 'bg-yellow-100 dark:bg-yellow-900/30'
        },
        {
          step: 'Clinical Landscape',
          content: 'Clinical Trials agent shows 45+ active COPD trials globally, but only 2 in India - indicating research gap and unmet clinical needs.',
          color: 'bg-red-100 dark:bg-red-900/30'
        },
        {
          step: 'Trade Opportunity',
          content: 'EXIM agent reveals high API imports of salbutamol and ipratropium with favorable tariff structures, reducing manufacturing costs by 25%.',
          color: 'bg-cyan-100 dark:bg-cyan-900/30'
        },
        {
          step: 'Recommendation',
          content: 'Opportunity: Develop extended-release combination therapy for COPD tailored to Indian patient needs (once-daily dosing), targeting 40% market share in 3 years.',
          color: 'bg-green-100 dark:bg-green-900/30'
        }
      ]
    },
    {
      title: 'Antibiotic Resistance - Novel Indication',
      subtitle: 'Repurposing existing molecules for new threats',
      icon: '🦠',
      query: 'Can we repurpose our existing antibiotic portfolio for emerging resistant pathogens?',
      discovery: [
        {
          step: 'Clinical Need',
          content: 'Web Intelligence agent identifies rising incidence of methicillin-resistant Staphylococcus aureus (MRSA) skin infections in immunocompromised patients - a growing global challenge.',
          color: 'bg-green-100 dark:bg-green-900/30'
        },
        {
          step: 'Competitive Landscape',
          content: 'Market analysis shows only 2 FDA-approved treatments for MRSA skin infections with limited geographic coverage. Pricing premium of 3-5x over generic antibiotics.',
          color: 'bg-blue-100 dark:bg-blue-900/30'
        },
        {
          step: 'Patent Opportunity',
          content: 'Patent agent confirms our existing fluoroquinolone has no method-of-use patents filed for MRSA indication - clear white space for patent protection.',
          color: 'bg-yellow-100 dark:bg-yellow-900/30'
        },
        {
          step: 'Trial Design',
          content: 'Clinical Trials agent maps 78 ongoing MRSA studies, identifying optimal trial design frameworks and regulatory pathways for accelerated approval.',
          color: 'bg-red-100 dark:bg-red-900/30'
        },
        {
          step: 'Recommendation',
          content: 'Opportunity: File 505(b)(2) for fluoroquinolone + antiseptic combo therapy for MRSA skin infections. Potential annual revenue $85M with 14-month time-to-market.',
          color: 'bg-green-100 dark:bg-green-900/30'
        }
      ]
    },
    {
      title: 'Diabetes - Emerging Market Expansion',
      subtitle: 'Geographic diversification of existing products',
      icon: '🩺',
      query: 'What diabetes molecules have growth potential in Southeast Asia markets?',
      discovery: [
        {
          step: 'Market Trends',
          content: 'IQVIA analysis reveals GLP-1 receptor agonists growing at 35% CAGR in SE Asia, but penetration <5% vs. 40% in developed markets - massive opportunity.',
          color: 'bg-blue-100 dark:bg-blue-900/30'
        },
        {
          step: 'Supply Chain',
          content: 'EXIM agent identifies favorable import tariffs for GLP-1 APIs in Malaysia and Thailand (5% vs. 15% in India), reducing manufacturing costs significantly.',
          color: 'bg-cyan-100 dark:bg-cyan-900/30'
        },
        {
          step: 'Regulatory Pathway',
          content: 'Web Intelligence reveals accelerated pathways in Thailand and Vietnam for diabetes drugs with strong clinical evidence, reducing approval timeline from 24 to 12 months.',
          color: 'bg-green-100 dark:bg-green-900/30'
        },
        {
          step: 'Competitive Analysis',
          content: 'Patent landscape shows 12 patents expiring in next 2 years for GLP-1s in SE Asia - window to develop bioequivalent with value-added benefits.',
          color: 'bg-yellow-100 dark:bg-yellow-900/30'
        },
        {
          step: 'Recommendation',
          content: 'Opportunity: Launch bioequivalent GLP-1 in Thailand/Malaysia with diabetes management app integration. Target $120M annual revenue by year 3.',
          color: 'bg-green-100 dark:bg-green-900/30'
        }
      ]
    },
    {
      title: 'Oncology - Combination Therapy Opportunity',
      subtitle: 'Value-added combination of approved drugs',
      icon: '🎯',
      query: 'Are there approved cancer drugs we can combine to target an underserved indication?',
      discovery: [
        {
          step: 'Unmet Need',
          content: 'Clinical Trials agent identifies triple-negative breast cancer (TNBC) with only 4 approved targeted therapies but 5+ mechanisms of action in trials - suggesting combination gaps.',
          color: 'bg-red-100 dark:bg-red-900/30'
        },
        {
          step: 'Portfolio Fit',
          content: 'Internal Knowledge agent reveals company has approved assets targeting PD-L1 checkpoint AND PARP inhibition - perfect foundation for synergistic combination.',
          color: 'bg-orange-100 dark:bg-orange-900/30'
        },
        {
          step: 'Patent Clearance',
          content: 'Patent agent confirms combination patent claims are available - unique IP opportunity to protect fixed-dose combination for 17 years.',
          color: 'bg-yellow-100 dark:bg-yellow-900/30'
        },
        {
          step: 'Market Size',
          content: 'IQVIA projects TNBC market will reach $8.5B by 2028 with combination therapies capturing 45% share. First-mover advantage critical.',
          color: 'bg-blue-100 dark:bg-blue-900/30'
        },
        {
          step: 'Recommendation',
          content: 'Opportunity: Develop fixed-dose combination for TNBC targeting $750M+ peak sales. File IND within 6 months, Phase 1 readiness in 18 months.',
          color: 'bg-green-100 dark:bg-green-900/30'
        }
      ]
    }
  ]

  return (
    <section id='use-cases' className='w-full py-20 bg-white dark:bg-[#0a0a0a] border-t-2 border-emerald-300 dark:border-gray-800'>
      <div className='max-w-7xl mx-auto px-6'>
        <div className='text-center mb-16'>
          <h2 className='text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4'>
            Innovation Discovery in Action
          </h2>
          <p className='text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto'>
            Real-world examples of how PharmaPilot identifies high-value pharmaceutical opportunities
          </p>
        </div>

        <div className='space-y-6'>
          {useCases.map((useCase, caseIndex) => (
            <div
              key={caseIndex}
              className='rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-[#1a1a1a] shadow-lg hover:shadow-2xl hover:scale-102 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all duration-150 cursor-pointer'
            >
              {/* Header */}
              <button
                onClick={() => setExpandedCase(expandedCase === caseIndex ? -1 : caseIndex)}
                className='w-full p-6 text-left bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-colors flex items-center justify-between'
              >
                <div className='flex items-center gap-4 flex-1'>
                  <span className='text-4xl'>{useCase.icon}</span>
                  <div>
                    <h3 className='text-xl font-bold text-gray-900 dark:text-white'>
                      {useCase.title}
                    </h3>
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      {useCase.subtitle}
                    </p>
                  </div>
                </div>
                <span className='text-2xl text-emerald-600 dark:text-emerald-400 ml-4'>
                  {expandedCase === caseIndex ? '−' : '+'}
                </span>
              </button>

              {/* Content */}
              {expandedCase === caseIndex && (
                <div className='p-6 border-t-2 border-gray-200 dark:border-gray-700'>
                  <div className='mb-8 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800'>
                    <p className='font-semibold text-blue-900 dark:text-blue-100 mb-2'>Research Query:</p>
                    <p className='text-blue-800 dark:text-blue-200 italic'>"{useCase.query}"</p>
                  </div>

                  <div className='space-y-4'>
                    {useCase.discovery.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-6 rounded-xl border-l-4 border-emerald-500 ${item.color} hover:shadow-md hover:scale-102 transition-all duration-150 cursor-pointer`}
                      >
                        <div className='flex items-start gap-4'>
                          <div className='flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-sm flex-shrink-0'>
                            {idx + 1}
                          </div>
                          <div className='flex-1'>
                            <h4 className='font-bold text-gray-900 dark:text-white mb-2'>
                              {item.step}
                            </h4>
                            <p className='text-gray-800 dark:text-gray-300 leading-relaxed'>
                              {item.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className='mt-16 p-8 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border border-emerald-200 dark:border-emerald-800'>
          <h3 className='text-2xl font-bold text-emerald-900 dark:text-emerald-100 mb-4'>
            Key Insights from These Use Cases
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <div>
              <p className='font-bold text-emerald-900 dark:text-emerald-100 mb-2'>⏱️ Speed</p>
              <p className='text-sm text-emerald-800 dark:text-emerald-200'>Each opportunity discovered in &lt;1 hour vs. 2-3 months with manual research</p>
            </div>
            <div>
              <p className='font-bold text-emerald-900 dark:text-emerald-100 mb-2'>📊 Data-Driven</p>
              <p className='text-sm text-emerald-800 dark:text-emerald-200'>All recommendations backed by market, clinical, and patent data</p>
            </div>
            <div>
              <p className='font-bold text-emerald-900 dark:text-emerald-100 mb-2'>💰 High-Value</p>
              <p className='text-sm text-emerald-800 dark:text-emerald-200'>Identified opportunities represent $500M+ in aggregate peak sales potential</p>
            </div>
            <div>
              <p className='font-bold text-emerald-900 dark:text-emerald-100 mb-2'>✓ Actionable</p>
              <p className='text-sm text-emerald-800 dark:text-emerald-200'>Ready for portfolio planning, regulatory strategy, and R&D prioritization</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default UseCases
