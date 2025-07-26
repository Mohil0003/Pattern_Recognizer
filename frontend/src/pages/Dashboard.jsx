import React, { useState } from 'react';
import PatternTable from '../components/PatternTable';
import CandlestickChart from '../components/CandlestickChart';
import useOHLCVData from '../hooks/useOHLCVData';

const Dashboard = ({ initialSelectedSymbol = 'RELIANCE', initialSelectedPattern = null, onBackToLanding }) => {
  // Available symbols
  const availableSymbols = ['RELIANCE', 'BAJAJ-AUTO', 'TCS', 'ICICIBANK', 'BHARTIARTL'];
  
  // Ensure the selected symbol is valid
  const validSelectedSymbol = availableSymbols.includes(initialSelectedSymbol) ? initialSelectedSymbol : 'RELIANCE';
  const [selectedSymbol, setSelectedSymbol] = useState(initialSelectedSymbol);
  const [selectedPattern, setSelectedPattern] = useState(initialSelectedPattern);
  
  // Update selected symbol when initialSelectedSymbol changes
  React.useEffect(() => {
    setSelectedSymbol(initialSelectedSymbol);
  }, [initialSelectedSymbol]);
  
  // Update selected pattern when initialSelectedPattern changes
  React.useEffect(() => {
    setSelectedPattern(initialSelectedPattern);
  }, [initialSelectedPattern]);
  
  const { ohlcvData, patterns, loading, error } = useOHLCVData(selectedSymbol);


  const handlePatternClick = (pattern) => {
    setSelectedPattern(pattern);
  };

  const handleChartClick = (event) => {
    // Optional: Handle chart clicks for additional interactivity
    console.log('Chart clicked:', event);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Dashboard Header */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Chart Analysis Dashboard</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Symbol: <span className="font-medium text-indigo-600">{selectedSymbol}</span>
                  {selectedPattern && (
                    <span className="ml-4">
                      Selected: <span className="font-medium text-indigo-600">{selectedPattern.pattern}</span>
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-indigo-600">{patterns.length}</div>
                  <div className="text-gray-500">Patterns</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {patterns.filter(p => ['Hammer', 'Morning Star', 'Three White Soldiers', 'Engulfing'].includes(p.pattern)).length}
                  </div>
                  <div className="text-gray-500">Bullish</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">
                    {patterns.filter(p => ['Shooting Star', 'Evening Star', 'Hanging Man'].includes(p.pattern)).length}
                  </div>
                  <div className="text-gray-500">Bearish</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Pattern Table - Left Column */}
          <div className="xl:col-span-1 order-2 xl:order-1">
            <PatternTable
              patterns={patterns}
              onPatternClick={handlePatternClick}
              selectedPattern={selectedPattern}
            />
          </div>
          
          {/* Chart - Right Column */}
          <div className="xl:col-span-3 order-1 xl:order-2">
            <CandlestickChart
              ohlcvData={ohlcvData}
              selectedPattern={selectedPattern}
              onChartClick={handleChartClick}
              patterns={patterns}
            />
          </div>
        </div>
        
        {/* Statistics Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          {patterns.map((pattern, index) => (
            <div key={index} className="bg-white rounded-md shadow p-4">
              <div className="flex flex-col items-center h-full">
                <p className="text-xs font-medium text-gray-500">Pattern</p>
                <p className="text-sm font-semibold text-gray-900">{pattern.pattern}</p>
                <p className="text-xs text-gray-600">Confidence: {pattern.confidence}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 