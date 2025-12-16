import React from 'react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className='w-full bg-white dark:bg-[#0a0a0a]'>
      <hr className='border-t-2 border-gray-300 dark:border-gray-700' />
      <div className='max-w-7xl mx-auto px-6 py-8'>
        <div className='text-center'>
          <p className='text-gray-600 dark:text-gray-400 text-sm'>
            &copy; {currentYear} PharmaPilot by Mind Orbit. All rights reserved.
          </p>
          <p className='text-gray-500 dark:text-gray-500 text-xs mt-2'>
            Transforming pharmaceutical research through AI-powered insights
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
