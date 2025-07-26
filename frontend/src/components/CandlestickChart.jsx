import React, { useMemo, useState } from 'react';
import Plot from 'react-plotly.js';
import Plotly from 'plotly.js';
import { highlightCandle } from '../utils/highlightPattern';

const CandlestickChart = ({ ohlcvData, selectedPattern, onChartClick, patterns }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('5min');
  const [autoDetectPatterns, setAutoDetectPatterns] = useState(true);
  
  // Available timeframes
  const timeframes = [
    { value: '1min', label: '1m' },
    { value: '5min', label: '5m' },
    { value: '10min', label: '10m' },
    { value: '15min', label: '15m' },
    { value: '30min', label: '30m' },
    { value: '1hr', label: '1h' }
  ];

  // Filter patterns by selected timeframe
  const filteredPatterns = useMemo(() => {
    if (!patterns || !Array.isArray(patterns)) return [];
    // If no timeframe filter is available, show all patterns
    return patterns.filter(pattern => {
      if (!pattern.timeframe) return true; // Show patterns without timeframe
      return pattern.timeframe === selectedTimeframe;
    });
  }, [patterns, selectedTimeframe]);

  const chartData = useMemo(() => {
    if (!ohlcvData || ohlcvData.length === 0) {
      console.log('No OHLCV data available for chart');
      return [];
    }

    try {
      // Validate and extract data with error handling
      const open = ohlcvData.map(d => {
        if (typeof d.open !== 'number' || isNaN(d.open)) {
          console.warn('Invalid open value:', d.open);
          return 0;
        }
        return d.open;
      });
      
      const high = ohlcvData.map(d => {
        if (typeof d.high !== 'number' || isNaN(d.high)) {
          console.warn('Invalid high value:', d.high);
          return 0;
        }
        return d.high;
      });
      
      const low = ohlcvData.map(d => {
        if (typeof d.low !== 'number' || isNaN(d.low)) {
          console.warn('Invalid low value:', d.low);
          return 0;
        }
        return d.low;
      });
      
      const close = ohlcvData.map(d => {
        if (typeof d.close !== 'number' || isNaN(d.close)) {
          console.warn('Invalid close value:', d.close);
          return 0;
        }
        return d.close;
      });
      
      const volume = ohlcvData.map(d => {
        if (typeof d.volume !== 'number' || isNaN(d.volume)) {
          console.warn('Invalid volume value:', d.volume);
          return 0;
        }
        return d.volume;
      });
      
      const timestamps = ohlcvData.map(d => {
        if (!d.timestamp) {
          console.warn('Missing timestamp:', d);
          return new Date().toISOString();
        }
        return d.timestamp;
      });
      
      console.log(`Processing ${ohlcvData.length} candles for chart`);

    const traces = [
      {
        type: 'candlestick',
        x: timestamps,
        open: open,
        high: high,
        low: low,
        close: close,
        name: 'OHLC',
        increasing: {
          line: { color: '#10b981', width: 1 },
          fillcolor: '#10b981'
        },
        decreasing: {
          line: { color: '#ef4444', width: 1 },
          fillcolor: '#ef4444'
        },
        hovertemplate: '<b>%{x}</b><br>' +
          'Open: %{open}<br>' +
          'High: %{high}<br>' +
          'Low: %{low}<br>' +
          'Close: %{close}<br>' +
          '<extra></extra>'
      },
      {
        type: 'bar',
        x: timestamps,
        y: volume,
        name: 'Volume',
        yaxis: 'y2',
        marker: {
          color: '#6b7280',
          opacity: 0.6
        },
        hovertemplate: '<b>%{x}</b><br>Volume: %{y:,}<extra></extra>'
      }
    ];

    // Add pattern markers if auto-detect is enabled
    if (autoDetectPatterns && filteredPatterns.length > 0) {
      // Filter patterns that have valid candle indices
      const validPatterns = filteredPatterns.filter(p => {
        return p.candleIndex >= 0 && p.candleIndex < ohlcvData.length;
      });
      
      if (validPatterns.length > 0) {
        const patternMarkers = {
          type: 'scatter',
          mode: 'markers',
          x: validPatterns.map(p => {
            const candleData = ohlcvData[p.candleIndex];
            return candleData ? candleData.timestamp : timestamps[p.candleIndex];
          }),
          y: validPatterns.map(p => {
            const candleData = ohlcvData[p.candleIndex];
            return candleData ? candleData.high + (candleData.high * 0.02) : high[p.candleIndex] + (high[p.candleIndex] * 0.02);
          }),
          name: 'Patterns',
          marker: {
            symbol: 'triangle-up',
            size: 12,
            color: validPatterns.map(p => {
              if (['Hammer', 'Morning Star', 'Three White Soldiers', 'Engulfing'].includes(p.pattern)) {
                return '#10b981'; // Green for bullish
              } else if (['Shooting Star', 'Evening Star', 'Hanging Man'].includes(p.pattern)) {
                return '#ef4444'; // Red for bearish
              } else {
                return '#f59e0b'; // Yellow for neutral
              }
            }),
            line: {
              color: '#ffffff',
              width: 2
            }
          },
          text: validPatterns.map(p => `${p.pattern} (${(p.confidence * 100).toFixed(0)}%)`),
          hovertemplate: '<b>%{text}</b><br>' +
            'Time: %{x}<br>' +
            'Description: %{text}<br>' +
            '<extra></extra>'
        };
        traces.push(patternMarkers);
      }
    }

    return traces;
    } catch (error) {
      console.error('Error processing chart data:', error);
      return [];
    }
  }, [ohlcvData, filteredPatterns, autoDetectPatterns]);

  const layout = useMemo(() => {
    const baseLayout = {
      title: {
        text: `Candlestick Chart - ${selectedTimeframe} Timeframe`,
        font: { size: 18, color: '#1f2937' }
      },
      xaxis: {
        title: 'Time',
        type: 'date',
        rangeslider: { 
          visible: true,
          bgcolor: '#f9fafb',
          bordercolor: '#d1d5db',
          borderwidth: 1
        },
        gridcolor: '#e5e7eb',
        showspikes: true,
        spikecolor: '#6b7280',
        spikethickness: 1
      },
      yaxis: {
        title: 'Price',
        side: 'left',
        gridcolor: '#e5e7eb',
        tickformat: ',.2f',
        showspikes: true,
        spikecolor: '#6b7280',
        spikethickness: 1
      },
      yaxis2: {
        title: 'Volume',
        side: 'right',
        overlaying: 'y',
        gridcolor: '#e5e7eb',
        tickformat: ',.0f',
        domain: [0, 0.2]
      },
      legend: {
        orientation: 'h',
        y: -0.15,
        x: 0.5,
        xanchor: 'center'
      },
      margin: {
        l: 60,
        r: 80,
        t: 80,
        b: 60
      },
      plot_bgcolor: 'white',
      paper_bgcolor: 'white',
      font: {
        color: '#374151',
        size: 12
      },
      hovermode: 'x unified',
      hoverlabel: {
        bgcolor: 'rgba(255, 255, 255, 0.9)',
        bordercolor: '#d1d5db',
        font: { color: '#374151' }
      },
      showlegend: true
    };

    // Highlight selected pattern
    if (selectedPattern) {
      return highlightCandle(selectedPattern, ohlcvData, baseLayout);
    }

    return baseLayout;
  }, [selectedPattern, selectedTimeframe, ohlcvData]);

  const config = {
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d', 'autoScale2d'],
    modeBarButtonsToAdd: [{
      name: 'Reset Zoom',
      icon: 'home',
      click: function(gd) {
        Plotly.relayout(gd, {
          'xaxis.autorange': true,
          'yaxis.autorange': true
        });
      }
    }],
    responsive: true,
    toImageButtonOptions: {
      format: 'png',
      filename: `chart_${selectedTimeframe}`,
      height: 600,
      width: 1200,
      scale: 1
    }
  };

  if (!ohlcvData || ohlcvData.length === 0) {
    return (
      <div className="chart-container p-6">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">📈</div>
          <p>No chart data available</p>
          <p className="text-sm">Please select a symbol to view the chart</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header with controls */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedPattern ? (
                <span>
                  Selected Pattern: <span className="text-primary-600">{selectedPattern.pattern}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    (Candle #{selectedPattern.candleIndex})
                  </span>
                </span>
              ) : (
                'Candlestick Chart'
              )}
            </h3>
            {selectedPattern && (
              <p className="text-sm text-gray-600 mt-1">
                Confidence: {(selectedPattern.confidence * 100).toFixed(0)}% | 
                Time: {new Date(selectedPattern.timestamp).toLocaleString()}
              </p>
            )}
          </div>
          
          {/* Pattern Detection Toggle */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoDetectPatterns}
                onChange={(e) => setAutoDetectPatterns(e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Auto-detect Patterns</span>
            </label>
            <div className="text-sm text-gray-600">
              Patterns: {filteredPatterns.length}
            </div>
          </div>
        </div>
        
        {/* Timeframe Tabs */}
        <div className="mt-4">
          <div className="flex flex-wrap gap-1 p-1 bg-gray-100 rounded-lg">
            {timeframes.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setSelectedTimeframe(tf.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  selectedTimeframe === tf.value
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Chart */}
      <div className="p-3">
        <div className="w-full" style={{ height: '600px' }}>
          <Plot
            data={chartData}
            layout={layout}
            config={config}
            style={{ width: '100%', height: '100%' }}
            onClick={onChartClick}
            useResizeHandler={true}
          />
        </div>
      </div>
      
      {/* Pattern Information */}
      {selectedPattern && (
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <span className="text-primary-600 text-lg">📊</span>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-primary-800 mb-1">
                  {selectedPattern.pattern} Pattern Detected
                </h4>
                <p className="text-sm text-primary-700 mb-2">
                  {selectedPattern.description}
                </p>
                <div className="flex flex-wrap gap-4 text-xs text-primary-600">
                  <span>Timeframe: {selectedPattern.timeframe}</span>
                  <span>Confidence: {(selectedPattern.confidence * 100).toFixed(1)}%</span>
                  <span>Index: #{selectedPattern.candleIndex}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Pattern Legend */}
      {autoDetectPatterns && filteredPatterns.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Pattern Legend</h5>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Bullish Patterns</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-600">Bearish Patterns</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-600">Neutral Patterns</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandlestickChart; 