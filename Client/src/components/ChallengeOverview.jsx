import React from 'react'

const ChallengeOverview = () => {
  return (
    <section id='challenge' className='w-full py-20 bg-gradient-to-b from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-t-2 border-amber-300 dark:border-amber-800'>
      <div className='max-w-7xl mx-auto px-6'>
        <div className='mb-16'>
          <div className='inline-block px-4 py-2 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 font-semibold text-sm mb-4'>
            The Challenge
          </div>
          <h2 className='text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4'>
            Accelerating Pharmaceutical Innovation
          </h2>
          <p className='text-lg text-gray-700 dark:text-gray-300 max-w-3xl'>
            A leading multinational generic pharmaceutical company seeks to diversify beyond low-margin generics by identifying innovative product opportunities through AI-driven research.
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-16'>
          <div className='p-8 rounded-xl bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl hover:scale-105 hover:border-red-400 dark:hover:border-red-600 transition-all duration-700 cursor-pointer'>
            <h3 className='text-xl font-bold text-gray-900 dark:text-white mb-4'>📋 The Problem</h3>
            <ul className='space-y-3'>
              <li className='flex items-start gap-3'>
                <span className='text-red-600 dark:text-red-400 font-bold mt-0.5'>✗</span>
                <span className='text-gray-700 dark:text-gray-300'>Literature reviews take 2-3 months</span>
              </li>
              <li className='flex items-start gap-3'>
                <span className='text-red-600 dark:text-red-400 font-bold mt-0.5'>✗</span>
                <span className='text-gray-700 dark:text-gray-300'>Multiple iterations required for viable opportunities</span>
              </li>
              <li className='flex items-start gap-3'>
                <span className='text-red-600 dark:text-red-400 font-bold mt-0.5'>✗</span>
                <span className='text-gray-700 dark:text-gray-300'>Manual searching across fragmented data sources</span>
              </li>
              <li className='flex items-start gap-3'>
                <span className='text-red-600 dark:text-red-400 font-bold mt-0.5'>✗</span>
                <span className='text-gray-700 dark:text-gray-300'>Low pipeline throughput for differentiated products</span>
              </li>
              <li className='flex items-start gap-3'>
                <span className='text-red-600 dark:text-red-400 font-bold mt-0.5'>✗</span>
                <span className='text-gray-700 dark:text-gray-300'>Missing unmet medical needs and innovation angles</span>
              </li>
            </ul>
          </div>

          <div className='p-8 rounded-xl bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl hover:scale-105 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all duration-700 cursor-pointer'>
            <h3 className='text-xl font-bold text-gray-900 dark:text-white mb-4'>✓ The Solution</h3>
            <ul className='space-y-3'>
              <li className='flex items-start gap-3'>
                <span className='text-emerald-600 dark:text-emerald-400 font-bold mt-0.5'>✓</span>
                <span className='text-gray-700 dark:text-gray-300'>Agentic AI research navigator integrates all data sources</span>
              </li>
              <li className='flex items-start gap-3'>
                <span className='text-emerald-600 dark:text-emerald-400 font-bold mt-0.5'>✓</span>
                <span className='text-gray-700 dark:text-gray-300'>Interactive exploration of innovation opportunities</span>
              </li>
              <li className='flex items-start gap-3'>
                <span className='text-emerald-600 dark:text-emerald-400 font-bold mt-0.5'>✓</span>
                <span className='text-gray-700 dark:text-gray-300'>Reduces research time from 2-3 months to hours</span>
              </li>
              <li className='flex items-start gap-3'>
                <span className='text-emerald-600 dark:text-emerald-400 font-bold mt-0.5'>✓</span>
                <span className='text-gray-700 dark:text-gray-300'>Increases throughput of early-stage evaluations</span>
              </li>
              <li className='flex items-start gap-3'>
                <span className='text-emerald-600 dark:text-emerald-400 font-bold mt-0.5'>✓</span>
                <span className='text-gray-700 dark:text-gray-300'>Identifies unmet needs and competitive white space</span>
              </li>
            </ul>
          </div>
        </div>

        <div className='p-8 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 border border-amber-300 dark:border-amber-700'>
          <h3 className='text-2xl font-bold text-gray-900 dark:text-white mb-6'>🎯 Innovation Opportunity Framework</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <div className='p-4 bg-white dark:bg-[#1a1a1a] rounded-lg border border-amber-200 dark:border-amber-800 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-lg hover:scale-105 transition-all duration-500 cursor-pointer'>
              <p className='font-bold text-gray-900 dark:text-white mb-2'>Repurposing</p>
              <p className='text-sm text-gray-700 dark:text-gray-300'>Approved molecules for new indications</p>
            </div>
            <div className='p-4 bg-white dark:bg-[#1a1a1a] rounded-lg border border-amber-200 dark:border-amber-800 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-lg hover:scale-105 transition-all duration-500 cursor-pointer'>
              <p className='font-bold text-gray-900 dark:text-white mb-2'>Formulations</p>
              <p className='text-sm text-gray-700 dark:text-gray-300'>Alternative dosage forms & delivery systems</p>
            </div>
            <div className='p-4 bg-white dark:bg-[#1a1a1a] rounded-lg border border-amber-200 dark:border-amber-800 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-lg hover:scale-105 transition-all duration-500 cursor-pointer'>
              <p className='font-bold text-gray-900 dark:text-white mb-2'>Populations</p>
              <p className='text-sm text-gray-700 dark:text-gray-300'>Different patient segments & geographies</p>
            </div>
            <div className='p-4 bg-white dark:bg-[#1a1a1a] rounded-lg border border-amber-200 dark:border-amber-800 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-lg hover:scale-105 transition-all duration-500 cursor-pointer'>
              <p className='font-bold text-gray-900 dark:text-white mb-2'>Value-Add</p>
              <p className='text-sm text-gray-700 dark:text-gray-300'>Enhanced clinical & commercial benefits</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ChallengeOverview
