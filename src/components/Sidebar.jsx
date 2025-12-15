import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets'

const Sidebar = ({ isMenuOpen = false, setIsMenuOpen }) => {

  const { chats, theme, setTheme, user, logoutUser } = useAppContext()
  const [search, setSearch] = useState("")
  const [isCollapsed, setIsCollapsed] = useState(false)
  const mobileTranslate = isMenuOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full'

  const handleLogout = () => {
    logoutUser()
    setIsMenuOpen?.(false)
  }

  return (
    <div className={`flex flex-col h-screen shrink-0 p-5 bg-green-50 dark:bg-linear-to-b from-[#242124] to-[#000000] border-r-2 border-green-300 dark:border-[#80609F]/30 shadow-lg shadow-green-900/30 backdrop-blur-3xl transition-all duration-500 max-md:absolute md:relative left-0 z-10 dark:text-white transform md:transform-none md:translate-x-0 ${isCollapsed ? 'w-20 md:w-20' : 'w-72 md:w-80'} ${mobileTranslate}`}>
      {/* Logo */}
      <div className='flex items-center justify-between gap-2 mb-5'>
        <img src={theme === 'dark' ? assets.logo_full : assets.logo_full_dark} alt="" className={`object-contain transition-all duration-300 ${isCollapsed ? 'w-0 hidden' : 'w-full max-w-64 h-auto'}`} />
        <button onClick={() => setIsCollapsed(!isCollapsed)} className='p-1 hover:bg-green-200 dark:hover:bg-white/10 rounded transition-colors duration-300'>
          <img src={isCollapsed ? assets.menu_icon : assets.close_icon} alt="toggle" className='w-5 h-5 not-dark:invert' />
        </button>
      </div>

      {/* Spacer to push items to bottom */}
      <div className='flex-1'></div>

      {/* Dark Mode Toggle  */}
      {!isCollapsed && <div className={`flex items-center justify-between gap-2 p-3 border rounded-md transition-all duration-300 ${theme === 'dark' ? 'border-white/15 bg-white/5 text-white' : 'border-gray-300 bg-gray-100 text-gray-900'}`}>
        <div className='flex items-center gap-2 text-sm'>
          <img src={assets.theme_icon} className='w-4 not-dark:invert' alt="" />
          <p>Dark Mode</p>
        </div>
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className='relative inline-flex w-9 h-5 bg-gray-400 rounded-full transition-colors duration-300' style={{backgroundColor: theme === 'dark' ? '#10b981' : '#9ca3af'}}>
          <span className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${theme === 'dark' ? 'left-5' : 'left-1'}`}></span>
        </button>
      </div>}

      {/* User Account */}
      {!isCollapsed && <div className='flex items-center gap-3 p-3 mt-3 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer group'>
        <img src={assets.user_icon} className='w-7 rounded-full shrink-0' alt="" />
        <p className='flex-1 text-sm dark:text-primary truncate'>{user ? user.full_name || user.email : "Login your account"}</p>
        {user && <img onClick={handleLogout} src={assets.logout_icon} className='h-5 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300' style={{filter: theme === 'dark' ? 'none' : 'invert(1)'}} alt="" />}
      </div>}
    </div>
  )
}

export default Sidebar
