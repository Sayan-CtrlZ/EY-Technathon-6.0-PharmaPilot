/**
 * Typing Animation Utility
 * Handles animated text display with typing effect
 */

export const createTypingAnimation = (fullContent, charts, callbacks) => {
  const { onUpdate, onComplete, shouldStopRef, typingSpeedMs = 15 } = callbacks
  
  let currentText = ''
  let wordIndex = 0
  const words = fullContent.split(/(\s+)/)
  const startTime = Date.now()
  let timeoutRef = null

  const advanceTyping = () => {
    if (shouldStopRef.current) return

    const elapsed = Date.now() - startTime
    const expectedIndex = Math.floor(elapsed / typingSpeedMs)

    while (wordIndex < words.length && wordIndex <= expectedIndex) {
      currentText += words[wordIndex]
      wordIndex++

      onUpdate(currentText)
    }

    if (wordIndex < words.length) {
      timeoutRef = setTimeout(
        advanceTyping,
        Math.max(1, typingSpeedMs - (elapsed % typingSpeedMs))
      )
    } else {
      // Typing complete
      onComplete(currentText, charts)
    }
  }

  return {
    start: () => {
      timeoutRef = setTimeout(advanceTyping, typingSpeedMs)
    },
    stop: () => {
      if (timeoutRef) clearTimeout(timeoutRef)
    },
    getTimeoutRef: () => timeoutRef
  }
}
