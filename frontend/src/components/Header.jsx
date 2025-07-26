import React from 'react';

const Header = ({ selectedSymbol, onSymbolChange, onBackToLanding, showSymbolSelector = true }) => {
  const symbols = ['RELIANCE', 'INFY', 'TCS', 'HDFC', 'SBIN'];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {onBackToLanding && (
              <button
                onClick={onBackToLanding}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back to Dashboard</span>
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                📊 Pattern Recognizer
              </h1>
              <span className="text-sm text-gray-500">
                Candlestick Pattern Detection & Visualization
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {showSymbolSelector && (
              <div className="flex items-center space-x-2">
                <label htmlFor="symbol-select" className="text-sm font-medium text-gray-700">
                  Symbol:
                </label>
                <select
                  id="symbol-select"
                  value={selectedSymbol || 'RELIANCE'}
                  onChange={(e) => onSymbolChange && onSymbolChange(e.target.value)}
                  className="block w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  {symbols.map((symbol) => (
                    <option key={symbol} value={symbol}>
                      {symbol}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className="flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span>
                Bullish
              </span>
              <span className="flex items-center">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-1"></span>
                Bearish
              </span>
              <span className="flex items-center">
                <span className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></span>
                Neutral
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 