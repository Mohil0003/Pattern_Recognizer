import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';
import { highlightCandle } from '../utils/highlightPattern';

const CandlestickChart = ({ ohlcvData, selectedPattern, onChartClick }) => {
  const chartData = useMemo(() => {
    if (!ohlcvData || ohlcvData.length === 0) return [];

    const open = ohlcvData.map(d => d.open);
    const high = ohlcvData.map(d => d.high);
    const low = ohlcvData.map(d => d.low);
    const close = ohlcvData.map(d => d.close);
    const volume = ohlcvData.map(d => d.volume);
    const timestamps = ohlcvData.map(d => d.timestamp);

    return [
      {
        type: 'candlestick',
        x: timestamps,
        open: open,
        high: high,
        low: low,
        close: close,
        name: 'OHLC',
        increasing: {
          line: { color: '#10b981' },
          fillcolor: '#10b981'
        },
        decreasing: {
          line: { color: '#ef4444' },
          fillcolor: '#ef4444'
        }
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
        }
      }
    ];
  }, [ohlcvData]);

  const layout = useMemo(() => {
    const baseLayout = {
      title: {
        text: 'Candlestick Chart with Pattern Detection',
        font: { size: 18, color: '#1f2937' }
      },
      xaxis: {
        title: 'Time',
        type: 'date',
        rangeslider: { visible: false },
        gridcolor: '#e5e7eb'
      },
      yaxis: {
        title: 'Price',
        side: 'left',
        gridcolor: '#e5e7eb',
        tickformat: ',.0f'
      },
      yaxis2: {
        title: 'Volume',
        side: 'right',
        overlaying: 'y',
        gridcolor: '#e5e7eb',
        tickformat: ',.0f'
      },
      legend: {
        orientation: 'h',
        y: -0.2
      },
      margin: {
        l: 60,
        r: 60,
        t: 60,
        b: 60
      },
      plot_bgcolor: 'white',
      paper_bgcolor: 'white',
      font: {
        color: '#374151'
      },
      hovermode: 'x unified',
      hoverlabel: {
        bgcolor: 'white',
        bordercolor: '#d1d5db',
        font: { color: '#374151' }
      }
    };

    // Highlight selected pattern
    if (selectedPattern) {
      return highlightCandle(selectedPattern.candleIndex, baseLayout);
    }

    return baseLayout;
  }, [selectedPattern]);

  const config = {
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
    responsive: true
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
    <div className="chart-container p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
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
          <p className="text-sm text-gray-600">
            Confidence: {(selectedPattern.confidence * 100).toFixed(0)}% | 
            Time: {new Date(selectedPattern.timestamp).toLocaleString()}
          </p>
        )}
      </div>
      
      <div className="w-full h-96">
        <Plot
          data={chartData}
          layout={layout}
          config={config}
          style={{ width: '100%', height: '100%' }}
          onClick={onChartClick}
          useResizeHandler={true}
        />
      </div>
      
      {selectedPattern && (
        <div className="mt-4 p-3 bg-primary-50 border border-primary-200 rounded-md">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-primary-500 rounded-full mr-2"></div>
            <span className="text-sm font-medium text-primary-800">
              Pattern Highlighted: {selectedPattern.pattern}
            </span>
          </div>
          <p className="text-sm text-primary-700 mt-1">
            {selectedPattern.description}
          </p>
        </div>
      )}
    </div>
  );
};

export default CandlestickChart; 