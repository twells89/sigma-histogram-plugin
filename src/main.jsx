import React from 'react'
import ReactDOM from 'react-dom/client'
import { client } from '@sigmacomputing/plugin'
import App from './App'
import './index.css'

// Configure the editor panel with all options
client.config.configureEditorPanel([
  // Data Source
  { 
    name: 'source', 
    type: 'element',
    label: 'Data Source'
  },
  { 
    name: 'valueColumn', 
    type: 'column', 
    source: 'source', 
    allowMultiple: false,
    label: 'Value Column',
    allowedTypes: ['number', 'integer']
  },
  
  // Binning Options Group
  { 
    name: 'binningOptions', 
    type: 'group',
    label: 'Binning Options'
  },
  { 
    name: 'binMethod', 
    type: 'dropdown',
    source: 'binningOptions',
    label: 'Bin Method',
    values: ['Auto (Sturges)', 'Auto (Scott)', 'Auto (Freedman-Diaconis)', 'Fixed Count', 'Fixed Width'],
    defaultValue: 'Auto (Sturges)'
  },
  { 
    name: 'binCount', 
    type: 'text',
    source: 'binningOptions',
    label: 'Bin Count (if Fixed)',
    placeholder: '10',
    defaultValue: '10'
  },
  { 
    name: 'binWidth', 
    type: 'text',
    source: 'binningOptions',
    label: 'Bin Width (if Fixed)',
    placeholder: 'Auto'
  },
  { 
    name: 'binLabelFormat', 
    type: 'dropdown',
    source: 'binningOptions',
    label: 'X-Axis Bin Labels',
    values: ['Range (10-20)', 'Midpoint (15)', 'Lower Bound (10)', 'Upper Bound (20)'],
    defaultValue: 'Range (10-20)'
  },

  // Display Options Group
  { 
    name: 'displayOptions', 
    type: 'group',
    label: 'Display Options'
  },
  { 
    name: 'chartType', 
    type: 'dropdown',
    source: 'displayOptions',
    label: 'Chart Type',
    values: ['Frequency', 'Relative Frequency (%)', 'Cumulative', 'Cumulative (%)'],
    defaultValue: 'Frequency'
  },
  { 
    name: 'colorScheme', 
    type: 'dropdown',
    source: 'displayOptions',
    label: 'Color Scheme',
    values: ['Ocean Blue', 'Forest Green', 'Sunset Orange', 'Purple Haze', 'Grayscale', 'Custom'],
    defaultValue: 'Ocean Blue'
  },
  { 
    name: 'customColor', 
    type: 'color',
    source: 'displayOptions',
    label: 'Custom Bar Color'
  },
  { 
    name: 'showGridlines', 
    type: 'toggle',
    source: 'displayOptions',
    label: 'Show Gridlines',
    defaultValue: true
  },
  { 
    name: 'barGap', 
    type: 'dropdown',
    source: 'displayOptions',
    label: 'Bar Gap',
    values: ['None', 'Small', 'Medium', 'Large'],
    defaultValue: 'Small'
  },
  
  // Statistics Overlays Group
  { 
    name: 'statisticsOptions', 
    type: 'group',
    label: 'Statistical Overlays'
  },
  { 
    name: 'showMean', 
    type: 'toggle',
    source: 'statisticsOptions',
    label: 'Show Mean Line',
    defaultValue: false
  },
  { 
    name: 'showMedian', 
    type: 'toggle',
    source: 'statisticsOptions',
    label: 'Show Median Line',
    defaultValue: false
  },
  { 
    name: 'showStdDev', 
    type: 'toggle',
    source: 'statisticsOptions',
    label: 'Show Std Dev Range',
    defaultValue: false
  },
  { 
    name: 'showNormalCurve', 
    type: 'toggle',
    source: 'statisticsOptions',
    label: 'Show Normal Distribution Curve',
    defaultValue: false
  },
  { 
    name: 'showStats', 
    type: 'toggle',
    source: 'statisticsOptions',
    label: 'Show Statistics Panel',
    defaultValue: true
  },

  // Labels Group
  { 
    name: 'labelsOptions', 
    type: 'group',
    label: 'Labels & Axes'
  },
  { 
    name: 'chartTitle', 
    type: 'text',
    source: 'labelsOptions',
    label: 'Chart Title',
    placeholder: 'Histogram'
  },
  { 
    name: 'xAxisLabel', 
    type: 'text',
    source: 'labelsOptions',
    label: 'X-Axis Label',
    placeholder: 'Value'
  },
  { 
    name: 'yAxisLabel', 
    type: 'text',
    source: 'labelsOptions',
    label: 'Y-Axis Label',
    placeholder: 'Frequency'
  },
  {
    name: 'xAxisFormat',
    type: 'dropdown',
    source: 'labelsOptions',
    label: 'X-Axis Tick Format',
    values: ['Range (10–20)', 'Midpoint', 'Lower Bound', 'Upper Bound'],
    defaultValue: 'Range (10–20)'
  },
  {
    name: 'numberFormat',
    type: 'dropdown',
    source: 'labelsOptions',
    label: 'Number Format',
    values: ['Auto', 'Integer', '1 Decimal', '2 Decimals', 'Currency ($)', 'Thousands (K)', 'Millions (M)'],
    defaultValue: 'Auto'
  },
  {
    name: 'rotateLabels',
    type: 'toggle',
    source: 'labelsOptions',
    label: 'Rotate X Labels (for long ranges)',
    defaultValue: false
  },
  {
    name: 'showBinRangeInTooltip',
    type: 'toggle',
    source: 'labelsOptions',
    label: 'Show Bin Range in Tooltip',
    defaultValue: true
  },
  { 
    name: 'showBarLabels', 
    type: 'toggle',
    source: 'labelsOptions',
    label: 'Show Bar Value Labels',
    defaultValue: false
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
