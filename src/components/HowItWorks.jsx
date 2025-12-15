import React from 'react'
import { assets } from '../assets/assets'

const HowItWorks = () => {
  const steps = [
    {
      step: 1,
      title: 'Ask Your Question',
      description: 'Submit any pharmaceutical research query - from molecule analysis to market insights',
      icon: assets.question_icon
    },
    {
      step: 2,
      title: 'AI Agents Analyze',
      description: 'Multiple specialized agents simultaneously search clinical trials, patents, publications, and databases',
      icon: assets.ai_solid
    },
    {
      step: 3,
      title: 'Synthesize Results',
      description: 'AI synthesizes findings, identifies patterns, and cross-references data sources for accuracy',
      icon: assets.processing_solid
    },
    {
      step: 4,
      title: 'Get Insights',
      description: 'Receive comprehensive, evidence-based answers with citations and research recommendations',
      icon: assets.dialogflow_insights
    },
    {
      step: 5,
      title: 'Export & Share',
      description: 'Download results as PDFs, presentations, or integrate into your research workflows',
      icon: assets.download_arrow_down
    }
  ]

  return (
    <section id='how-it-works' className='w-full py-20 bg-white dark:bg-[#0a0a0a] border-t-2 border-emerald-300 dark:border-gray-800'>
      <div className='max-w-7xl mx-auto px-6'>
        <div className='text-center mb-16'>
          <h2 className='text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4'>
            How PharmaPilot Works
          </h2>
          <p className='text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto'>
            A seamless workflow from research question to actionable insights
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-2'>
          {steps.map((item, index) => (
            <div key={index} className='flex flex-col items-center group cursor-pointer'>
              <div className='relative mb-6 group-hover:scale-110 transition-transform duration-150'>
                <div className='w-20 h-20 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/50 group-hover:shadow-2xl group-hover:shadow-emerald-500/70 transition-all duration-150'>
                  <img src={item.icon} alt={item.title} className='w-10 h-10 object-contain' />
                </div>
                <span className='absolute -top-2 -right-2 bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm'>
                  {item.step}
                </span>
              </div>
              <h3 className='text-lg font-bold text-gray-900 dark:text-white text-center mb-2'>
                {item.title}
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-400 text-center'>
                {item.description}
              </p>
              {index < steps.length - 1 && (
                <div className='hidden md:block absolute right-0 top-1/4 w-8 h-1 bg-gradient-to-r from-emerald-400 to-transparent'></div>
              )}
            </div>
          ))}
        </div>

        <div className='mt-16 p-8 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border border-emerald-200 dark:border-emerald-800 hover:shadow-lg hover:scale-102 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all duration-150 cursor-pointer'>
          <h3 className='text-xl font-bold text-gray-900 dark:text-white mb-4'>Example Workflow</h3>
          <div className='space-y-3 text-gray-700 dark:text-gray-300'>
            <p><span className='font-semibold text-emerald-600 dark:text-emerald-400'>Question:</span> "What are the latest treatment options for triple-negative breast cancer and which molecules show promise?"</p>
            <p><span className='font-semibold text-emerald-600 dark:text-emerald-400'>PharmaPilot processes:</span> Searches 500+ clinical trials, 100,000+ publications, competitive pipelines, and regulatory databases in seconds</p>
            <p><span className='font-semibold text-emerald-600 dark:text-emerald-400'>Delivers:</span> Evidence-based summary, mechanism of action, efficacy data, safety profiles, competing drugs, and unmet needs with full citations</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
