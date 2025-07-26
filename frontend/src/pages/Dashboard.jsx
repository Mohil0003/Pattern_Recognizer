import React, { useState } from 'react';
import Header from '../components/Header';
import PatternTable from '../components/PatternTable';
import CandlestickChart from '../components/CandlestickChart';
import useOHLCVData from '../hooks/useOHLCVData';

const Dashboard = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('RELIANCE');
  const [selectedPattern, setSelectedPattern] = useState(null);
  
  const { ohlcvData, patterns, loading, error } = useOHLCVData(selectedSymbol);

  const handleSymbolChange = (symbol) => {
    setSelectedSymbol(symbol);
    setSelectedPattern(null); // Clear selected pattern when symbol changes
  };

  const handlePatternClick = (pattern) => {
    setSelectedPattern(pattern);
  };

  const handleChartClick = (event) => {
    // Optional: Handle chart clicks for additional interactivity
    console.log('Chart clicked:', event);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header selectedSymbol={selectedSymbol} onSymbolChange={handleSymbolChange} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header selectedSymbol={selectedSymbol} onSymbolChange={handleSymbolChange} />
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
    <div className="min-h-screen bg-gray-50">
      <Header selectedSymbol={selectedSymbol} onSymbolChange={handleSymbolChange} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pattern Table - Left Column */}
          <div className="lg:col-span-1">
            <PatternTable
              patterns={patterns}
              onPatternClick={handlePatternClick}
              selectedPattern={selectedPattern}
            />
          </div>
          
          {/* Chart - Right Column */}
          <div className="lg:col-span-2">
            <CandlestickChart
              ohlcvData={ohlcvData}
              selectedPattern={selectedPattern}
              onChartClick={handleChartClick}
            />
          </div>
        </div>
        
        {/* Statistics Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <span className="text-primary-600 text-lg">📊</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Patterns</p>
                <p className="text-2xl font-semibold text-gray-900">{patterns.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-lg">📈</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Bullish Patterns</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {patterns.filter(p => ['Hammer', 'Morning Star', 'Three White Soldiers', 'Engulfing'].includes(p.pattern)).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-red-600 text-lg">📉</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Bearish Patterns</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {patterns.filter(p => ['Shooting Star', 'Evening Star', 'Hanging Man'].includes(p.pattern)).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 text-lg">⚖️</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Neutral Patterns</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {patterns.filter(p => ['Doji'].includes(p.pattern)).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 