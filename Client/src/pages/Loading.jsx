import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

const Loading = () => {
  const navigate = useNavigate()
  const { user } = useAppContext()

  useEffect(() => {
    // Show minimum loading time (1.2 seconds) then navigate to chat
    const timer = setTimeout(() => {
      navigate('/chat', { replace: true })
    }, 1200)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className='bg-linear-to-b from-[#189130] to-[#164518] backdrop-opacity-60 flex items-center justify-center h-screen w-screen text-white text-2xl'>
      <div className='w-10 h-10 rounded-full border-4 border-white border-t-transparent animate-spin'></div>
    </div>
  )
}

export default Loading
