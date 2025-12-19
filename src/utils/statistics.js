/**
 * Statistics utility functions for histogram calculations
 */

/**
 * Calculate basic statistics for a dataset
 */
export function calculateStats(data) {
  if (!data || data.length === 0) {
    return null;
  }

  const n = data.length;
  const sorted = [...data].sort((a, b) => a - b);
  
  // Mean
  const sum = data.reduce((acc, val) => acc + val, 0);
  const mean = sum / n;
  
  // Median
  const mid = Math.floor(n / 2);
  const median = n % 2 !== 0 
    ? sorted[mid] 
    : (sorted[mid - 1] + sorted[mid]) / 2;
  
  // Variance and Standard Deviation
  const squaredDiffs = data.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / n;
  const stdDev = Math.sqrt(variance);
  
  // Min and Max
  const min = sorted[0];
  const max = sorted[n - 1];
  
  // Range
  const range = max - min;
  
  // Quartiles
  const q1 = percentile(sorted, 25);
  const q3 = percentile(sorted, 75);
  const iqr = q3 - q1;
  
  // Skewness (Fisher-Pearson)
  const skewness = data.reduce((acc, val) => {
    return acc + Math.pow((val - mean) / stdDev, 3);
  }, 0) / n;
  
  // Kurtosis (excess kurtosis)
  const kurtosis = data.reduce((acc, val) => {
    return acc + Math.pow((val - mean) / stdDev, 4);
  }, 0) / n - 3;

  return {
    count: n,
    mean,
    median,
    mode: calculateMode(data),
    variance,
    stdDev,
    min,
    max,
    range,
    q1,
    q3,
    iqr,
    skewness,
    kurtosis
  };
}

/**
 * Calculate percentile using linear interpolation
 */
function percentile(sortedData, p) {
  const n = sortedData.length;
  const index = (p / 100) * (n - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  
  if (upper >= n) return sortedData[n - 1];
  if (lower < 0) return sortedData[0];
  
  return sortedData[lower] * (1 - weight) + sortedData[upper] * weight;
}

/**
 * Calculate mode (most frequent value)
 */
function calculateMode(data) {
  const frequency = {};
  let maxFreq = 0;
  let mode = null;
  
  data.forEach(val => {
    frequency[val] = (frequency[val] || 0) + 1;
    if (frequency[val] > maxFreq) {
      maxFreq = frequency[val];
      mode = val;
    }
  });
  
  return mode;
}

/**
 * Calculate optimal bin count using various methods
 */
export function calculateBinCount(data, method = 'sturges') {
  const n = data.length;
  if (n === 0) return 1;
  
  const stats = calculateStats(data);
  if (!stats) return 1;
  
  switch (method.toLowerCase()) {
    case 'sturges':
    case 'auto (sturges)':
      // Sturges' formula: k = ceil(log2(n) + 1)
      return Math.ceil(Math.log2(n) + 1);
    
    case 'scott':
    case 'auto (scott)':
      // Scott's normal reference rule
      if (stats.stdDev === 0) return 1;
      const scottWidth = 3.5 * stats.stdDev / Math.pow(n, 1/3);
      return Math.ceil(stats.range / scottWidth);
    
    case 'freedman-diaconis':
    case 'auto (freedman-diaconis)':
      // Freedman-Diaconis rule
      if (stats.iqr === 0) return Math.ceil(Math.log2(n) + 1);
      const fdWidth = 2 * stats.iqr / Math.pow(n, 1/3);
      return Math.ceil(stats.range / fdWidth);
    
    case 'sqrt':
      // Square root choice
      return Math.ceil(Math.sqrt(n));
    
    case 'rice':
      // Rice rule
      return Math.ceil(2 * Math.pow(n, 1/3));
    
    default:
      return Math.ceil(Math.log2(n) + 1);
  }
}

/**
 * Generate histogram bins from data
 */
export function generateBins(data, options = {}) {
  if (!data || data.length === 0) {
    return [];
  }

  const {
    binMethod = 'Auto (Sturges)',
    binCount: customBinCount,
    binWidth: customBinWidth
  } = options;

  const stats = calculateStats(data);
  if (!stats) return [];

  let binCount;
  let binWidth;
  
  // Determine bin count/width based on method
  if (binMethod === 'Fixed Count' && customBinCount) {
    binCount = parseInt(customBinCount, 10) || 10;
    binWidth = stats.range / binCount;
  } else if (binMethod === 'Fixed Width' && customBinWidth) {
    binWidth = parseFloat(customBinWidth);
    binCount = Math.ceil(stats.range / binWidth);
  } else {
    binCount = calculateBinCount(data, binMethod);
    binWidth = stats.range / binCount;
  }

  // Ensure minimum bin count
  binCount = Math.max(1, binCount);
  
  // Handle edge case where all values are the same
  if (stats.range === 0) {
    binWidth = 1;
    binCount = 1;
  }

  // Generate bin edges
  const bins = [];
  const start = stats.min;
  
  for (let i = 0; i < binCount; i++) {
    const binStart = start + i * binWidth;
    const binEnd = start + (i + 1) * binWidth;
    
    bins.push({
      x0: binStart,
      x1: binEnd,
      count: 0,
      values: [],
      frequency: 0,
      relativeFrequency: 0,
      cumulativeCount: 0,
      cumulativeFrequency: 0
    });
  }

  // Assign data points to bins
  data.forEach(value => {
    // Find the appropriate bin
    let binIndex = Math.floor((value - start) / binWidth);
    
    // Handle edge case for maximum value
    if (binIndex >= binCount) {
      binIndex = binCount - 1;
    }
    if (binIndex < 0) {
      binIndex = 0;
    }
    
    bins[binIndex].count++;
    bins[binIndex].values.push(value);
  });

  // Calculate frequencies
  const totalCount = data.length;
  let cumulativeCount = 0;
  
  bins.forEach(bin => {
    bin.frequency = bin.count;
    bin.relativeFrequency = (bin.count / totalCount) * 100;
    cumulativeCount += bin.count;
    bin.cumulativeCount = cumulativeCount;
    bin.cumulativeFrequency = (cumulativeCount / totalCount) * 100;
  });

  return bins;
}

/**
 * Calculate normal distribution PDF for overlay
 */
export function normalPDF(x, mean, stdDev) {
  if (stdDev === 0) return 0;
  const coefficient = 1 / (stdDev * Math.sqrt(2 * Math.PI));
  const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2));
  return coefficient * Math.exp(exponent);
}

/**
 * Generate points for normal distribution curve
 */
export function generateNormalCurve(stats, bins, numPoints = 100) {
  if (!stats || !bins || bins.length === 0) return [];
  
  const { mean, stdDev, min, max } = stats;
  if (stdDev === 0) return [];
  
  // Extend range slightly for smoother curve
  const padding = (max - min) * 0.05;
  const start = min - padding;
  const end = max + padding;
  const step = (end - start) / numPoints;
  
  // Calculate total area of histogram for scaling
  const totalArea = bins.reduce((sum, bin) => {
    return sum + bin.count * (bin.x1 - bin.x0);
  }, 0);
  
  const points = [];
  for (let i = 0; i <= numPoints; i++) {
    const x = start + i * step;
    const y = normalPDF(x, mean, stdDev) * totalArea;
    points.push({ x, y });
  }
  
  return points;
}

/**
 * Format number for display with various format options
 */
export function formatNumber(value, decimals = 2, format = 'Auto') {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }
  
  switch (format) {
    case 'Integer':
      return Math.round(value).toLocaleString();
    
    case '1 Decimal':
      return value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    
    case '2 Decimals':
      return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    case 'Currency':
      return value.toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    
    case 'Percentage':
      return (value * 100).toFixed(1) + '%';
    
    case 'Thousands (K)':
      return (value / 1000).toFixed(1) + 'K';
    
    case 'Millions (M)':
      return (value / 1000000).toFixed(2) + 'M';
    
    case 'Auto':
    default:
      // Smart auto-formatting
      const absValue = Math.abs(value);
      if (absValue >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M';
      }
      if (absValue >= 10000) {
        return (value / 1000).toFixed(1) + 'K';
      }
      if (absValue >= 1000) {
        return (value / 1000).toFixed(2) + 'K';
      }
      if (Number.isInteger(value)) {
        return value.toLocaleString();
      }
      if (absValue < 1) {
        return value.toFixed(3);
      }
      return value.toFixed(decimals);
  }
}

/**
 * Format value for axis tick labels
 */
export function formatAxisValue(value, format = 'Auto') {
  return formatNumber(value, 1, format);
}

/**
 * Get bin midpoint
 */
export function getBinMidpoint(bin) {
  return (bin.x0 + bin.x1) / 2;
}

/**
 * Format bin label based on display preference
 */
export function formatBinLabel(bin, format = 'Bin Midpoints', numberFormat = 'Auto') {
  switch (format) {
    case 'Bin Ranges':
      return `${formatNumber(bin.x0, 1, numberFormat)} – ${formatNumber(bin.x1, 1, numberFormat)}`;
    
    case 'Lower Bounds':
      return formatNumber(bin.x0, 1, numberFormat);
    
    case 'Upper Bounds':
      return formatNumber(bin.x1, 1, numberFormat);
    
    case 'Bin Midpoints':
    default:
      return formatNumber(getBinMidpoint(bin), 1, numberFormat);
  }
}

/**
 * Format range for bin labels (for tooltips)
 */
export function formatBinRange(x0, x1, decimals = 1, numberFormat = 'Auto') {
  return `${formatNumber(x0, decimals, numberFormat)} – ${formatNumber(x1, decimals, numberFormat)}`;
}
