import React from 'react'
import ReactDOM from 'react-dom/client'
import { client, SigmaClientProvider } from '@sigmacomputing/plugin'
import App from './App'
import './index.css'

client.config.configureEditorPanel([
  { name: 'source', type: 'element', label: 'Data Source' },
  { name: 'valueColumn', type: 'column', source: 'source', allowMultiple: false, label: 'Value Column' },
  { name: 'binningOptions', type: 'group', label: 'Binning Options' },
  { name: 'binMethod', type: 'dropdown', source: 'binningOptions', label: 'Bin Method', values: ['Auto (Sturges)', 'Auto (Scott)', 'Auto (Freedman-Diaconis)', 'Fixed Count', 'Fixed Width'], defaultValue: 'Auto (Sturges)' },
  { name: 'binCount', type: 'text', source: 'binningOptions', label: 'Bin Count (if Fixed)', defaultValue: '10' },
  { name: 'binWidth', type: 'text', source: 'binningOptions', label: 'Bin Width (if Fixed)' },
  { name: 'displayOptions', type: 'group', label: 'Display Options' },
  { name: 'chartType', type: 'dropdown', source: 'displayOptions', label: 'Chart Type', values: ['Frequency', 'Relative Frequency (%)', 'Cumulative', 'Cumulative (%)'], defaultValue: 'Frequency' },
  { name: 'colorScheme', type: 'dropdown', source: 'displayOptions', label: 'Color Scheme', values: ['Ocean Blue', 'Forest Green', 'Sunset Orange', 'Purple Haze', 'Grayscale'], defaultValue: 'Ocean Blue' },
  { name: 'showGridlines', type: 'toggle', source: 'displayOptions', label: 'Show Gridlines', defaultValue: true },
  { name: 'barGap', type: 'dropdown', source: 'displayOptions', label: 'Bar Gap', values: ['None', 'Small', 'Medium', 'Large'], defaultValue: 'Small' },
  { name: 'statisticsOptions', type: 'group', label: 'Statistical Overlays' },
  { name: 'showMean', type: 'toggle', source: 'statisticsOptions', label: 'Show Mean Line', defaultValue: false },
  { name: 'showMedian', type: 'toggle', source: 'statisticsOptions', label: 'Show Median Line', defaultValue: false },
  { name: 'showStdDev', type: 'toggle', source: 'statisticsOptions', label: 'Show Std Dev Range', defaultValue: false },
  { name: 'showNormalCurve', type: 'toggle', source: 'statisticsOptions', label: 'Show Normal Curve', defaultValue: false },
  { name: 'showStats', type: 'toggle', source: 'statisticsOptions', label: 'Show Statistics Panel', defaultValue: true },
  { name: 'labelsOptions', type: 'group', label: 'Labels' },
  { name: 'chartTitle', type: 'text', source: 'labelsOptions', label: 'Chart Title' },
  { name: 'xAxisLabel', type: 'text', source: 'labelsOptions', label: 'X-Axis Label' },
  { name: 'yAxisLabel', type: 'text', source: 'labelsOptions', label: 'Y-Axis Label' },
  { name: 'xAxisFormat', type: 'dropdown', source: 'labelsOptions', label: 'X-Axis Format', values: ['Range', 'Midpoint', 'Lower Bound', 'Upper Bound'], defaultValue: 'Range' },
  { name: 'showBarLabels', type: 'toggle', source: 'labelsOptions', label: 'Show Bar Labels', defaultValue: false }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SigmaClientProvider client={client}>
      <App />
    </SigmaClientProvider>
  </React.StrictMode>
)
