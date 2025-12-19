import React, { useState, useEffect, useMemo } from 'react'
import { client, useConfig, useElementData, useElementColumns } from '@sigmacomputing/plugin'
import Histogram from './components/Histogram'
import { calculateStats, generateBins } from './utils/statistics'

function App() {
  const config = useConfig()
  const [isLoading, setIsLoading] = useState(true)
  
  // Get data from Sigma
  const sigmaData = useElementData('source')
  const columns = useElementColumns('source')
  
  // Extract configuration values
  const valueColumnId = config?.valueColumn
  const binMethod = config?.binMethod || 'Auto (Sturges)'
  const binCount = config?.binCount || '10'
  const binWidth = config?.binWidth || ''
  const binLabelFormat = config?.binLabelFormat || 'Range (10-20)'
  const chartType = config?.chartType || 'Frequency'
  const colorScheme = config?.colorScheme || 'Ocean Blue'
  const customColor = config?.customColor
  const showGridlines = config?.showGridlines !== false
  const barGap = config?.barGap || 'Small'
  const showMean = config?.showMean || false
  const showMedian = config?.showMedian || false
  const showStdDev = config?.showStdDev || false
  const showNormalCurve = config?.showNormalCurve || false
  const showStats = config?.showStats !== false
  const chartTitle = config?.chartTitle || ''
  const xAxisLabel = config?.xAxisLabel || ''
  const yAxisLabel = config?.yAxisLabel || ''
  const xAxisFormat = config?.xAxisFormat || 'Range (10–20)'
  const numberFormat = config?.numberFormat || 'Auto'
  const rotateLabels = config?.rotateLabels || false
  const showBinRangeInTooltip = config?.showBinRangeInTooltip !== false
  const showBarLabels = config?.showBarLabels || false

  // Process data
  const processedData = useMemo(() => {
    if (!sigmaData || !valueColumnId) {
      return null
    }

    // Get the column data
    const columnData = sigmaData[valueColumnId]
    if (!columnData || !Array.isArray(columnData)) {
      return null
    }

    // Filter to valid numbers only
    const numericData = columnData
      .filter(val => val !== null && val !== undefined && !isNaN(Number(val)))
      .map(val => Number(val))

    if (numericData.length === 0) {
      return null
    }

    return numericData
  }, [sigmaData, valueColumnId])

  // Calculate statistics
  const stats = useMemo(() => {
    if (!processedData) return null
    return calculateStats(processedData)
  }, [processedData])

  // Generate histogram bins
  const bins = useMemo(() => {
    if (!processedData) return []
    return generateBins(processedData, {
      binMethod,
      binCount,
      binWidth
    })
  }, [processedData, binMethod, binCount, binWidth])

  // Get column name for labels
  const columnName = useMemo(() => {
    if (!columns || !valueColumnId) return 'Value'
    const col = columns[valueColumnId]
    return col?.name || 'Value'
  }, [columns, valueColumnId])

  // Color schemes
  const colorSchemes = {
    'Ocean Blue': { primary: '#3b82f6', gradient: ['#60a5fa', '#2563eb'] },
    'Forest Green': { primary: '#10b981', gradient: ['#34d399', '#059669'] },
    'Sunset Orange': { primary: '#f59e0b', gradient: ['#fbbf24', '#d97706'] },
    'Purple Haze': { primary: '#8b5cf6', gradient: ['#a78bfa', '#7c3aed'] },
    'Grayscale': { primary: '#64748b', gradient: ['#94a3b8', '#475569'] },
    'Custom': { primary: customColor || '#3b82f6', gradient: [customColor || '#3b82f6', customColor || '#3b82f6'] }
  }

  const colors = colorSchemes[colorScheme] || colorSchemes['Ocean Blue']

  // Bar gap mapping
  const barGapMap = {
    'None': 0,
    'Small': 1,
    'Medium': 2,
    'Large': 4
  }
  const barPadding = barGapMap[barGap] ?? 1

  // Update loading state
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner" />
      </div>
    )
  }

  // Empty state - no data source configured
  if (!valueColumnId) {
    return (
      <div className="empty-state">
        <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 3v18h18" />
          <rect x="7" y="10" width="3" height="8" rx="0.5" />
          <rect x="12" y="6" width="3" height="12" rx="0.5" />
          <rect x="17" y="13" width="3" height="5" rx="0.5" />
        </svg>
        <h3 className="empty-state-title">Configure Data Source</h3>
        <p className="empty-state-message">
          Select a data source and a numeric column to visualize the distribution.
        </p>
      </div>
    )
  }

  // Empty state - no data available
  if (!processedData || processedData.length === 0) {
    return (
      <div className="empty-state">
        <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
        <h3 className="empty-state-title">No Data Available</h3>
        <p className="empty-state-message">
          The selected column doesn't contain any numeric values to display.
        </p>
      </div>
    )
  }

  return (
    <Histogram
      bins={bins}
      stats={stats}
      chartType={chartType}
      colors={colors}
      binLabelFormat={binLabelFormat}
      xAxisFormat={xAxisFormat}
      numberFormat={numberFormat}
      rotateLabels={rotateLabels}
      showBinRangeInTooltip={showBinRangeInTooltip}
      showGridlines={showGridlines}
      barPadding={barPadding}
      showMean={showMean}
      showMedian={showMedian}
      showStdDev={showStdDev}
      showNormalCurve={showNormalCurve}
      showStats={showStats}
      chartTitle={chartTitle || `Distribution of ${columnName}`}
      xAxisLabel={xAxisLabel || columnName}
      yAxisLabel={yAxisLabel}
      showBarLabels={showBarLabels}
    />
  )
}

export default App
