import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react'
import * as d3 from 'd3'
import { generateNormalCurve } from '../utils/statistics'

/**
 * Format a number based on the selected format
 */
function formatValue(value, format, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) {
    return '—'
  }

  switch (format) {
    case 'Integer':
      return Math.round(value).toLocaleString()
    case '1 Decimal':
      return value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    case '2 Decimals':
      return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    case 'Currency ($)':
      if (Math.abs(value) >= 1000000) {
        return '$' + (value / 1000000).toFixed(1) + 'M'
      }
      if (Math.abs(value) >= 1000) {
        return '$' + (value / 1000).toFixed(1) + 'K'
      }
      return '$' + value.toFixed(2)
    case 'Thousands (K)':
      return (value / 1000).toFixed(1) + 'K'
    case 'Millions (M)':
      return (value / 1000000).toFixed(2) + 'M'
    case 'Auto':
    default:
      if (Math.abs(value) >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M'
      }
      if (Math.abs(value) >= 10000) {
        return (value / 1000).toFixed(1) + 'K'
      }
      if (Number.isInteger(value) || Math.abs(value) >= 100) {
        return Math.round(value).toLocaleString()
      }
      return value.toFixed(decimals)
  }
}

/**
 * Get the X-axis tick label for a bin based on format
 * THIS SOLVES THE CUSTOMER'S PAIN POINT - shows actual values, not "bin 1, bin 2"
 */
function getBinLabel(bin, format, numberFormat) {
  const x0 = formatValue(bin.x0, numberFormat, 1)
  const x1 = formatValue(bin.x1, numberFormat, 1)
  const midpoint = (bin.x0 + bin.x1) / 2

  switch (format) {
    case 'Range (10–20)':
      return x0 + '–' + x1
    case 'Midpoint':
      return formatValue(midpoint, numberFormat, 1)
    case 'Lower Bound':
      return x0
    case 'Upper Bound':
      return x1
    default:
      return x0 + '–' + x1
  }
}

function Histogram({
  bins, stats, chartType, colors, showGridlines, barPadding,
  showMean, showMedian, showStdDev, showNormalCurve, showStats,
  chartTitle, xAxisLabel, yAxisLabel, xAxisFormat, numberFormat,
  rotateLabels, showBinRangeInTooltip, showBarLabels
}) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [tooltip, setTooltip] = useState(null)

  const fmt = useCallback((val, dec = 2) => formatValue(val, numberFormat, dec), [numberFormat])

  const getBarValue = useCallback((bin) => {
    switch (chartType) {
      case 'Relative Frequency (%)': return bin.relativeFrequency
      case 'Cumulative': return bin.cumulativeCount
      case 'Cumulative (%)': return bin.cumulativeFrequency
      default: return bin.count
    }
  }, [chartType])

  const effectiveYLabel = yAxisLabel || (() => {
    switch (chartType) {
      case 'Relative Frequency (%)': return 'Relative Frequency (%)'
      case 'Cumulative': return 'Cumulative Count'
      case 'Cumulative (%)': return 'Cumulative Frequency (%)'
      default: return 'Frequency'
    }
  })()

  const maxValue = useMemo(() => {
    if (!bins || bins.length === 0) return 0
    return Math.max(...bins.map(getBarValue))
  }, [bins, getBarValue])

  const normalCurvePoints = useMemo(() => {
    if (!showNormalCurve || !stats || chartType !== 'Frequency') return []
    return generateNormalCurve(stats, bins)
  }, [showNormalCurve, stats, bins, chartType])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setDimensions({ width, height })
      }
    })
    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [])

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || dimensions.height === 0) return
    if (!bins || bins.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const bottomMargin = rotateLabels ? 75 : (xAxisLabel ? 55 : 45)
    const margin = { top: 20, right: 20, bottom: bottomMargin, left: 60 }
    const width = dimensions.width - margin.left - margin.right
    const height = dimensions.height - margin.top - margin.bottom
    if (width <= 0 || height <= 0) return

    const g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    const xBand = d3.scaleBand().domain(bins.map((_, i) => i)).range([0, width]).padding(barPadding / 20)
    const xLinear = d3.scaleLinear().domain([bins[0].x0, bins[bins.length - 1].x1]).range([0, width])
    const yMax = maxValue * 1.1
    const yScale = d3.scaleLinear().domain([0, yMax]).nice().range([height, 0])

    if (showGridlines) {
      yScale.ticks(6).forEach(tick => {
        g.append('line').attr('class', 'grid-line')
          .attr('x1', 0).attr('x2', width).attr('y1', yScale(tick)).attr('y2', yScale(tick))
      })
    }

    if (showStdDev && stats) {
      const stdDevStart = Math.max(stats.mean - stats.stdDev, bins[0].x0)
      const stdDevEnd = Math.min(stats.mean + stats.stdDev, bins[bins.length - 1].x1)
      g.append('rect').attr('class', 'stddev-rect')
        .attr('x', xLinear(stdDevStart)).attr('y', 0)
        .attr('width', xLinear(stdDevEnd) - xLinear(stdDevStart)).attr('height', height)
    }

    const gradientId = 'barGradient'
    const defs = svg.append('defs')
    const gradient = defs.append('linearGradient').attr('id', gradientId)
      .attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%')
    gradient.append('stop').attr('offset', '0%').attr('stop-color', colors.gradient[0])
    gradient.append('stop').attr('offset', '100%').attr('stop-color', colors.gradient[1])

    g.selectAll('.histogram-bar').data(bins).enter().append('rect')
      .attr('class', 'histogram-bar')
      .attr('x', (d, i) => xBand(i)).attr('y', d => yScale(getBarValue(d)))
      .attr('width', xBand.bandwidth()).attr('height', d => height - yScale(getBarValue(d)))
      .attr('fill', 'url(#' + gradientId + ')').attr('rx', 2)
      .on('mouseenter', (event, d) => {
        const rect = event.target.getBoundingClientRect()
        const containerRect = containerRef.current.getBoundingClientRect()
        setTooltip({ x: rect.left + rect.width / 2 - containerRect.left, y: rect.top - containerRect.top, data: d })
      })
      .on('mouseleave', () => setTooltip(null))

    if (showBarLabels) {
      g.selectAll('.bar-label').data(bins).enter().append('text')
        .attr('class', 'bar-label')
        .attr('x', (d, i) => xBand(i) + xBand.bandwidth() / 2)
        .attr('y', d => yScale(getBarValue(d)) - 5)
        .attr('text-anchor', 'middle').attr('fill', '#374151').attr('font-size', '10px').attr('font-weight', '600')
        .text(d => chartType.includes('%') ? getBarValue(d).toFixed(1) + '%' : fmt(getBarValue(d), 0))
    }

    if (showNormalCurve && normalCurvePoints.length > 0 && chartType === 'Frequency') {
      const line = d3.line().x(d => xLinear(d.x)).y(d => yScale(d.y)).curve(d3.curveBasis)
      g.append('path').attr('class', 'normal-curve').attr('d', line(normalCurvePoints))
    }

    if (showMean && stats && stats.mean >= bins[0].x0 && stats.mean <= bins[bins.length - 1].x1) {
      g.append('line').attr('class', 'mean-line')
        .attr('x1', xLinear(stats.mean)).attr('x2', xLinear(stats.mean)).attr('y1', 0).attr('y2', height)
      g.append('text').attr('x', xLinear(stats.mean) + 5).attr('y', 14)
        .attr('fill', '#ef4444').attr('font-size', '10px').attr('font-weight', '600')
        .text('μ = ' + fmt(stats.mean))
    }

    if (showMedian && stats && stats.median >= bins[0].x0 && stats.median <= bins[bins.length - 1].x1) {
      g.append('line').attr('class', 'median-line')
        .attr('x1', xLinear(stats.median)).attr('x2', xLinear(stats.median)).attr('y1', 0).attr('y2', height)
      g.append('text').attr('x', xLinear(stats.median) + 5).attr('y', showMean ? 30 : 14)
        .attr('fill', '#22c55e').attr('font-size', '10px').attr('font-weight', '600')
        .text('Med = ' + fmt(stats.median))
    }

    // X Axis - THE KEY FIX: show actual values, not "bin 1, bin 2"!
    const xAxisGroup = g.append('g').attr('class', 'axis-x').attr('transform', 'translate(0,' + height + ')')
    xAxisGroup.append('line').attr('x1', 0).attr('x2', width).attr('y1', 0).attr('y2', 0).attr('stroke', '#e2e8f0')

    bins.forEach((_, i) => {
      xAxisGroup.append('line')
        .attr('x1', xBand(i) + xBand.bandwidth() / 2).attr('x2', xBand(i) + xBand.bandwidth() / 2)
        .attr('y1', 0).attr('y2', 6).attr('stroke', '#e2e8f0')
    })

    const labels = xAxisGroup.selectAll('.tick-label').data(bins).enter().append('text')
      .attr('class', 'tick-label')
      .attr('x', (d, i) => xBand(i) + xBand.bandwidth() / 2)
      .attr('y', rotateLabels ? 14 : 22)
      .attr('text-anchor', rotateLabels ? 'end' : 'middle')
      .attr('fill', '#64748b').attr('font-size', '10px')
      .text(d => getBinLabel(d, xAxisFormat, numberFormat))

    if (rotateLabels) {
      labels.attr('transform', (d, i) => 'rotate(-45, ' + (xBand(i) + xBand.bandwidth() / 2) + ', 14)').attr('dy', '0.35em')
    }

    if (xAxisLabel) {
      g.append('text').attr('class', 'axis-label')
        .attr('x', width / 2).attr('y', height + (rotateLabels ? 65 : 45))
        .attr('text-anchor', 'middle').attr('fill', '#64748b').attr('font-size', '12px').attr('font-weight', '500')
        .text(xAxisLabel)
    }

    const yAxis = d3.axisLeft(yScale).ticks(6).tickFormat(d => chartType.includes('%') ? d.toFixed(1) + '%' : fmt(d, 0))
    g.append('g').attr('class', 'axis-y').call(yAxis).selectAll('text').attr('fill', '#64748b').attr('font-size', '10px')
    g.select('.axis-y .domain').attr('stroke', '#e2e8f0')
    g.selectAll('.axis-y .tick line').attr('stroke', '#e2e8f0')

    g.append('text').attr('class', 'axis-label').attr('transform', 'rotate(-90)')
      .attr('x', -height / 2).attr('y', -45).attr('text-anchor', 'middle')
      .attr('fill', '#64748b').attr('font-size', '12px').attr('font-weight', '500')
      .text(effectiveYLabel)

  }, [dimensions, bins, maxValue, colors, showGridlines, barPadding, showMean, showMedian, showStdDev, showNormalCurve, normalCurvePoints, stats, chartType, xAxisLabel, effectiveYLabel, showBarLabels, xAxisFormat, numberFormat, rotateLabels, getBarValue, fmt])

  const showLegend = showMean || showMedian || showStdDev || (showNormalCurve && chartType === 'Frequency')

  return (
    <div className="histogram-container">
      <div className="histogram-header">
        <h2 className="chart-title">{chartTitle}</h2>
        {showStats && stats && (
          <div className="stats-panel">
            <div className="stat-item"><span className="stat-label">N</span><span className="stat-value">{stats.count.toLocaleString()}</span></div>
            <div className="stat-item"><span className="stat-label">Mean</span><span className="stat-value mean">{fmt(stats.mean)}</span></div>
            <div className="stat-item"><span className="stat-label">Median</span><span className="stat-value median">{fmt(stats.median)}</span></div>
            <div className="stat-item"><span className="stat-label">Std Dev</span><span className="stat-value stddev">{fmt(stats.stdDev)}</span></div>
            <div className="stat-item"><span className="stat-label">Range</span><span className="stat-value">{fmt(stats.min)} – {fmt(stats.max)}</span></div>
          </div>
        )}
      </div>
      <div className="chart-wrapper" ref={containerRef}>
        <svg ref={svgRef} className="chart-svg" />
        {tooltip && (
          <div className="tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
            {showBinRangeInTooltip !== false && <div className="tooltip-title">{fmt(tooltip.data.x0)} – {fmt(tooltip.data.x1)}</div>}
            <div className="tooltip-row"><span className="tooltip-label">Count:</span><span className="tooltip-value">{tooltip.data.count.toLocaleString()}</span></div>
            <div className="tooltip-row"><span className="tooltip-label">Frequency:</span><span className="tooltip-value">{tooltip.data.relativeFrequency.toFixed(1)}%</span></div>
            {chartType.includes('Cumulative') && <div className="tooltip-row"><span className="tooltip-label">Cumulative:</span><span className="tooltip-value">{chartType === 'Cumulative (%)' ? tooltip.data.cumulativeFrequency.toFixed(1) + '%' : tooltip.data.cumulativeCount.toLocaleString()}</span></div>}
            <div className="tooltip-row tooltip-midpoint"><span className="tooltip-label">Midpoint:</span><span className="tooltip-value">{fmt((tooltip.data.x0 + tooltip.data.x1) / 2)}</span></div>
          </div>
        )}
      </div>
      {showLegend && (
        <div className="legend">
          {showMean && <div className="legend-item"><div className="legend-color mean" /><span>Mean</span></div>}
          {showMedian && <div className="legend-item"><div className="legend-color median" /><span>Median</span></div>}
          {showStdDev && <div className="legend-item"><div className="legend-color stddev" /><span>±1 Std Dev</span></div>}
          {showNormalCurve && chartType === 'Frequency' && <div className="legend-item"><div className="legend-color normal" /><span>Normal Dist.</span></div>}
        </div>
      )}
    </div>
  )
}

export default Histogram
