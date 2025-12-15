// Message.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { assets } from '../assets/assets'
import Markdown from 'react-markdown'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { Bar, Pie } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

const Message = ({ message, onRegenerate, isLoading = false }) => {
  const [isTypingComplete, setIsTypingComplete] = useState(false)
  const messageRef = useRef(null)

  // Mark typing as complete when content is fully populated
  useEffect(() => {
    if (message.role !== 'assistant') return

    // Prefer explicit completion flag; fallback for legacy messages with no flag
    if (message.isComplete === true) {
      setIsTypingComplete(true)
    } else if (message.isComplete === false) {
      setIsTypingComplete(false)
    } else if (message.content && message.content.length > 0) {
      // Legacy/static assistant messages without streaming still allow download
      setIsTypingComplete(true)
    } else {
      setIsTypingComplete(false)
    }
  }, [message.role, message.isComplete, message.content])

  const formatTimeIST = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const parseMarkdownToPDF = (content) => {
    // Parse markdown content into structured objects
    const lines = content.split('\n')
    const parsed = []

    lines.forEach(line => {
      if (line.startsWith('# ')) {
        parsed.push({ type: 'h1', text: line.substring(2) })
      } else if (line.startsWith('## ')) {
        parsed.push({ type: 'h2', text: line.substring(3) })
      } else if (line.startsWith('### ')) {
        parsed.push({ type: 'h3', text: line.substring(4) })
      } else if (line.startsWith('- ')) {
        parsed.push({ type: 'bullet', text: line.substring(2) })
      } else if (line.startsWith('* ')) {
        parsed.push({ type: 'bullet', text: line.substring(2) })
      } else if (line.trim() === '') {
        parsed.push({ type: 'space' })
      } else {
        // Process inline markdown (bold, italic)
        parsed.push({ type: 'paragraph', text: line })
      }
    })

    return parsed
  }

  const downloadPDF = async () => {
    // If backend provided a PDF, use it
    if (message.pdf) {
      try {
        const link = document.createElement('a');
        link.href = `data:application/pdf;base64,${message.pdf}`;
        link.download = `PharmaPilot-Research-${new Date().getTime()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      } catch (e) {
        console.error("Error downloading backend PDF, falling back to client generation", e);
      }
    }

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 20
      const contentWidth = pageWidth - 2 * margin
      let yPosition = margin
      const lineHeight = 5.5

      // Header - PharmaPilot Title
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(18)
      pdf.text('PharmaPilot Research Response', pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 10

      // Subtitle
      pdf.setFont('helvetica', 'italic')
      pdf.setFontSize(12)
      pdf.text('AI-Generated Pharmaceutical Research Document', pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 14

      // Metadata Section
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(8)
      const today = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
      const timeIST = formatTimeIST(message.timestamp)
      pdf.text(`Date: ${today} | Time: ${timeIST}`, margin, yPosition)
      yPosition += 6
      pdf.text(`Document Type: Research Response | Format: PDF`, margin, yPosition)
      yPosition += 10

      // Horizontal line
      pdf.setDrawColor(100, 100, 100)
      pdf.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 10

      // Parse markdown content
      const parsedContent = parseMarkdownToPDF(message.content)

      // Render each parsed element
      parsedContent.forEach(item => {
        // Check page break with better margins
        if (yPosition > pageHeight - margin - 20) {
          pdf.addPage()
          yPosition = margin
        }

        if (item.type === 'h1') {
          pdf.setFont('helvetica', 'bold')
          pdf.setFontSize(14)
          pdf.setTextColor(0, 102, 0)
          const lines = pdf.splitTextToSize(item.text, contentWidth)
          lines.forEach(line => {
            if (yPosition > pageHeight - margin - 20) {
              pdf.addPage()
              yPosition = margin
            }
            pdf.text(line, margin, yPosition)
            yPosition += lineHeight + 1
          })
          pdf.setTextColor(0, 0, 0)
          yPosition += 3

        } else if (item.type === 'h2') {
          pdf.setFont('helvetica', 'bold')
          pdf.setFontSize(12)
          pdf.setTextColor(0, 102, 0)
          const lines = pdf.splitTextToSize(item.text, contentWidth)
          lines.forEach(line => {
            if (yPosition > pageHeight - margin - 20) {
              pdf.addPage()
              yPosition = margin
            }
            pdf.text(line, margin, yPosition)
            yPosition += lineHeight
          })
          pdf.setTextColor(0, 0, 0)
          yPosition += 2

        } else if (item.type === 'h3') {
          pdf.setFont('helvetica', 'bold')
          pdf.setFontSize(11)
          pdf.setTextColor(51, 51, 51)
          const lines = pdf.splitTextToSize(item.text, contentWidth)
          lines.forEach(line => {
            if (yPosition > pageHeight - margin - 20) {
              pdf.addPage()
              yPosition = margin
            }
            pdf.text(line, margin, yPosition)
            yPosition += lineHeight
          })
          pdf.setTextColor(0, 0, 0)
          yPosition += 1.5

        } else if (item.type === 'bullet') {
          pdf.setFont('helvetica', 'normal')
          pdf.setFontSize(10)
          pdf.setTextColor(0, 0, 0)

          // Clean the text: remove markdown bold/italic markers
          let cleanText = item.text
            .replace(/\*\*([^\*]+)\*\*/g, '$1')  // remove ** bold **
            .replace(/\*([^\*]+)\*/g, '$1')      // remove * italic *
            .replace(/__([^_]+)__/g, '$1')       // remove __ bold __
            .replace(/_([^_]+)_/g, '$1')         // remove _ italic _

          const bulletLines = pdf.splitTextToSize(cleanText, contentWidth - 8)
          bulletLines.forEach((line, idx) => {
            if (yPosition > pageHeight - margin - 20) {
              pdf.addPage()
              yPosition = margin
            }
            if (idx === 0) {
              pdf.text('• ' + line, margin + 2, yPosition)
            } else {
              pdf.text(line, margin + 5, yPosition)
            }
            yPosition += lineHeight
          })
          yPosition += 1

        } else if (item.type === 'paragraph') {
          pdf.setFontSize(10)
          pdf.setTextColor(0, 0, 0)
          pdf.setFont('helvetica', 'normal')

          // Split paragraph into lines
          const paragraphLines = pdf.splitTextToSize(item.text, contentWidth)
          paragraphLines.forEach(line => {
            if (yPosition > pageHeight - margin - 20) {
              pdf.addPage()
              yPosition = margin
            }

            const boldParts = line.split(/(\*\*[^\*]+\*\*)/g)
            let xPos = margin
            const measure = (txt) => pdf.getTextWidth(txt)

            boldParts.forEach(boldPart => {
              if (boldPart.startsWith('**') && boldPart.endsWith('**')) {
                // Bold text
                pdf.setFont('helvetica', 'bold')
                const boldText = boldPart.slice(2, -2)
                pdf.text(boldText, xPos, yPosition)
                xPos += measure(boldText)
                pdf.setFont('helvetica', 'normal')
              } else if (boldPart.startsWith('_') && boldPart.endsWith('_')) {
                // Italic text
                pdf.setFont('helvetica', 'italic')
                const italicText = boldPart.slice(1, -1)
                pdf.text(italicText, xPos, yPosition)
                xPos += measure(italicText)
                pdf.setFont('helvetica', 'normal')
              } else if (boldPart.startsWith('*') && boldPart.endsWith('*') && !boldPart.startsWith('**')) {
                // Italic text (single asterisk)
                pdf.setFont('helvetica', 'italic')
                const italicText = boldPart.slice(1, -1)
                pdf.text(italicText, xPos, yPosition)
                xPos += measure(italicText)
                pdf.setFont('helvetica', 'normal')
              } else if (boldPart) {
                // Normal text
                pdf.setFont('helvetica', 'normal')
                pdf.text(boldPart, xPos, yPosition)
                xPos += measure(boldPart)
              }
            })

            yPosition += lineHeight
          })
          yPosition += 2

        } else if (item.type === 'space') {
          yPosition += 3
        }
      })

      // Add charts to PDF after text
      const charts = message.charts || []
      if (Array.isArray(charts) && charts.length > 0) {
        yPosition += 5

        for (const chart of charts) {
          if (!chart || !Array.isArray(chart.labels) || !Array.isArray(chart.values)) continue

          // Check page break (vertical charts need more space)
          if (yPosition > pageHeight - margin - 120) {
            pdf.addPage()
            yPosition = margin
          }

          // Calculate chart area dimensions (vertical/column format)
          const chartAreaX = margin
          const chartAreaY = yPosition
          const chartAreaWidth = contentWidth
          const chartAreaHeight = 80

          // Draw border around entire chart area
          pdf.setDrawColor(100, 100, 100)
          pdf.setLineWidth(0.5)
          pdf.rect(chartAreaX, chartAreaY, chartAreaWidth, chartAreaHeight)

          // Chart title inside border
          if (chart.title) {
            pdf.setFont('helvetica', 'bold')
            pdf.setFontSize(11)
            pdf.setTextColor(0, 102, 0)
            pdf.text(chart.title, chartAreaX + 3, chartAreaY + 4)
          }

          // Vertical column chart in PDF
          const contentStartY = chartAreaY + 8
          const contentAreaHeight = chartAreaHeight - 10

          const maxValue = Math.max(...chart.values, 1)
          const numColumns = chart.labels.length
          const columnSpacing = chartAreaWidth / (numColumns + 1)
          const columnX = columnSpacing
          const maxColumnHeight = contentAreaHeight - 8 // Leave space for labels below
          const columnWidth = (columnSpacing * 0.7) / 1.5

          chart.labels.forEach((label, idx) => {
            const value = chart.values[idx]
            const percentage = (value / maxValue) * 100
            const columnHeight = (maxColumnHeight * percentage) / 100
            const xPos = chartAreaX + columnX + idx * columnSpacing
            const yPos = contentStartY + maxColumnHeight - columnHeight

            // Column fill color
            const barColors = [
              [59, 130, 246],      // blue
              [34, 197, 94],       // green
              [239, 68, 68],       // red
              [251, 191, 36]       // amber
            ]
            const colorIdx = idx % barColors.length
            const [r, g, b] = barColors[colorIdx]
            pdf.setFillColor(r, g, b)
            pdf.setDrawColor(r - 30, g - 30, b - 30)
            pdf.setLineWidth(0.3)
            pdf.rect(xPos - columnWidth / 2, yPos, columnWidth, columnHeight, 'FD')

            // Value text above column
            pdf.setFont('helvetica', 'bold')
            pdf.setFontSize(7)
            pdf.setTextColor(0, 0, 0)
            pdf.text(String(value), xPos, yPos - 2)

            // Label below column
            pdf.setFont('helvetica', 'normal')
            pdf.setFontSize(7)
            pdf.setTextColor(0, 0, 0)
            const labelLines = pdf.splitTextToSize(label, columnWidth + 2)
            if (labelLines.length > 0) {
              pdf.text(labelLines[0], xPos - columnWidth / 2 - 1, contentStartY + maxColumnHeight + 3)
            }
          })

          yPosition = chartAreaY + chartAreaHeight + 3
        }
      }

      // Footer
      pdf.setFont('helvetica', 'italic')
      pdf.setFontSize(8)
      pdf.setTextColor(100, 100, 100)
      pdf.text(`Generated by PharmaPilot AI | ${today}`, pageWidth / 2, pageHeight - 10, { align: 'center' })

      // Download PDF
      const fileName = `PharmaPilot-Research-${new Date().getTime()}.pdf`
      pdf.save(fileName)
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
  }

  // Bar chart using chart.js for built-in hover tooltips (single color per chart)
  const BarChartCard = ({ chart, index }) => {
    if (!chart || !Array.isArray(chart.labels) || !Array.isArray(chart.values)) return null

    const labels = chart.labels
    const values = chart.values

    // Single color palette (one color per chart type)
    const chartColors = [
      { bg: 'rgba(59, 130, 246, 0.7)', border: 'rgba(37, 99, 235, 1)', hover: 'rgba(37, 99, 235, 1)' },      // blue
      { bg: 'rgba(34, 197, 94, 0.7)', border: 'rgba(22, 163, 74, 1)', hover: 'rgba(22, 163, 74, 1)' },      // green
      { bg: 'rgba(239, 68, 68, 0.7)', border: 'rgba(220, 38, 38, 1)', hover: 'rgba(220, 38, 38, 1)' },      // red
      { bg: 'rgba(251, 191, 36, 0.7)', border: 'rgba(245, 158, 11, 1)', hover: 'rgba(245, 158, 11, 1)' }    // amber
    ]

    const colorIdx = index % chartColors.length
    const color = chartColors[colorIdx]

    const data = useMemo(() => ({
      labels,
      datasets: [
        {
          label: chart.subtitle || 'Values',
          data: values,
          backgroundColor: color.bg,
          borderColor: color.border,
          borderWidth: 1.5,
          hoverBackgroundColor: color.hover
        }
      ]
    }), [labels, values, chart.subtitle, color])

    const options = useMemo(() => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: chart.title ? { display: true, text: chart.title } : undefined,
        tooltip: {
          backgroundColor: '#0f172a',
          borderColor: '#22c55e',
          borderWidth: 1,
          callbacks: {
            label: (ctx) => `${ctx.label}: ${ctx.parsed.y ?? ctx.parsed.x}`
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#6b7280', font: { size: 11 } },
          grid: { display: false }
        },
        y: {
          ticks: { color: '#6b7280', font: { size: 11 } },
          grid: { color: 'rgba(148, 163, 184, 0.2)' },
          beginAtZero: true
        }
      }
    }), [chart.title])

    const [visible, setVisible] = useState(false)

    useEffect(() => {
      const raf = requestAnimationFrame(() => setVisible(true))
      return () => cancelAnimationFrame(raf)
    }, [])

    return (
      <div className='rounded border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-900 shadow-sm'>
        <div className='flex items-center justify-between mb-2'>
          <div className='text-sm font-semibold text-gray-800 dark:text-gray-100'>{chart.title || 'Chart'}</div>
          {chart.subtitle && <div className='text-xs text-gray-500 dark:text-gray-400'>{chart.subtitle}</div>}
        </div>
        <div className='h-64' style={{ opacity: visible ? 1 : 0, transition: 'opacity 220ms ease' }}>
          <Bar data={data} options={options} />
        </div>
      </div>
    )
  }

  // Pie chart using chart.js
  const PieChartCard = ({ chart, index }) => {
    if (!chart || !Array.isArray(chart.labels) || !Array.isArray(chart.values)) return null

    const labels = chart.labels
    const values = chart.values

    // Multi-color palette for pie slices
    const pieColors = [
      'rgba(59, 130, 246, 0.8)',    // blue
      'rgba(239, 68, 68, 0.8)',     // red
      'rgba(34, 197, 94, 0.8)',     // green
      'rgba(251, 191, 36, 0.8)',    // amber
      'rgba(168, 85, 247, 0.8)',    // purple
      'rgba(236, 72, 153, 0.8)',    // pink
      'rgba(14, 165, 233, 0.8)',    // sky
      'rgba(249, 115, 22, 0.8)',    // orange
      'rgba(6, 182, 212, 0.8)',     // cyan
      'rgba(192, 132, 250, 0.8)'    // violet
    ]

    const data = useMemo(() => ({
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: values.map((_, idx) => pieColors[idx % pieColors.length]),
          borderColor: '#fff',
          borderWidth: 2
        }
      ]
    }), [labels, values])

    const options = useMemo(() => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#6b7280', font: { size: 11 } }
        },
        title: chart.title ? { display: true, text: chart.title } : undefined,
        tooltip: {
          backgroundColor: '#0f172a',
          borderColor: '#22c55e',
          borderWidth: 1,
          callbacks: {
            label: (ctx) => `${ctx.label}: ${ctx.parsed}`
          }
        }
      }
    }), [chart.title])

    const [visible, setVisible] = useState(false)

    useEffect(() => {
      const raf = requestAnimationFrame(() => setVisible(true))
      return () => cancelAnimationFrame(raf)
    }, [])

    return (
      <div className='rounded border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-900 shadow-sm'>
        <div className='flex items-center justify-between mb-2'>
          <div className='text-sm font-semibold text-gray-800 dark:text-gray-100'>{chart.title || 'Chart'}</div>
          {chart.subtitle && <div className='text-xs text-gray-500 dark:text-gray-400'>{chart.subtitle}</div>}
        </div>
        <div className='h-96' style={{ opacity: visible ? 1 : 0, transition: 'opacity 220ms ease' }}>
          <Pie data={data} options={options} />
        </div>
      </div>
    )
  }

  // Smart chart renderer - determines chart type from data structure
  const ChartCard = ({ chart, index }) => {
    if (!chart) return null

    // If chart has a type property, use it; otherwise auto-detect
    const chartType = chart.type || 'bar'

    if (chartType === 'pie') {
      return <PieChartCard chart={chart} index={index} />
    }
    return <BarChartCard chart={chart} index={index} />
  }

  // Normalize attachments from backend
  const charts = message.charts || message.chartData || []
  const expectedCharts = message.expectedCharts || 0
  const images = message.images || message.imageUrls || []
  const links = message.links || []

  const renderMarkdown = (content) => (
    <Markdown
      components={{
        a: ({ node, ...props }) => (
          <a
            {...props}
            target='_blank'
            rel='noreferrer noopener'
            className='text-emerald-600 dark:text-emerald-300 underline'
          />
        )
      }}
    >
      {content}
    </Markdown>
  )

  return (
    <div>
      {message.role === 'user' ? (
        <div className='flex items-start justify-end my-4 gap-2'>
          <div className='flex flex-col gap-2 p-2 px-4 bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-700/50 rounded-md w-full max-w-2xl wrap-break-word'>
            <p className='text-sm dark:text-green-100 text-gray-800 whitespace-pre-wrap wrap-break-word'>
              {message.content}
            </p>
            <span className='text-xs text-gray-400 dark:text-green-300'>
              {formatTimeIST(message.timestamp)}
            </span>
          </div>
          <img src={assets.user_icon} alt='user icon' className='w-8 rounded-full shrink-0' />
        </div>
      ) : (
        <div className='flex flex-col gap-2 w-full max-w-2xl my-4 wrap-break-word'>
          {message.isImage ? (
            <img src={message.content} alt='AIgenerated' className='w-full max-w-md mt-2 rounded-md' />
          ) : (
            <div
              ref={messageRef}
              id={`message-${message.timestamp}`}
              className='bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700/60 shadow-sm p-3 text-sm text-black dark:text-gray-50 reset-tw overflow-hidden flex flex-col gap-3'
              style={{
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                width: '100%',
                contain: 'layout style paint'
              }}
            >
              <div style={{ width: '100%', minHeight: '1px' }}>
                {renderMarkdown(message.content)}
              </div>

              {/* Render charts with smooth transition - placeholders fade out as charts appear */}
              {expectedCharts > 0 && (
                <div
                  className='flex flex-col gap-3'
                  style={{
                    contain: 'layout style paint',
                    transition: 'opacity 300ms ease'
                  }}
                >
                  {Array.from({ length: expectedCharts }).map((_, i) => {
                    const hasChart = Array.isArray(charts) && charts[i]
                    return (
                      <div key={`chart-${i}`} style={{ position: 'relative', minHeight: 280 }}>
                        {/* Placeholder (fades out when chart arrives) */}
                        {!hasChart && (
                          <div
                            className='absolute inset-0 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 animate-pulse'
                            style={{
                              opacity: !message.isComplete ? 1 : 0,
                              transition: 'opacity 300ms ease',
                              pointerEvents: 'none'
                            }}
                          />
                        )}
                        {/* Chart (fades in when ready) */}
                        {hasChart && <ChartCard chart={charts[i]} index={i} />}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Render images if provided separately */}
              {Array.isArray(images) && images.length > 0 && (
                <div className='grid gap-3 sm:grid-cols-2'>
                  {images.map((src, idx) => (
                    <img
                      key={idx}
                      src={src}
                      alt={`attachment-${idx}`}
                      className='w-full rounded-md border border-gray-200 dark:border-gray-700'
                    />
                  ))}
                </div>
              )}

              {/* Render extra links if provided separately */}
              {Array.isArray(links) && links.length > 0 && (
                <div className='flex flex-col gap-1 text-sm'>
                  {links.map((lnk, idx) => (
                    <a
                      key={idx}
                      href={lnk.url || lnk}
                      target='_blank'
                      rel='noreferrer noopener'
                      className='text-emerald-600 dark:text-emerald-300 underline break-all'
                    >
                      {lnk.title || lnk.url || lnk}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className='flex items-center gap-3 mt-2'>
            <span className='text-xs text-gray-500 px-1'>
              {formatTimeIST(message.timestamp)}
            </span>
            {!message.isImage && isTypingComplete && (
              <>
                <button
                  onClick={downloadPDF}
                  disabled={isLoading}
                  className={`transition-all duration-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-lg'}`}
                  title={isLoading ? 'Disabled while message is typing' : 'Download as Research Paper PDF'}
                >
                  <img src={assets.download_icon} alt='download' className='h-7 w-auto' />
                </button>

                {onRegenerate && (
                  <button
                    onClick={onRegenerate}
                    disabled={isLoading}
                    className={`transition-all duration-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-lg'}`}
                    title={isLoading ? 'Disabled while message is typing' : 'Regenerate response'}
                  >
                    <svg
                      width='28'
                      height='28'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <path d='M21.5 2v6h-6' />
                      <path d='M2.5 22v-6h6' />
                      <path d='M2 11.5a10 10 0 0 1 18.8-4.3' />
                      <path d='M22 12.5a10 10 0 0 1-18.8 4.2' />
                    </svg>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Message
