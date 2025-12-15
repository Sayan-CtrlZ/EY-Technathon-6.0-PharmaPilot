import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import { useNavigate, useLocation } from 'react-router-dom'

const NavBar = () => {
  const { user, theme, toggleTheme } = useAppContext()
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location && (location.pathname === '/' || location.pathname === '')
  const showLogo = !(user && !isHome)
  const [openDropdown, setOpenDropdown] = useState(null)
  const [isSpinning, setIsSpinning] = useState(false)

  const handleThemeToggle = () => {
    setIsSpinning(true)
    toggleTheme()
    setTimeout(() => setIsSpinning(false), 600)
  }

  const scrollToSection = (sectionId) => {
    navigate('/')
    setTimeout(() => {
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }

  const navigationMenu = [
    {
      label: 'Product',
      items: [
        { label: 'Workflow', sectionId: 'workflow' },
        { label: 'How it Works', sectionId: 'how-it-works' },
        { label: 'Use Cases', sectionId: 'use-cases' }
      ]
    },
    {
      label: 'Research',
      items: [
        { label: 'Challenge Overview', sectionId: 'challenge' },
        { label: 'Data Sources', sectionId: 'data-sources' },
        { label: 'Results & Stats', sectionId: 'stats' }
      ]
    }
  ]

  const faqLink = { label: 'FAQ', sectionId: 'faq'}

  return (
    <header className='hidden lg:block sticky top-0 z-50 w-full border-b border-gray-200/30 dark:border-white/10 bg-white/30 dark:bg-white/5 backdrop-blur-lg shadow-lg shadow-emerald-500/20'>
      <div className='w-full px-6 py-4 flex items-center justify-between'>

        {/* LEFT SIDE — Logo + Nav */}
        <div className='flex items-center gap-8'>

          {/* Logo */}
          {showLogo && (
            <img
              src={theme === 'dark' ? assets.logo_full : assets.logo_full_dark}
              alt='logo'
              className='h-10 w-auto object-contain cursor-pointer hover:opacity-80 transition-opacity'
              onClick={() => navigate('/')}
            />
          )}

          {/* Navigation Menu */}
          <nav className='hidden lg:flex items-center gap-8'>
            {/* Home Link */}
            <button
              onClick={() => scrollToSection('home')}
              className='text-gray-700 dark:text-gray-200 font-medium text-sm hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200 pb-1 border-b-2 border-transparent hover:border-emerald-600 dark:hover:border-emerald-400'
            >
              Home
            </button>

            {/* Dropdown Menus */}
            {navigationMenu.map((menu, idx) => (
              <div
                key={idx}
                className='relative group'
                onMouseEnter={() => setOpenDropdown(menu.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className='text-gray-700 dark:text-gray-200 font-medium text-sm hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200 pb-1 border-b-2 border-transparent hover:border-emerald-600 dark:hover:border-emerald-400 flex items-center gap-1'>
                  {menu.label}
                  <span className={`transition-transform duration-300 ${openDropdown === menu.label ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>

                {/* Dropdown */}
                <div className='absolute left-0 mt-0 w-56 bg-white dark:bg-gray-900 rounded-lg shadow-xl dark:shadow-2xl dark:shadow-black/50 border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 py-2'>
                  {menu.items.map((item, itemIdx) => (
                    <button
                      key={itemIdx}
                      onClick={() => {
                        if (item.sectionId) {
                          scrollToSection(item.sectionId)
                        }
                        setOpenDropdown(null)
                      }}
                      className='w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all duration-200 flex items-center gap-3 border-l-3 border-transparent hover:border-emerald-500'
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* FAQ Direct Link */}
          <button
            onClick={() => scrollToSection('faq')}
            className='text-gray-700 dark:text-gray-200 font-medium text-sm hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200 pb-1 border-b-2 border-transparent hover:border-emerald-600 dark:hover:border-emerald-400 flex items-center gap-1'
          >
            FAQ
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className='lg:hidden'>
          <button className='text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400'>
            ☰
          </button>
        </div>

        {/* RIGHT SIDE — Actions */}
        <div className='flex items-center gap-4'>
          {/* Theme Toggle */}
          <button 
            onClick={handleThemeToggle}
            className='p-2 rounded-lg bg-gradient-to-r from-emerald-400/20 to-green-400/20 hover:from-emerald-400/40 hover:to-green-400/40 text-gray-700 dark:text-gray-300 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 hover:scale-110'
            aria-label='Toggle theme'
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <img 
              src={theme === 'dark' ? assets.sun_icon : assets.moon_clear}
              alt={theme === 'dark' ? 'sun' : 'moon'}
              className={`w-5 h-5 transition-transform duration-600 ${isSpinning ? 'rotate-360' : ''}`}
              style={isSpinning ? { transform: 'rotate(360deg)' } : {}}
            />
          </button>

          {/* Get Started Button */}
          <button
            onClick={() => navigate('/loading')}
            className='hidden md:inline-block px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold transition-all duration-300 hover:from-emerald-600 hover:to-emerald-700 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/50'
          >
            Try Now
          </button>

          {/* User or Sign In */}
          {user ? (
            <div className='flex items-center gap-3 pl-4 border-l border-gray-300 dark:border-gray-700'>
              <img src={assets.user_icon} className='w-8 h-8 rounded-full' alt='user' />
              <span className='text-sm dark:text-white font-semibold hidden md:inline'>{user.name}</span>
            </div>
          ) : (
            <button
              onClick={() => navigate('/loading')}
              className='px-4 py-2 rounded-lg border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 text-sm font-semibold hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 transition-all duration-300'
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default NavBar