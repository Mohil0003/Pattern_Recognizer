// Utility function to highlight a specific candle on the chart
export const highlightCandle = (pattern, ohlcvData, layout) => {
  if (!layout || !pattern || !ohlcvData || ohlcvData.length === 0) return layout;

  const updatedLayout = { ...layout };
  
  // Find the candle data by candleIndex
  const candleData = ohlcvData[pattern.candleIndex];
  if (!candleData) {
    console.warn(`No candle data found for index ${pattern.candleIndex}`);
    return layout;
  }
  
  // Add annotation to highlight the candle
  if (!updatedLayout.annotations) {
    updatedLayout.annotations = [];
  }

  // Remove existing highlight annotations
  updatedLayout.annotations = updatedLayout.annotations.filter(
    ann => ann.name !== 'pattern-highlight'
  );

  // Add new highlight annotation using timestamp as x-coordinate
  updatedLayout.annotations.push({
    x: candleData.timestamp,
    y: candleData.high + (candleData.high * 0.02), // Position above the candle
    xref: 'x',
    yref: 'y',
    text: `${pattern.pattern}<br>${(pattern.confidence * 100).toFixed(0)}%`,
    showarrow: true,
    arrowhead: 2,
    arrowsize: 1.5,
    arrowwidth: 3,
    arrowcolor: '#3b82f6',
    bgcolor: '#3b82f6',
    bordercolor: '#1e40af',
    borderwidth: 2,
    font: {
      size: 12,
      color: 'white'
    },
    name: 'pattern-highlight',
    opacity: 0.9
  });

  return updatedLayout;
};

// Utility function to get pattern color based on pattern type
export const getPatternColor = (patternType) => {
  const colorMap = {
    'Hammer': '#10b981', // Green for bullish
    'Doji': '#f59e0b', // Yellow for neutral
    'Engulfing': '#3b82f6', // Blue for strong signal
    'Shooting Star': '#ef4444', // Red for bearish
    'Morning Star': '#10b981', // Green for bullish
    'Evening Star': '#ef4444', // Red for bearish
    'Hanging Man': '#ef4444', // Red for bearish
    'Three White Soldiers': '#10b981', // Green for bullish
    'Three Black Crows': '#ef4444', // Red for bearish
    'default': '#6b7280' // Gray for unknown patterns
  };

  return colorMap[patternType] || colorMap.default;
};

// Utility function to get pattern confidence color
export const getConfidenceColor = (confidence) => {
  if (confidence >= 0.9) return '#10b981'; // High confidence - green
  if (confidence >= 0.7) return '#f59e0b'; // Medium confidence - yellow
  return '#ef4444'; // Low confidence - red
};

// Utility function to format timestamp
export const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Utility function to get pattern description
export const getPatternDescription = (patternType) => {
  const descriptions = {
    'Hammer': 'Bullish reversal pattern with small body and long lower shadow',
    'Doji': 'Indecision pattern with open and close at same level',
    'Engulfing': 'Strong reversal pattern where one candle engulfs the previous',
    'Shooting Star': 'Bearish reversal pattern with small body and long upper shadow',
    'Morning Star': 'Three-candle bullish reversal pattern',
    'Evening Star': 'Three-candle bearish reversal pattern',
    'Hanging Man': 'Bearish reversal pattern similar to hammer but at top',
    'Three White Soldiers': 'Strong bullish continuation pattern',
    'Three Black Crows': 'Strong bearish continuation pattern'
  };

  return descriptions[patternType] || 'Pattern detected';
}; 