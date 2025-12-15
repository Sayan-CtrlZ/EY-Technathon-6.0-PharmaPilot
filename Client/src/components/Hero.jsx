import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Hero = () => {
  const navigate = useNavigate()

  return (
    <section id='home' className='w-full min-h-screen flex items-center justify-center bg-transparent'>
      <div className='max-w-[95%] mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-8'>
        <div className='flex-1'>
          <h1 className='text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight drop-shadow-lg'>PharmaPilot — Agentic Research Navigator</h1>
          <p className='mt-4 text-gray-600 dark:text-gray-100 max-w-xl drop-shadow-md'>Designed for pharmaceutical research teams: accelerate literature reviews, synthesize results, and generate experiment designs with AI-assisted workflows tailored to drug discovery and clinical research.</p>
          <div className='mt-6 flex items-center gap-3'>
            <button onClick={() => navigate('/loading')} className='px-6 py-3 rounded-md bg-gradient-to-r from-[#10b981] to-[#34d399] text-white font-medium transition-all duration-300 hover:scale-102 hover:shadow-lg hover:shadow-emerald-500/50'>Try PharmaPilot</button>
            <button onClick={() => navigate('/loading')} className='text-sm text-gray-600 dark:text-gray-100 underline cursor-pointer transition-all duration-300 hover:text-[#10b981] dark:hover:text-[#34d399]'>See research features</button>
          </div>
        </div>

        <div className='flex-1 flex items-center justify-center'>
          <img src={assets.mountain_img} alt='hero' className='w-full rounded-lg shadow-2xl shadow-emerald-500/40 object-cover select-none pointer-events-none' draggable='false' />
        </div>
      </div>
    </section>
  )
}

export default Hero
