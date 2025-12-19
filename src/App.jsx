import React, { useMemo, useEffect, useState } from 'react'
import { useConfig, usePaginatedElementData, useElementColumns } from '@sigmacomputing/plugin'
import Histogram from './components/Histogram'
import { calculateStats, generateBins } from './utils/statistics'

function App() {
  const config = useConfig()
  const sourceElementId = config?.source
  
  // usePaginatedElementData returns [data, fetchMore]
  const result = usePaginatedElementData(sourceElementId)
  
  // Debug what we're getting
  console.log('=== PAGINATED DATA DEBUG ===')
  console.log('result:', result)
  console.log('result type:', typeof result)
  console.log('is array:', Array.isArray(result))
  
  const sigmaData = Array.isArray(result) ? result[0] : result
  const fetchMore = Array.isArray(result) ? result[1] : null
  
  console.log('sigmaData:', sigmaData)
  console.log('fetchMore:', fetchMore)
  console.log('fetchMore type:', typeof fetchMore)
  
  const columns = useElementColumns(sourceElementId)
  
  const [isLoading, setIsLoading] = useState(false)
  const [lastCount, setLastCount] = useState(0)

  const valueColumnId = config?.valueColumn

  // Auto-fetch more data when available
  useEffect(() => {
    if (sigmaData && valueColumnId) {
      const columnData = sigmaData[valueColumnId]
      if (columnData && Array.isArray(columnData)) {
        const currentCount = columnData.length
        console.log('Current row count:', currentCount, 'Last count:', lastCount)
        
        if (currentCount > lastCount) {
          setLastCount(currentCount)
          
          // If we got exactly 25000 (or multiple), there's likely more
          if (currentCount % 25000 === 0 && fetchMore) {
            console.log('Fetching more data...')
            setIsLoading(true)
            fetchMore()
          } else {
            console.log('No more data to fetch or fetchMore not available')
            setIsLoading(false)
          }
        }
      }
    }
  }, [sigmaData, valueColumnId, fetchMore, lastCount])

  const binMethod = config?.binMethod || 'Auto (Sturges)'
  const binCount = config?.binCount || '10'
  const binWidth = config?.binWidth || ''
  const chartType = config?.chartType || 'Frequency'
  const colorScheme = config?.colorScheme || 'Ocean Blue'
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
  const xAxisFormat = config?.xAxisFormat || 'Range'
  const showBarLabels = config?.showBarLabels || false

  const processedData = useMemo(() => {
    if (!sigmaData || !valueColumnId) return null
    
    const columnData = sigmaData[valueColumnId]
    if (!columnData || !Array.isArray(columnData)) return null

    const numericData = columnData
      .filter(val => val !== null && val !== undefined && !isNaN(Number(val)))
      .map(val => Number(val))

    return numericData.length > 0 ? numericData : null
  }, [sigmaData, valueColumnId])

  const stats = useMemo(() => {
    if (!processedData) return null
    return calculateStats(processedData)
  }, [processedData])

  const bins = useMemo(() => {
    if (!processedData) return []
    return generateBins(processedData, { binMethod, binCount, binWidth })
  }, [processedData, binMethod, binCount, binWidth])

  const columnName = useMemo(() => {
    if (!columns || !valueColumnId) return 'Value'
    const col = columns[valueColumnId]
    return col?.name || 'Value'
  }, [columns, valueColumnId])

  const colorSchemes = {
    'Ocean Blue': { primary: '#3b82f6', gradient: ['#60a5fa', '#2563eb'] },
    'Forest Green': { primary: '#10b981', gradient: ['#34d399', '#059669'] },
    'Sunset Orange': { primary: '#f59e0b', gradient: ['#fbbf24', '#d97706'] },
    'Purple Haze': { primary: '#8b5cf6', gradient: ['#a78bfa', '#7c3aed'] },
    'Grayscale': { primary: '#64748b', gradient: ['#94a3b8', '#475569'] },
  }
  const colors = colorSchemes[colorScheme] || colorSchemes['Ocean Blue']
  const barGapMap = { 'None': 0, 'Small': 1, 'Medium': 2, 'Large': 4 }
  const barPadding = barGapMap[barGap] ?? 1

  if (!sourceElementId || !valueColumnId) {
    return (
      <div className="empty-state">
        <h3 className="empty-state-title">Configure Data Source</h3>
        <p className="empty-state-message">Select a data source and numeric column.</p>
      </div>
    )
  }

  if (!processedData || processedData.length === 0) {
    return (
      <div className="empty-state">
        <h3 className="empty-state-title">No Data Available</h3>
        <p className="empty-state-message">The selected column has no numeric values.</p>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 8,
          right: 8,
          background: 'rgba(59, 130, 246, 0.9)',
          color: 'white',
          padding: '4px 12px',
          borderRadius: 4,
          fontSize: 12,
          zIndex: 100
        }}>
          Loading... ({lastCount.toLocaleString()} rows)
        </div>
      )}
      <Histogram
        bins={bins}
        stats={stats}
        chartType={chartType}
        colors={colors}
        xAxisFormat={xAxisFormat}
        numberFormat="Auto"
        rotateLabels={false}
        showBinRangeInTooltip={true}
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
    </div>
  )
}

export default App
