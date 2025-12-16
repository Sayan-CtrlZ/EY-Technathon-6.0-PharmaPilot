// Message.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { assets } from '../assets/assets'
import Markdown from 'react-markdown'

import jsPDF from 'jspdf'
import remarkGfm from 'remark-gfm'
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
    let inTable = false
    let currentTable = { headers: [], rows: [] }

    lines.forEach((line, index) => {
      let type = 'paragraph'
      let text = line

      // Table detection logic
      if (line.trim().startsWith('|')) {
        if (!inTable) {
          // Check if this is a valid table header (next line has dashes)
          const nextLine = lines[index + 1]
          if (nextLine && nextLine.trim().startsWith('|') && nextLine.includes('---')) {
            inTable = true
            currentTable = { headers: [], rows: [] }

            // Extract headers
            const headerCells = line.split('|').map(c => c.trim()).filter(c => c !== '')
            currentTable.headers = headerCells
            return // Skip adding this line to parsed directly
          }
        }

        if (inTable) {
          // Check if it's the separator line
          if (line.includes('---')) return // Skip separator line

          // Extract row data
          const rowCells = line.split('|').map(c => c.trim()).filter(c => c !== '')
          // cleaned markdown in cells
          const cleanedRow = rowCells.map(cell =>
            cell.replace(/\*\*(.*?)\*\*/g, '$1')
              .replace(/\*(.*?)\*/g, '$1')
          )

          if (cleanedRow.length > 0) {
            currentTable.rows.push(cleanedRow)
          }
          return
        }
      } else if (inTable) {
        // End of table detected
        inTable = false
        if (currentTable.headers.length > 0) {
          parsed.push({ type: 'table', data: currentTable })
        }
      }

      if (line.startsWith('# ')) {
        type = 'h1'
        text = line.substring(2)
      } else if (line.startsWith('## ')) {
        type = 'h2'
        text = line.substring(3)
      } else if (line.startsWith('### ')) {
        type = 'h3'
        text = line.substring(4)
      } else if (line.startsWith('#### ')) {
        type = 'h4'
        text = line.substring(5)
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        type = 'bullet'
        text = line.substring(2)
      } else if (/^\d+\.\s/.test(line)) {
        type = 'numbered_list'
        const match = line.match(/^(\d+\.)\s/)
        const numberPrefix = match ? match[1] : ''
        text = line.substring(match ? match[0].length : 0)

        if (text) {
          text = text.replace(/\*\*(.*?)\*\*/g, '$1')
          text = text.replace(/\*(.*?)\*/g, '$1')
          text = text.replace(/__(.*?)__/g, '$1')
          text = text.replace(/`(.*?)`/g, '$1')
        }

        parsed.push({ type: 'numbered_list', text, prefix: numberPrefix })
        return
      } else if (line.trim() === '') {
        type = 'space'
        text = ''
      }

      if (text) {
        text = text.replace(/\*\*(.*?)\*\*/g, '$1')
        text = text.replace(/\*(.*?)\*/g, '$1')
        text = text.replace(/__(.*?)__/g, '$1')
        text = text.replace(/`(.*?)`/g, '$1')
      }

      const chartMatch = line.match(/\{\{CHART:(\w+)\}\}/)
      if (chartMatch) {
        type = 'chart_token'
        text = chartMatch[1]
      }

      parsed.push({ type, text })
    })

    // Catch table at end of content
    if (inTable && currentTable.headers.length > 0) {
      parsed.push({ type: 'table', data: currentTable })
    }

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

      const parsedContent = parseMarkdownToPDF(message.content)

      const renderedChartIds = new Set()

      // Helper to render a single chart
      const renderChartToPDF = (chart) => {
        if (
          !chart ||
          !Array.isArray(chart.labels) ||
          !Array.isArray(chart.values) ||
          chart.values.length === 0 ||
          chart.values.every(v => v === 0 || v === '0' || v === null)
        ) return

        if (yPosition > pageHeight - margin - 100) {
          pdf.addPage()
          yPosition = margin
        }

        if (chart.title) {
          pdf.setFont('helvetica', 'bold')
          pdf.setFontSize(12)
          pdf.setTextColor(0, 102, 0)
          pdf.text(chart.title, margin, yPosition + 5)
          yPosition += 10

          if (chart.subtitle) {
            pdf.setFont('helvetica', 'italic')
            pdf.setFontSize(10)
            pdf.setTextColor(80, 80, 80)
            pdf.text(chart.subtitle, margin, yPosition)
            yPosition += 6
          }
        }

        const chartAreaX = margin
        const chartAreaY = yPosition
        const chartAreaWidth = contentWidth
        const chartAreaHeight = 80

        pdf.setDrawColor(200, 200, 200)
        pdf.setLineWidth(0.08)
        pdf.rect(chartAreaX, chartAreaY, chartAreaWidth, chartAreaHeight)

        const chartType = (chart.type || '').toLowerCase()

        if (chartType === 'pie' || chartType === 'doughnut') {
          const contentStartY = chartAreaY + 12
          const rowHeight = 8

          chart.labels.forEach((label, idx) => {
            let rawValue = chart.values[idx]
            if (typeof rawValue === 'string') rawValue = rawValue.replace(/%/g, '')
            const value = Number(rawValue) || 0
            const yPos = contentStartY + (idx * rowHeight)

            if (yPos > chartAreaY + chartAreaHeight - 5) return

            const barColors = [
              [59, 130, 246], [34, 197, 94], [239, 68, 68],
              [251, 191, 36], [168, 85, 247], [236, 72, 153]
            ]
            const [r, g, b] = barColors[idx % barColors.length]

            pdf.setFont('helvetica', 'normal')
            pdf.setFontSize(9)
            pdf.setTextColor(0, 0, 0)
            pdf.text(`${label}`, chartAreaX + 5, yPos)

            const percentText = `${value}%`
            const percentWidth = pdf.getTextWidth(percentText)
            pdf.text(percentText, chartAreaX + chartAreaWidth - percentWidth - 5, yPos)

            const barStartX = chartAreaX + 45
            const barEndX = chartAreaX + chartAreaWidth - 25
            const maxBarWidth = barEndX - barStartX

            pdf.setFillColor(240, 240, 240)
            pdf.rect(barStartX, yPos - 2.5, maxBarWidth, 3, 'F')

            const fillWidth = (value / 100) * maxBarWidth
            if (fillWidth > 0) {
              pdf.setFillColor(r, g, b)
              pdf.rect(barStartX, yPos - 2.5, fillWidth, 3, 'F')
            }
          })

        } else {
          const contentStartY = chartAreaY + 12
          const contentAreaHeight = chartAreaHeight - 15
          const maxColumnHeight = contentAreaHeight - 8

          const axisOriginX = chartAreaX + 12
          const axisOriginY = contentStartY + maxColumnHeight
          const axisWidth = contentWidth - 15

          pdf.setDrawColor(200, 200, 200)
          pdf.setLineWidth(0.5)

          pdf.line(axisOriginX, axisOriginY, axisOriginX + axisWidth, axisOriginY)

          pdf.line(axisOriginX, contentStartY, axisOriginX, axisOriginY)

          const maxValue = Math.max(...chart.values, 1)

          const steps = 4
          pdf.setFontSize(7)
          pdf.setTextColor(150, 150, 150)

          for (let i = 0; i <= steps; i++) {
            const stepY = axisOriginY - (i * (maxColumnHeight / steps))
            const stepValue = Math.round((maxValue / steps) * i)

            if (i > 0) {
              pdf.setDrawColor(230, 230, 230)
              pdf.setLineDash([1, 1], 0)
              pdf.line(axisOriginX, stepY, axisOriginX + axisWidth, stepY)
              pdf.setLineDash([], 0)
            }

            pdf.text(String(stepValue), axisOriginX - 2, stepY + 1, { align: 'right' })
          }

          const numColumns = chart.labels.length
          const availableWidth = axisWidth
          const columnSpacing = availableWidth / (numColumns)
          const columnWidth = (columnSpacing * 0.6)

          chart.labels.forEach((label, idx) => {
            const value = Number(chart.values[idx]) || 0
            const percentage = (value / maxValue) * 100
            const columnHeight = (maxColumnHeight * percentage) / 100

            const xPos = axisOriginX + (idx * columnSpacing) + (columnSpacing / 2)
            const yPos = axisOriginY - columnHeight

            // Column fill color
            const barColors = [
              [59, 130, 246], [34, 197, 94], [239, 68, 68], [251, 191, 36]
            ]
            const colorIdx = idx % barColors.length
            const [r, g, b] = barColors[colorIdx]

            if (columnHeight > 0) {
              pdf.setFillColor(r, g, b)
              pdf.setDrawColor(r - 30, g - 30, b - 30)
              pdf.setLineWidth(0.3)
              pdf.rect(xPos - columnWidth / 2, yPos, columnWidth, columnHeight, 'FD')

              // Value text above column
              pdf.setFont('helvetica', 'bold')
              pdf.setFontSize(7)
              pdf.setTextColor(0, 0, 0)
              pdf.text(String(value), xPos, yPos - 2, { align: 'center' })
            }

            // Label below column
            pdf.setFont('helvetica', 'normal')
            pdf.setFontSize(7)
            pdf.setTextColor(80, 80, 80)
            let displayLabel = label
            if (displayLabel.length > 10) displayLabel = displayLabel.substring(0, 8) + '..'
            pdf.text(displayLabel, xPos, axisOriginY + 4, { align: 'center' })
          })
        }

        yPosition = chartAreaY + chartAreaHeight + 8
        renderedChartIds.add(chart.id)
      }

      // Render each parsed element
      parsedContent.forEach(item => {
        // Check page break with better margins
        if (yPosition > pageHeight - margin - 20) {
          pdf.addPage()
          yPosition = margin
        }

        if (item.type === 'chart_token') {
          // Render Inline Chart
          const chartId = item.text
          const chart = (message.charts || []).find(c => c.id === chartId)
          if (chart) {
            yPosition += 5
            renderChartToPDF(chart)
          }

        } else if (item.type === 'h1') {
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
          yPosition += 2

        } else if (item.type === 'h4') {
          pdf.setFont('helvetica', 'bold')
          pdf.setFontSize(10)
          pdf.setTextColor(60, 60, 60)
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
          yPosition += 1.5

        } else if (item.type === 'bullet') {
          pdf.setFontSize(10)
          pdf.setTextColor(0, 0, 0)

          let cleanText = item.text

          // Check for "Key: Value" pattern to bold the Key
          const colonIndex = cleanText.indexOf(':')

          // heuristic: bold the key if it exists and isn't too long (e.g. < 50 chars)
          if (colonIndex > -1 && colonIndex < 50) {
            const key = cleanText.substring(0, colonIndex + 1)
            const value = cleanText.substring(colonIndex + 1) // preserve leading space if any? usually we trim or add 1 space

            // Render Bullet dot
            if (yPosition > pageHeight - margin - 20) {
              pdf.addPage()
              yPosition = margin
            }
            pdf.setFont('helvetica', 'normal') // Bullet dot is normal
            pdf.text('• ', margin + 2, yPosition)

            // Render Key BOLD
            pdf.setFont('helvetica', 'bold') // Key is Bold
            pdf.text(key, margin + 5, yPosition) // Adjusted offset for dot
            const keyWidth = pdf.getTextWidth(key)

            // Render Value NORMAL
            pdf.setFont('helvetica', 'normal')

            // Handle Value Wrapping
            // First chunk must fit on same line
            const availableWidthFirstLine = contentWidth - 5 - keyWidth

            // Simple approach: Split value into words and fill first line manually?
            // Or use splitTextToSize on the whole value, then print first line at offset, others at margin
            const valueWords = value.split(' ')
            let firstLine = ''
            let restIndex = 0

            for (let i = 0; i < valueWords.length; i++) {
              const testLine = (firstLine + valueWords[i] + ' ')
              if (pdf.getTextWidth(testLine) < availableWidthFirstLine) {
                firstLine += valueWords[i] + ' '
                restIndex = i + 1
              } else {
                break
              }
            }

            pdf.text(firstLine, margin + 5 + keyWidth, yPosition)

            if (restIndex < valueWords.length) {
              const remainingText = valueWords.slice(restIndex).join(' ')
              const restLines = pdf.splitTextToSize(remainingText, contentWidth - 5)

              restLines.forEach(line => {
                yPosition += lineHeight
                if (yPosition > pageHeight - margin - 20) {
                  pdf.addPage()
                  yPosition = margin
                }
                pdf.text(line, margin + 5, yPosition) // Align with text start (not bullet)
              })
            }
            yPosition += lineHeight

          } else {
            pdf.setFont('helvetica', 'normal')
            const lines = pdf.splitTextToSize(cleanText, contentWidth - 5)
            lines.forEach((line, idx) => {
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
          }
          yPosition += 1

        } else if (item.type === 'numbered_list') {
          pdf.setFontSize(10)
          pdf.setTextColor(0, 0, 0)

          let cleanText = item.text
          const prefix = item.prefix || '1. '
          const prefixWidth = pdf.getTextWidth(prefix + ' ')

          const colonIndex = cleanText.indexOf(':')

          if (colonIndex > -1 && colonIndex < 50) {
            const key = cleanText.substring(0, colonIndex + 1)
            const value = cleanText.substring(colonIndex + 1)

            if (yPosition > pageHeight - margin - 20) {
              pdf.addPage()
              yPosition = margin
            }
            pdf.setFont('helvetica', 'normal')
            pdf.text(prefix, margin + 2, yPosition)

            pdf.setFont('helvetica', 'bold')
            pdf.text(key, margin + 5 + prefixWidth, yPosition)
            const keyWidth = pdf.getTextWidth(key)

            pdf.setFont('helvetica', 'normal')

            const availableWidthFirstLine = contentWidth - 5 - prefixWidth - keyWidth

            const valueWords = value.split(' ')
            let firstLine = ''
            let restIndex = 0

            for (let i = 0; i < valueWords.length; i++) {
              const testLine = (firstLine + valueWords[i] + ' ')
              if (pdf.getTextWidth(testLine) < availableWidthFirstLine) {
                firstLine += valueWords[i] + ' '
                restIndex = i + 1
              } else {
                break
              }
            }

            pdf.text(firstLine, margin + 5 + prefixWidth + keyWidth, yPosition)

            if (restIndex < valueWords.length) {
              const remainingText = valueWords.slice(restIndex).join(' ')
              const restLines = pdf.splitTextToSize(remainingText, contentWidth - 5 - prefixWidth)

              restLines.forEach(line => {
                yPosition += lineHeight
                if (yPosition > pageHeight - margin - 20) {
                  pdf.addPage()
                  yPosition = margin
                }
                pdf.text(line, margin + 5 + prefixWidth, yPosition) // Indent aligned with text
              })
            }
            yPosition += lineHeight

          } else {
            pdf.setFont('helvetica', 'normal')
            pdf.text(prefix, margin + 2, yPosition)

            const lines = pdf.splitTextToSize(cleanText, contentWidth - 5 - prefixWidth)
            lines.forEach((line, idx) => {
              if (yPosition > pageHeight - margin - 20) {
                pdf.addPage()
                yPosition = margin
              }
              if (idx === 0) {
                pdf.text(line, margin + 5 + prefixWidth, yPosition)
              } else {
                pdf.text(line, margin + 5 + prefixWidth, yPosition)
              }
              yPosition += lineHeight
            })
          }
          yPosition += 1

        } else if (item.type === 'paragraph') {
          pdf.setFontSize(10)
          pdf.setTextColor(0, 0, 0)
          pdf.setFont('helvetica', 'normal')

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
                pdf.setFont('helvetica', 'bold')
                const boldText = boldPart.slice(2, -2)
                pdf.text(boldText, xPos, yPosition)
                xPos += measure(boldText)
                pdf.setFont('helvetica', 'normal')
              } else if (boldPart.startsWith('_') && boldPart.endsWith('_')) {
                pdf.setFont('helvetica', 'italic')
                const italicText = boldPart.slice(1, -1)
                pdf.text(italicText, xPos, yPosition)
                xPos += measure(italicText)
                pdf.setFont('helvetica', 'normal')
              } else if (boldPart.startsWith('*') && boldPart.endsWith('*') && !boldPart.startsWith('**')) {
                pdf.setFont('helvetica', 'italic')
                const italicText = boldPart.slice(1, -1)
                pdf.text(italicText, xPos, yPosition)
                xPos += measure(italicText)
                pdf.setFont('helvetica', 'normal')
              } else if (boldPart) {
                pdf.setFont('helvetica', 'normal')
                pdf.text(boldPart, xPos, yPosition)
                xPos += measure(boldPart)
              }
            })

            yPosition += lineHeight
          })
          yPosition += 2

        } else if (item.type === 'table') {
          const tableData = item.data
          const headers = tableData.headers
          const rows = tableData.rows

          if (headers.length === 0) return

          const tableWidth = contentWidth
          const colWidth = tableWidth / headers.length
          const cellPadding = 2
          const lineHeight = 4.5

          const drawRow = (cells, y, height, isHeader = false) => {
            if (isHeader) {
              pdf.setFillColor(240, 240, 240)
              pdf.setDrawColor(200, 200, 200)
              pdf.setFont('helvetica', 'bold')
              pdf.setFontSize(9)
              pdf.rect(margin, y, tableWidth, height, 'FD')
            } else {
              pdf.setFont('helvetica', 'normal')
              pdf.setFontSize(8)
            }

            cells.forEach((cell, i) => {
              const text = cell || ''
              const lines = pdf.splitTextToSize(text, colWidth - (cellPadding * 2))
              const x = margin + (i * colWidth) + cellPadding
              let textY = y + 4.5

              lines.forEach(line => {
                pdf.text(line, x, textY)
                textY += lineHeight
              })

              if (i > 0) {
                pdf.setDrawColor(isHeader ? 200 : 230, isHeader ? 200 : 230, isHeader ? 200 : 230)
                pdf.line(margin + (i * colWidth), y, margin + (i * colWidth), y + height)
              }
            })

            if (isHeader) {
              pdf.rect(margin, y, tableWidth, height, 'S')
            } else {
              pdf.setDrawColor(230, 230, 230)
              pdf.rect(margin, y, tableWidth, height, 'S')
            }
          }

          pdf.setFont('helvetica', 'bold')
          pdf.setFontSize(9)
          let headerHeight = 0
          headers.forEach(h => {
            const lines = pdf.splitTextToSize(h, colWidth - (cellPadding * 2))
            const hNeeded = (lines.length * lineHeight) + 4
            if (hNeeded > headerHeight) headerHeight = hNeeded
          })
          headerHeight = Math.max(headerHeight, 10)

          if (yPosition + headerHeight + 12 > pageHeight - margin - 20) {
            pdf.addPage()
            yPosition = margin
          }

          drawRow(headers, yPosition, headerHeight, true)
          yPosition += headerHeight

          pdf.setFont('helvetica', 'normal')
          pdf.setFontSize(8)

          rows.forEach((row, rowIndex) => {
            pdf.setFont('helvetica', 'normal')
            pdf.setFontSize(8)

            let rowHeight = 0
            row.forEach(cell => {
              const lines = pdf.splitTextToSize(cell || '', colWidth - (cellPadding * 2))
              const rNeeded = (lines.length * lineHeight) + 4
              if (rNeeded > rowHeight) rowHeight = rNeeded
            })
            rowHeight = Math.max(rowHeight, 10)

            if (yPosition + rowHeight > pageHeight - margin - 20) {
              pdf.addPage()
              yPosition = margin

              drawRow(headers, yPosition, headerHeight, true)
              yPosition += headerHeight

              pdf.setFont('helvetica', 'normal')
              pdf.setFontSize(8)
            }

            // Draw Row Background
            if (rowIndex % 2 === 1) {
              pdf.setFillColor(250, 250, 250)
              pdf.rect(margin, yPosition, tableWidth, rowHeight, 'F')
            }

            drawRow(row, yPosition, rowHeight, false)
            yPosition += rowHeight
          })
          yPosition += 8

        } else if (item.type === 'space') {
          yPosition += 3
        }
      })

      const charts = message.charts || []
      if (Array.isArray(charts) && charts.length > 0) {
        const remainingCharts = charts.filter(c => !renderedChartIds.has(c.id))

        if (remainingCharts.length > 0) {
          yPosition += 5
          for (const chart of remainingCharts) {
            renderChartToPDF(chart)
          }
        }
      }

      pdf.setFont('helvetica', 'italic')
      pdf.setFontSize(8)
      pdf.setTextColor(100, 100, 100)
      pdf.text(`Generated by PharmaPilot AI | ${today}`, pageWidth / 2, pageHeight - 10, { align: 'center' })

      const fileName = `PharmaPilot-Research-${new Date().getTime()}.pdf`
      pdf.save(fileName)
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
  }

  // Bar chart using chart.js for built-in hover tooltips (single color per chart)
  const BarChartCard = ({ chart, index }) => {
    if (
      !chart ||
      !Array.isArray(chart.labels) ||
      !Array.isArray(chart.values) ||
      chart.values.length === 0 ||
      chart.values.every(v => v === 0 || v === '0' || v === null)
    ) return null

    const labels = chart.labels
    const values = chart.values

    // Soft color palette (one color per chart type)
    const chartColors = [
      { bg: 'rgba(96, 165, 250, 0.7)', border: 'rgba(59, 130, 246, 1)', hover: 'rgba(59, 130, 246, 1)' },      // soft blue
      { bg: 'rgba(52, 211, 153, 0.7)', border: 'rgba(16, 185, 129, 1)', hover: 'rgba(16, 185, 129, 1)' },      // soft green
      { bg: 'rgba(248, 113, 113, 0.7)', border: 'rgba(239, 68, 68, 1)', hover: 'rgba(239, 68, 68, 1)' },      // soft red
      { bg: 'rgba(251, 146, 60, 0.7)', border: 'rgba(249, 115, 22, 1)', hover: 'rgba(249, 115, 22, 1)' }      // soft orange
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
    if (
      !chart ||
      !Array.isArray(chart.labels) ||
      !Array.isArray(chart.values) ||
      chart.values.length === 0 ||
      chart.values.every(v => v === 0 || v === '0' || v === null)
    ) return null

    const labels = chart.labels
    const values = chart.values

    // Softer, professional color palette for pie slices
    const pieColors = [
      'rgba(96, 165, 250, 0.85)',    // soft blue
      'rgba(52, 211, 153, 0.85)',    // soft green
      'rgba(251, 146, 60, 0.85)',    // soft orange
      'rgba(248, 113, 113, 0.85)',   // soft red
      'rgba(167, 139, 250, 0.85)',   // soft purple
      'rgba(244, 114, 182, 0.85)',   // soft pink
      'rgba(56, 189, 248, 0.85)',    // soft sky
      'rgba(253, 186, 116, 0.85)',   // soft amber
      'rgba(103, 232, 249, 0.85)',   // soft cyan
      'rgba(196, 181, 253, 0.85)'    // soft violet
    ]

    const data = useMemo(() => ({
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: values.map((_, idx) => pieColors[idx % pieColors.length]),
          borderColor: 'transparent',  // NO borders
          borderWidth: 0,  // NO borders
          spacing: 0  // NO gaps between slices
        }
      ]
    }), [labels, values])



    const options = useMemo(() => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',  // Legend on the right side
          align: 'start',
          labels: {
            color: '#374151',
            font: { size: 11, weight: '500' },
            padding: 15,
            boxWidth: 15,
            boxHeight: 15
          }
        },
        title: chart.title ? {
          display: true,
          text: chart.title,
          font: { size: 13, weight: 'bold' },
          color: '#111827',
          padding: { bottom: 15 }
        } : undefined,
        tooltip: {
          backgroundColor: '#0f172a',
          borderColor: '#22c55e',
          borderWidth: 1,
          callbacks: {
            label: (ctx) => `${ctx.label}: ${ctx.parsed} (${((ctx.parsed / values.reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%)`
          }
        }
      }
    }), [chart.title, values])

    const [visible, setVisible] = useState(false)

    useEffect(() => {
      const raf = requestAnimationFrame(() => setVisible(true))
      return () => cancelAnimationFrame(raf)
    }, [])

    return (
      <div className='rounded border border-gray-200 dark:border-gray-700 p-6 mb-6 mx-2 bg-white dark:bg-gray-900 shadow-sm'>
        <div className='h-[800px] w-full' style={{ opacity: visible ? 1 : 0, transition: 'opacity 220ms ease' }}>
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

  const linkifyContent = (text) => {
    if (!text) return text
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g
    return text.replace(urlRegex, (url) => {
      const href = url.startsWith('www.') ? `https://${url}` : url
      return `[${url}](${href})`
    })
  }

  // Memoize markdown configuration to prevent layout thrashing during typing
  const remarkPlugins = useMemo(() => [remarkGfm], [])

  const markdownComponents = useMemo(() => ({
    a: ({ node, ...props }) => (
      <a
        {...props}
        target='_blank'
        rel='noreferrer noopener'
        className='text-blue-600 dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-300'
      />
    ),
    table: ({ node, ...props }) => (
      <div className="overflow-x-auto my-4 border border-gray-200 dark:border-gray-700 rounded-lg">
        <table {...props} className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm" />
      </div>
    ),
    thead: ({ node, ...props }) => (
      <thead {...props} className="bg-gray-50 dark:bg-gray-800" />
    ),
    tbody: ({ node, ...props }) => (
      <tbody {...props} className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900" />
    ),
    tr: ({ node, ...props }) => (
      <tr {...props} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" />
    ),
    th: ({ node, ...props }) => (
      <th {...props} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" />
    ),
    td: ({ node, ...props }) => (
      <td {...props} className="px-4 py-3 whitespace-normal text-gray-700 dark:text-gray-300 leading-relaxed" />
    )
  }), [])

  const renderMarkdown = (content) => (
    <Markdown
      remarkPlugins={remarkPlugins}
      components={markdownComponents}
    >
      {linkifyContent(content)}
    </Markdown>
  )

  return (
    <div>
      {message.role === 'user' ? (
        <div className='flex items-start justify-end my-4 gap-2'>
          <div className='flex flex-col gap-2 p-4 px-8 bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-700/50 rounded-md w-full max-w-2xl wrap-break-word'>
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
        <div className='flex flex-col gap-2 w-full max-w-4xl my-4 wrap-break-word'>
          {message.isImage ? (
            <img src={message.content} alt='AIgenerated' className='w-full max-w-md mt-2 rounded-md' />
          ) : (
            <div
              ref={messageRef}
              id={`message-${message.timestamp}`}
              className='bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700/60 shadow-sm p-6 px-10 text-sm text-black dark:text-gray-50 reset-tw overflow-hidden flex flex-col gap-3'
              style={{
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                width: '100%',
                contain: 'layout style paint'
              }}
            >
              <div style={{ width: '100%', minHeight: '1px' }}>
                {(() => {
                  const content = message.content || ''
                  const chartPlaceholderRegex = /\{\{CHART:(\w+)\}\}/g
                  const parts = []
                  let lastIndex = 0
                  let match

                  while ((match = chartPlaceholderRegex.exec(content)) !== null) {
                    if (match.index > lastIndex) {
                      parts.push({
                        type: 'text',
                        content: content.substring(lastIndex, match.index)
                      })
                    }

                    const chartId = match[1]
                    const chart = charts.find(c => c.id === chartId)
                    if (chart) {
                      parts.push({
                        type: 'chart',
                        chart: chart,
                        id: chartId
                      })
                    }

                    lastIndex = match.index + match[0].length
                  }

                  if (lastIndex < content.length) {
                    parts.push({
                      type: 'text',
                      content: content.substring(lastIndex)
                    })
                  }

                  if (parts.length === 0) {
                    return renderMarkdown(content)
                  }

                  return parts.map((part, idx) => {
                    if (part.type === 'text') {
                      return <div key={`text-${idx}`}>{renderMarkdown(part.content)}</div>
                    } else if (part.type === 'chart') {
                      const c = part.chart
                      const isValid = c && Array.isArray(c.values) && c.values.length > 0 && !c.values.every(v => v === 0 || v === '0' || v === null)

                      if (!isValid) return null

                      return (
                        <div key={`chart-${idx}`} className='my-6 w-full'>
                          <ChartCard chart={part.chart} index={idx} />
                        </div>
                      )
                    }
                    return null
                  })
                })()}
              </div>

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

            </div>
          )}

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
  )
}
export default React.memo(Message)
