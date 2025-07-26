# 📊 Pattern Recognizer

A modern React application for visualizing candlestick charts with intelligent pattern detection and highlighting capabilities. Built with React, TailwindCSS, and Plotly.js.

## 🎯 Features

- **Interactive Candlestick Charts**: Beautiful, responsive charts with volume indicators
- **Pattern Detection**: Automatic detection of various candlestick patterns
- **Click-to-Highlight**: Click on patterns in the table to highlight corresponding candles on the chart
- **Real-time Data**: Fetches OHLCV data and pattern detection results
- **Symbol Switching**: Switch between different stock symbols (RELIANCE, INFY)
- **Pattern Statistics**: Dashboard with pattern statistics and confidence levels
- **Responsive Design**: Modern UI that works on desktop and mobile devices

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks
- **TailwindCSS** - Utility-first CSS framework
- **Plotly.js** - Interactive charting library
- **Create React App** - Development environment

## 📁 Project Structure

```
Pattern_Recognizer/
├── public/
│   ├── index.html
│   └── data/
│       ├── patterns.json          # Pattern detection data
│       └── ohlcv/
│           ├── RELIANCE.json      # OHLCV data for RELIANCE
│           └── INFY.json          # OHLCV data for INFY
├── src/
│   ├── components/
│   │   ├── Header.jsx            # Navigation and symbol selector
│   │   ├── PatternTable.jsx      # Pattern display table
│   │   └── CandlestickChart.jsx  # Interactive chart component
│   ├── pages/
│   │   └── Dashboard.jsx         # Main dashboard page
│   ├── hooks/
│   │   └── useOHLCVData.js       # Data fetching hook
│   ├── utils/
│   │   └── highlightPattern.js   # Pattern highlighting utilities
│   ├── App.jsx                   # Main app component
│   ├── index.js                  # App entry point
│   └── index.css                 # Global styles
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Pattern_Recognizer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 📊 Supported Patterns

The application detects and visualizes the following candlestick patterns:

### Bullish Patterns (Green)
- **Hammer** - Bullish reversal with small body and long lower shadow
- **Morning Star** - Three-candle bullish reversal pattern
- **Three White Soldiers** - Strong bullish continuation pattern
- **Engulfing** - Bullish engulfing pattern

### Bearish Patterns (Red)
- **Shooting Star** - Bearish reversal with small body and long upper shadow
- **Evening Star** - Three-candle bearish reversal pattern
- **Hanging Man** - Bearish reversal pattern at the top

### Neutral Patterns (Yellow)
- **Doji** - Indecision pattern with open and close at same level

## 🎨 UI Features

### Pattern Table
- Click on any pattern row to highlight the corresponding candle
- Color-coded patterns based on bullish/bearish/neutral signals
- Confidence indicators with percentage display
- Pattern descriptions and timestamps

### Interactive Chart
- Candlestick chart with volume bars
- Pattern highlighting with annotations
- Zoom and pan capabilities
- Hover tooltips with detailed information

### Statistics Dashboard
- Total pattern count
- Bullish vs Bearish pattern breakdown
- Neutral pattern count
- Real-time updates

## 🔧 Configuration

### Adding New Symbols

1. Add OHLCV data file to `public/data/ohlcv/`
2. Add pattern data to `public/data/patterns.json`
3. Update the symbols array in `Header.jsx`

### Customizing Patterns

Edit `src/utils/highlightPattern.js` to:
- Add new pattern types
- Modify color schemes
- Update pattern descriptions

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🎯 Usage

1. **Select a Symbol**: Use the dropdown in the header to switch between RELIANCE and INFY
2. **View Patterns**: Browse detected patterns in the left sidebar
3. **Highlight Patterns**: Click on any pattern row to highlight the corresponding candle
4. **Analyze Statistics**: View pattern statistics in the bottom dashboard
5. **Interact with Chart**: Use chart controls for zoom, pan, and hover information

## 🔍 Pattern Detection Logic

The application includes realistic pattern detection with:
- Confidence scores (0-1 scale)
- Timestamp tracking
- Candle index mapping
- Pattern descriptions

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Static Hosting

The build output can be deployed to:
- Netlify
- Vercel
- GitHub Pages
- Any static hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

---

**Built with ❤️ using React, TailwindCSS, and Plotly.js**