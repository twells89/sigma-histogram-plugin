# Sigma Enhanced Histogram Plugin

A custom histogram plugin for Sigma Computing that **solves the BinFixed() limitations** and provides meaningful X-axis labels without clunky workarounds.

---

## 🎯 Problem This Solves

### Native Sigma BinFixed() Issues:

1. **Useless X-axis labels**: Native histograms using `BinFixed()` display **"bin 1, bin 2, bin 3"** instead of actual data values
2. **Clunky workarounds required**: To show meaningful labels, you have to create **two extra columns** – one for `BinFixed()` and another to calculate midpoints

### This Plugin's Solution:

✅ **Automatic meaningful labels** – Shows actual value ranges like `10–20`, `20–30` or midpoints like `15`, `25`  
✅ **Zero extra columns needed** – Just select your data column and you're done  
✅ **Flexible label formats** – Choose from Range, Midpoint, Lower Bound, or Upper Bound  

---

## X-Axis Label Formats

| Format | Example Labels | Best For |
|--------|---------------|----------|
| **Range (10-20)** | `0–10`, `10–20`, `20–30` | Clear bin boundaries |
| **Midpoint (15)** | `5`, `15`, `25` | Cleaner look, less clutter |
| **Lower Bound (10)** | `0`, `10`, `20` | Interval start points |
| **Upper Bound (20)** | `10`, `20`, `30` | Interval end points |

---

## Before & After

### ❌ Native BinFixed() Chart
```
X-axis: bin 1 | bin 2 | bin 3 | bin 4 | bin 5
        (what do these mean??)
```

### ✅ This Plugin
```
X-axis: 0–100 | 100–200 | 200–300 | 300–400 | 400–500
        (actual value ranges!)
```

---

## Features

### 📊 Smart Binning (No Extra Columns!)
- **Auto (Sturges)** – Classic formula based on data size
- **Auto (Scott)** – Optimal for normally distributed data  
- **Auto (Freedman-Diaconis)** – Robust to outliers using IQR
- **Fixed Count** – Specify exact number of bins
- **Fixed Width** – Specify exact bin width

### 📈 Multiple Chart Types
- Frequency (count)
- Relative Frequency (%)
- Cumulative count
- Cumulative (%)

### 📉 Statistical Overlays
- Mean line (dashed, color-coded)
- Median line (dashed, color-coded)
- Standard deviation range (shaded ±1σ)
- Normal distribution curve overlay

### 🎨 Visual Customization
- 6 color schemes + custom color picker
- Configurable bar gaps
- Toggle gridlines
- Optional bar value labels

### 📋 Built-in Statistics Panel
Displays N, Mean, Median, Std Dev, and Range right in the chart header.

### 🔍 Rich Tooltips
Hover any bar to see:
- Bin range (e.g., "150 – 200")
- Count
- Frequency %
- Cumulative values (if applicable)

---

## Quick Start

### 1. Install Dependencies

```bash
cd sigma-histogram-plugin
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The plugin runs at `http://localhost:3000`

### 3. Add to Sigma Workbook

1. Open a workbook → **Edit** mode
2. Click **+** → **UI ELEMENTS** → **PLUGINS**
3. Select **Sigma Plugin Dev Playground**
4. Configure:
   - **Data Source**: Select a table
   - **Value Column**: Select a numeric column
   - **X-Axis Bin Labels**: Choose your preferred format

That's it! No extra columns needed.

---

## Configuration Options

### Binning Options

| Option | Description |
|--------|-------------|
| **Bin Method** | Algorithm for calculating bin boundaries |
| **Bin Count** | Number of bins (when using Fixed Count) |
| **Bin Width** | Width of each bin (when using Fixed Width) |
| **X-Axis Bin Labels** | How to display bin values on X-axis |

### Display Options

| Option | Description |
|--------|-------------|
| Chart Type | Frequency, Relative %, Cumulative, Cumulative % |
| Color Scheme | Ocean Blue, Forest Green, Sunset Orange, Purple Haze, Grayscale, Custom |
| Show Gridlines | Toggle horizontal grid lines |
| Bar Gap | None, Small, Medium, Large |

### Statistical Overlays

| Option | Description |
|--------|-------------|
| Show Mean Line | Dashed vertical line at the mean |
| Show Median Line | Dashed vertical line at the median |
| Show Std Dev Range | Shaded ±1 standard deviation area |
| Show Normal Curve | Fitted Gaussian distribution curve |
| Show Statistics Panel | Summary stats in header |

### Labels

| Option | Description |
|--------|-------------|
| Chart Title | Main title above chart |
| X-Axis Label | Label below horizontal axis |
| Y-Axis Label | Label beside vertical axis |
| Show Bar Labels | Display count/value above each bar |

---

## Comparison with Native Histogram

| Feature | Native Histogram | This Plugin |
|---------|------------------|-------------|
| **X-axis labels** | ❌ "bin 1, bin 2, bin 3" | ✅ Actual values/ranges |
| **Extra columns needed** | ❌ 2 columns for workaround | ✅ None |
| Binning methods | Limited | 5 algorithms |
| Chart types | 1 | 4 |
| Mean/Median lines | ❌ | ✅ |
| Std dev range | ❌ | ✅ |
| Normal curve overlay | ❌ | ✅ |
| Statistics panel | ❌ | ✅ |
| Rich tooltips | Basic | ✅ Detailed |

---

## Building for Production

```bash
npm run build
```

Output files are in the `dist` directory.

### Hosting Options
- **Netlify** – Drop `dist` folder or connect git repo
- **Vercel** – Similar to Netlify
- **AWS S3** – Static website hosting
- **GitHub Pages** – Free for public repos

### Register with Sigma

1. **Administration** → **Plugins** → **Add Plugin**
2. Enter your hosted URL as Production URL
3. Set permissions

See [Sigma docs](https://help.sigmacomputing.com/docs/register-a-plugin-with-your-sigma-organization) for details.

---

## Tech Stack

- **React 18** – UI framework
- **D3.js 7** – Visualization
- **Vite** – Build tool
- **@sigmacomputing/plugin** – Sigma Plugin API

---

## Troubleshooting

### Plugin not loading
- Verify dev server is running on port 3000
- Check browser console for errors
- Confirm plugin permissions in Sigma

### No data showing
- Ensure a numeric column is selected
- Check for null/empty values
- Verify data element has data

### Labels overlapping
- Switch to **Midpoint** format for fewer characters
- Use **Fixed Count** with fewer bins
- Labels auto-rotate when >8 bins with Range format

---

## License

MIT – Free to use and modify.
