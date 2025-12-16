// ChatBox.jsx
import React, { useEffect, useRef } from 'react'
import { useAppContext } from '../context/AppContext'
import { useState } from 'react'
import { assets } from '../assets/assets'
import Message from './Message'
import { generateResponse } from '../utils/responseGenerator'
import { createTypingAnimation } from '../utils/typingAnimation'

const ChatBox = () => {
  const { chats, theme } = useAppContext()
  const [messages, setMessages] = useState([])
  const [Loading, setLoading] = useState(false)
  const [isTypingComplete, setIsTypingComplete] = useState(false)
  const messagesEndRef = useRef(null)
  const shouldStopTypingRef = useRef(false)
  const [prompt, setPrompt] = useState('')
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploadSuccess, setUploadSuccess] = useState('')
  const scrollContainerRef = useRef(null)
  const isTypingRef = useRef(false)
  const lastMessageCountRef = useRef(0)
  const fileInputRef = useRef(null)
  const textareaRef = useRef(null)
  const abortControllerRef = useRef(null)

  // Auto-scroll to bottom when messages change (used by scroll button)
  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
      }
    }, 50)
  }

  // Handle scroll position to show/hide button
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
      setShowScrollButton(!isNearBottom)
    }
  }

  // Smooth auto-scroll during typing - only if user is near bottom
  useEffect(() => {
    if (messages.length > lastMessageCountRef.current) {
      // New message detected
      if (scrollContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 50

        // Only auto-scroll if user is near bottom (not manually scrolled up)
        if (isNearBottom || isTypingRef.current) {
          requestAnimationFrame(() => {
            if (scrollContainerRef.current) {
              scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
            }
          })
        }
      }
    }
    lastMessageCountRef.current = messages.length
  }, [messages.length])

  // Smooth scroll during typing animation
  useEffect(() => {
    if (!isTypingRef.current) return

    let rafId
    const smoothScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 50

        if (isNearBottom) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
        }
      }

      if (isTypingRef.current) {
        rafId = requestAnimationFrame(smoothScroll)
      }
    }

    rafId = requestAnimationFrame(smoothScroll)
    return () => cancelAnimationFrame(rafId)
  }, [messages])

  // Mock backend handler for PDF analysis
  const simulatePDFAnalysis = async (file, prompt) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => {
        setTimeout(() => {
          const fileSize = file.size
          const fileName = file.name

          const analysisContent = `## PDF Analysis Report: ${fileName}\n\n**File Details:** ${fileName} (${(fileSize / 1024).toFixed(2)} KB)\n\n${prompt ? `**Question:** ${prompt}\n\n` : ''}**Analysis:** Document processed and ready for analysis. Connect to your backend API for detailed pharmaceutical insights.`

          resolve({
            content: analysisContent,
            charts: []
          })
        }, 1500)
      }
      reader.readAsArrayBuffer(file)
    })
  }

  const onSubmit = async (e, overridePrompt = null) => {
    e.preventDefault()
    // Trim spaces and check if message is empty
    const textToSubmit = overridePrompt || prompt
    const trimmedPrompt = textToSubmit.trim()
    const hasFile = uploadedFile !== null

    // If no prompt and no file, return
    if (!trimmedPrompt && !hasFile) return

    // Add user message
    const userMessage = {
      role: 'user',
      content: trimmedPrompt || `[Analyzing PDF: ${uploadedFile?.name}]`,
      timestamp: Date.now(),
      isImage: false,
      isPublished: false,
      file: hasFile ? uploadedFile : null
    }

    setMessages(prev => [...prev, userMessage])
    setPrompt('')
    setUploadedFile(null)

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    setLoading(true)
    setIsTypingComplete(false)
    shouldStopTypingRef.current = false

    // Handle PDF file analysis
    if (hasFile) {
      try {
        const { content: pdfContent, charts: pdfCharts } = await simulatePDFAnalysis(uploadedFile, trimmedPrompt)

        // Create AI message with PDF analysis
        const aiMessage = {
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
          isImage: false,
          isPublished: false,
          isComplete: false,
          charts: pdfCharts,
          expectedCharts: pdfCharts.length
        }

        setMessages(prev => [...prev, aiMessage])

        // Use typing animation utility
        const animator = createTypingAnimation(pdfContent, pdfCharts, {
          onUpdate: (currentText) => {
            setMessages(prev => prev.map((msg, idx) =>
              idx === prev.length - 1
                ? { ...msg, content: currentText }
                : msg
            ))
          },
          onComplete: (finalText, charts) => {
            setMessages(prev => {
              const updated = [...prev]
              if (updated.length > 0) {
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: finalText,
                  charts: charts,
                  isComplete: true
                }
              }
              return updated
            })
            isTypingRef.current = false
            setLoading(false)
            setIsTypingComplete(true)
          },
          shouldStopRef: shouldStopTypingRef,
          typingSpeedMs: 15
        })

        isTypingRef.current = true
        animator.start()
      } catch (error) {
        console.error('PDF analysis error:', error)
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: 'Error analyzing PDF. Please try again.',
            timestamp: Date.now(),
            isImage: false,
            isPublished: false
          }
        ])
        setLoading(false)
        setIsTypingComplete(true)
      }
      return
    }

    // Generate AI response using ResponseGenerator
    const startTypingAnimation = async () => {
      try {
        // Create new AbortController for this request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort()
        }
        abortControllerRef.current = new AbortController()

        const { content: fullContent, charts, pdf } = await generateResponse(trimmedPrompt, abortControllerRef.current.signal)

        // Reset abort controller after success
        abortControllerRef.current = null;

        // Create AI message with empty content initially
        const aiMessage = {
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
          isImage: false,
          isPublished: false,
          isComplete: false,
          charts: [],
          expectedCharts: Array.isArray(charts) ? charts.length : 0,
          pdf: pdf // Store backend PDF
        }

        setMessages(prev => [...prev, aiMessage])

        // Use typing animation utility
        const animator = createTypingAnimation(fullContent, charts, {
          onUpdate: (currentText) => {
            setMessages(prev => prev.map((msg, idx) =>
              idx === prev.length - 1
                ? { ...msg, content: currentText }
                : msg
            ))
          },
          onComplete: (finalText, charts) => {
            setMessages(prev => {
              const updated = [...prev]
              if (updated[updated.length - 1]) {
                updated[updated.length - 1].content = finalText
                updated[updated.length - 1].isComplete = true
                updated[updated.length - 1].charts = charts
                updated[updated.length - 1].pdf = pdf // Ensure PDF is saved
              }
              return updated
            })
            isTypingRef.current = false
            setLoading(false)
            setIsTypingComplete(true)
          },
          shouldStopRef: shouldStopTypingRef,
          typingSpeedMs: 15
        })

        isTypingRef.current = true
        animator.start()
      } catch (error) {
        // Ignore abort errors (user stopped)
        if (error.name === 'AbortError') {
          console.log('Request aborted by user');
          setLoading(false)
          setIsTypingComplete(true)
          return;
        }

        console.error('Error generating response:', error)

        // Update the last message (which was the empty placeholder) with the error text
        setMessages(prev => {
          const updated = [...prev]
          const lastIdx = updated.length - 1
          if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
            updated[lastIdx] = {
              ...updated[lastIdx],
              ...updated[lastIdx],
              content: `Error generating response: ${error.message || 'Unknown error'}. \n\nCheck console for details.`,
              isComplete: true
            }
          } else {
            // If for some reason the placeholder isn't there, append new
            updated.push({
              role: 'assistant',
              content: `Error generating response: ${error.message || 'Unknown error'}.`,
              timestamp: Date.now(),
              isImage: false,
              isPublished: false,
              isComplete: true
            })
          }
          return updated
        })

        setLoading(false)
        setIsTypingComplete(true)
      }
    }

    // Start animation after delay
    setTimeout(startTypingAnimation, 1000)
  }

  const handleRegenerateResponse = async (userPromptText) => {
    // Regenerate the response without adding user message
    setLoading(true)
    setIsTypingComplete(false)
    shouldStopTypingRef.current = false

    const startRegeneration = async () => {
      try {
        const { content: fullContent, charts } = await generateResponse(userPromptText)

        const aiMessage = {
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
          isImage: false,
          isPublished: false,
          isComplete: false,
          charts: [],
          expectedCharts: Array.isArray(charts) ? charts.length : 0
        }

        setMessages(prev => [...prev, aiMessage])

        // Use typing animation utility
        const animator = createTypingAnimation(fullContent, charts, {
          onUpdate: (currentText) => {
            setMessages(prev => prev.map((msg, idx) =>
              idx === prev.length - 1
                ? { ...msg, content: currentText }
                : msg
            ))
          },
          onComplete: (finalText, charts) => {
            setMessages(prev => {
              const updated = [...prev]
              updated[updated.length - 1].isComplete = true
              updated[updated.length - 1].charts = charts
              return updated
            })
            isTypingRef.current = false
            setLoading(false)
            setIsTypingComplete(true)
          },
          shouldStopRef: shouldStopTypingRef,
          typingSpeedMs: 15
        })

        isTypingRef.current = true
        animator.start()
      } catch (error) {
        console.error('Error regenerating response:', error)
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: 'Error regenerating response. Please try again.',
            timestamp: Date.now(),
            isImage: false,
            isPublished: false
          }
        ])
        setLoading(false)
        setIsTypingComplete(true)
      }
    }

    setTimeout(startRegeneration, 1000)
  }

  const handleStopTyping = (e) => {
    e.preventDefault()
    shouldStopTypingRef.current = true

    // Abort the network request immediately
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }

    // Mark the last message as complete with whatever text has been typed so far
    setMessages(prev => {
      const updated = [...prev]
      if (updated[updated.length - 1]) {
        updated[updated.length - 1].isComplete = true
        // If it was stuck loading (no content yet), add a message
        if (!updated[updated.length - 1].content) {
          updated[updated.length - 1].content = "[Stopped by user]"
        }
      }
      return updated
    })
    setLoading(false)
    setIsTypingComplete(true)
    isTypingRef.current = false
  }

  useEffect(() => {
    if (chats && chats.length > 0) {
      setMessages(chats[0].messages || [])
    } else {
      setMessages([])
    }
    setIsTypingComplete(true)
  }, [chats])

  return (
    <div className='flex-1 flex flex-col justify-between p-5 md:p-10 max-md:pt-20 2xl:pr-40 h-full overflow-hidden bg-white dark:bg-transparent'>
      {/* chat messages */}
      <div
        className='flex-1 mb-5 overflow-y-scroll scrollbar-thin scrollbar-track-gray-50 dark:scrollbar-track-gray-950 scrollbar-thumb-green-500 dark:scrollbar-thumb-green-500 hover:scrollbar-thumb-green-600 dark:hover:scrollbar-thumb-green-400 pr-3 relative messages-container'
        style={{ scrollbarGutter: 'stable', overflowAnchor: 'none' }}
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        {messages.length === 0 && (
          <div className='h-full flex flex-col items-center justify-center gap-1 text-primary'>
            <img
              src={theme === 'dark' ? assets.logo_full : assets.logo_full_dark}
              alt='no-messages'
              className='w-full max-w-56 sm:max-w-68 pointer-events-none'
            />
            <p className='text-4xl sm:text-6xl text-centre text-gray-700 dark:text-white'>
              Start Your Research
            </p>
            <p className='text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-md text-center'>
              Ask questions, analyze data, and discover insights. Type your query below to begin.
            </p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map((message, index) => {
            // Find the previous user message for regenerate button
            let previousUserMessage = null
            for (let i = index - 1; i >= 0; i--) {
              if (messages[i].role === 'user') {
                previousUserMessage = messages[i].content
                break
              }
            }

            const onRegenerate = previousUserMessage
              ? () => handleRegenerateResponse(previousUserMessage)
              : null

            return (
              <Message
                key={message.id ?? `${message.timestamp}-${message.role}`}
                message={message}
                onRegenerate={onRegenerate}
                isLoading={Loading}
              />
            )
          })}
        </div>

        {Loading && (
          <div className='loader flex items-center gap-1.5 mt-2'>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-700 dark:bg-white animate-bounce'></div>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-700 dark:bg-white animate-bounce'></div>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-700 dark:bg-white animate-bounce'></div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* File Indicator - Outside and Above */}
      {uploadedFile && (
        <div className='md:max-w-2xl lg:max-w-3xl mx-auto p-2 mb-2 flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700/50 w-fit'>
          <img src={theme === 'dark' ? assets.file_icon_dark : assets.file_icon} className='w-4 h-4 shrink-0' alt='file' />
          <span className='text-xs text-blue-700 dark:text-blue-300 truncate font-medium'>{uploadedFile.name}</span>
          <button
            type='button'
            onClick={() => {
              setUploadedFile(null)
              if (fileInputRef.current) fileInputRef.current.value = ''
            }}
            className='p-1 hover:bg-blue-100 dark:hover:bg-blue-800/50 rounded transition ml-2 shrink-0'
            title='Remove file'
          >
            <img src={theme === 'dark' ? assets.close_icon : assets.close_dark} className='w-3 h-3' alt='close' />
          </button>
        </div>
      )}

      {/* Suggested Queries Chips - ONLY SHOW WHEN NO MESSAGES */}
      {messages.length === 0 && !Loading && (
        <div className='flex flex-wrap justify-center gap-2 mb-4 px-4 w-full md:max-w-4xl mx-auto'>
          {[
            "Market outlook for Metformin",
            "Patent timeline for Lisinopril",
            "Clinical trials for Atorvastatin",
            "Import-export data for Omeprazole",
            "Revenue forecast for Amlodipine",
            "Top competitors for Sertraline",
            "Supply chain risks for Albuterol",
            "Regulatory updates for Levothyroxine"
          ].map((query, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPrompt(query)
                // Small timeout to ensure state update before submit
                setTimeout(() => {
                  const fakeEvent = { preventDefault: () => { } }
                  onSubmit(fakeEvent, query)
                }, 0)
              }}
              className='px-3 py-1.5 text-xs sm:text-sm font-medium border rounded-full transition-all shadow-sm backdrop-blur-md
                bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-violet-300
                dark:bg-violet-600/20 dark:text-violet-100 dark:border-violet-500/30 dark:hover:bg-violet-600/40 dark:hover:border-violet-400/50'
            >
              {query}
            </button>
          ))}
        </div>
      )}

      <div className='relative'>
        {/* Scroll to bottom button - positioned relative to form */}
        {showScrollButton && !Loading && (
          <button
            onClick={scrollToBottom}
            className='absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500 text-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 z-40'
            title='Scroll to bottom'
          >
            <svg
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <polyline points='6 9 12 15 18 9'></polyline>
            </svg>
          </button>
        )}

        <form
          className='bg-green-50 dark:bg-green-900/30 border border-green-600 dark:border-green-700/50 rounded-lg w-full md:max-w-2xl lg:max-w-3xl p-2 mx-auto flex flex-col gap-2 shrink-0 self-center'
          onSubmit={onSubmit}
        >
          <div className='flex gap-2 items-end'>
            <label className='flex items-center justify-center p-2 rounded transition-colors shrink-0 cursor-pointer hover:bg-green-100 dark:hover:bg-green-700/50' title='Upload PDF'>
              <input
                ref={fileInputRef}
                type='file'
                accept='.pdf'
                className='hidden'
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file && file.type === 'application/pdf') {
                    // Store file info for sending with prompt
                    setUploadedFile(file)
                    // Show success message
                    setUploadSuccess(`✓ ${file.name} uploaded`)
                    setTimeout(() => setUploadSuccess(''), 2000)
                  }
                }}
              />
              <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className='text-green-600 dark:text-green-400'>
                <line x1='12' y1='5' x2='12' y2='19'></line>
                <line x1='5' y1='12' x2='19' y2='12'></line>
              </svg>
            </label>

            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                // Enter to send, Shift+Enter for new line (but don't send if Loading)
                if (e.key === 'Enter' && !e.shiftKey && !Loading) {
                  e.preventDefault()
                  onSubmit(e)
                }
              }}
              placeholder={Loading ? 'Waiting for response...' : uploadedFile ? `Prompt for: ${uploadedFile.name}...` : 'Type your prompt here...'}
              className='flex-1 text-sm outline-none resize-none bg-transparent max-h-40 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-green-600 dark:scrollbar-thumb-green-700 px-3 py-2 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400'
              rows='1'
              onInput={(e) => {
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
              }}
            />

            {!Loading && (
              <button
                type='submit'
                className='flex items-center justify-center p-2 rounded transition-colors shrink-0 self-end mb-1 hover:bg-green-100 dark:hover:bg-green-700/50'
              >
                <img src={assets.send_icon} className='w-6 h-6 cursor-pointer' alt='send' />
              </button>
            )}

            {Loading && (
              <button
                type='button'
                onClick={handleStopTyping}
                className='flex items-center justify-center p-2 rounded transition-colors shrink-0 self-end mb-1 hover:bg-red-100 dark:hover:bg-red-700/50'
              >
                <img src={assets.stop_icon} className='w-6 h-6 cursor-pointer' alt='stop' />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Upload Success Message */}
      {uploadSuccess && (
        <div className={`mt-2 mx-auto max-w-2xl lg:max-w-3xl px-2 py-2 rounded-lg text-center text-sm font-medium transition-opacity duration-300 ${theme === 'dark'
          ? 'bg-green-900/30 text-green-300 border border-green-700/50'
          : 'bg-green-100 text-green-700 border border-green-300'
          }`}>
          {uploadSuccess}
        </div>
      )}
    </div>
  )
}

export default ChatBox
