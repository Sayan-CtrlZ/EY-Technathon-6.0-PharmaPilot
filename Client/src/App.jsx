import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import { useAppContext } from './context/AppContext'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import ResetPassword from './pages/ResetPassword'
import ChatBox from './components/ChatBox'
import { assets } from './assets/assets'
import Loading from './pages/Loading'

const App = () => {

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const { user } = useAppContext()

  if (pathname === '/loading') return <Loading />

  const isChatPage = pathname === '/chat'
  const shouldShowSidebar = user && isChatPage

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/login"
          element={
            user
              ? <Navigate to="/chat" replace />
              : <div className='bg-linear-to-b from-[#242124] to-[#000000] flex items-center justify-center h-screen w-screen'><Login /></div>
          }
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        <Route
          path="/chat"
          element={
            user
              ? (
                  <div className='dark:bg-linear-to-b from-[#242124] to-[#000000] dark:text-white h-screen w-screen overflow-hidden'>
                    {shouldShowSidebar && !isMenuOpen && (
                      <img
                        src={assets.menu_icon}
                        className='absolute top-3 left-3 w-8 h-8 cursor-pointer md:hidden not-dark:invert'
                        onClick={() => setIsMenuOpen(true)}
                        alt="menu"
                      />
                    )}
                    <div className='flex h-full w-full'>
                      {shouldShowSidebar && (
                        <Sidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
                      )}
                      <div className='flex-1 h-full'>
                        <ChatBox />
                      </div>
                    </div>
                  </div>
                )
              : <Navigate to="/login" replace />
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
