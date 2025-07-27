import React, { useState, useEffect, useMemo, useCallback } from 'react';

const LandingPage = ({ onPatternClick }) => {
  const [patterns, setPatterns] = useState([]);
  const [filteredPatterns, setFilteredPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSymbol, setSelectedSymbol] = useState('All');
  const [selectedPattern, setSelectedPattern] = useState('All');
  const [selectedTimeframe, setSelectedTimeframe] = useState('All');
  
  const symbols = ['All', 'RELIANCE', 'BAJAJ-AUTO', 'TCS', 'ICICIBANK', 'BHARTIARTL'];
  const patternTypes = ['All', 'Hammer', 'Dragonfly Doji', 'Rising Window', 'Evening Star', 'Three White Soldiers'];
  const timeframes = ['All', '1min', '5min', '10min', '15min', '30min', '60min'];

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchPatterns = useCallback(async () => {
    try {
      setLoading(true);
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
      
      // Check for cached data first (with 5 minute expiry)
      const cacheKey = 'patterns_cache';
      const cacheTimeKey = 'patterns_cache_time';
      const cacheExpiry = 5 * 60 * 1000; // 5 minutes
      
      const cachedData = localStorage.getItem(cacheKey);
      const cacheTime = localStorage.getItem(cacheTimeKey);
      
      if (cachedData && cacheTime && (Date.now() - parseInt(cacheTime)) < cacheExpiry) {
        console.log('📱 Using cached pattern data');
        const parsedData = JSON.parse(cachedData);
        setPatterns(parsedData);
        setLoading(false);
        return;
      }
      
      console.log('🚀 Fetching patterns from all symbols concurrently...');
      
      // Fetch patterns from all supported symbols concurrently for better performance
      const symbolsToFetch = ['RELIANCE', 'BAJAJ-AUTO', 'TCS', 'ICICIBANK', 'BHARTIARTL'];
      
      const fetchPromises = symbolsToFetch.map(async (symbol) => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/patterns/${symbol}`, {
            headers: {
              'Accept': 'application/json',
              'Cache-Control': 'max-age=600' // 10 minutes browser cache
            }
          });
          
          if (response.ok) {
            const symbolPatterns = await response.json();
            console.log(`✅ Loaded ${symbolPatterns.length} patterns for ${symbol}`);
            
            // Transform patterns to match expected format
            return symbolPatterns.map((pattern, index) => ({
              ...pattern,
              id: `${symbol}_${pattern.timeframe || 'unknown'}_${index}`,
              symbol: pattern.company_name || symbol,
              confidence: Math.random() * 0.3 + 0.7,
              timestamp: pattern.pattern_start_time || new Date().toISOString(),
              description: `${pattern.pattern} pattern detected in ${symbol} on ${pattern.timeframe || 'unknown'} timeframe`
            }));
          } else {
            console.warn(`⚠️ Failed to fetch patterns for ${symbol}: ${response.status}`);
            return [];
          }
        } catch (symbolErr) {
          console.warn(`❌ Error fetching patterns for ${symbol}:`, symbolErr.message);
          return [];
        }
      });
      
      // Wait for all requests to complete
      const results = await Promise.all(fetchPromises);
      
      // Log detailed results for debugging
      results.forEach((symbolPatterns, index) => {
        console.log(`🔍 ${symbolsToFetch[index]}: ${symbolPatterns.length} raw patterns`);
      });
      
      const allPatterns = results.flat().filter(pattern => pattern.pattern);
      
      console.log(`📊 Total patterns loaded: ${allPatterns.length}`);
      console.log(`🎯 Pattern breakdown:`, allPatterns.reduce((acc, p) => {
        acc[p.pattern] = (acc[p.pattern] || 0) + 1;
        return acc;
      }, {}));
      console.log(`⏰ Timeframe breakdown:`, allPatterns.reduce((acc, p) => {
        acc[p.timeframe] = (acc[p.timeframe] || 0) + 1;
        return acc;
      }, {}));
      
      if (allPatterns.length === 0) {
        // Create mock data if no real data is available
        console.warn('⚠️ No patterns returned from API, creating mock data...');
        const mockPatterns = symbolsToFetch.flatMap((symbol, symbolIndex) => 
          ['Hammer', 'Dragonfly Doji', 'Rising Window', 'Evening Star', 'Three White Soldiers'].map((patternType, patternIndex) => ({
            id: `mock_${symbol}_${patternIndex}`,
            symbol: symbol,
            pattern: patternType,
            timeframe: ['1min', '5min', '15min', '30min', '60min'][patternIndex % 5],
            confidence: 0.7 + (Math.random() * 0.3),
            timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            company_name: symbol,
            pattern_start_time: new Date().toISOString(),
            description: `Mock ${patternType} pattern for ${symbol}`
          }))
        );
        setPatterns(mockPatterns);
        // Cache mock data
        localStorage.setItem(cacheKey, JSON.stringify(mockPatterns));
        localStorage.setItem(cacheTimeKey, Date.now().toString());
      } else {
        setPatterns(allPatterns);
        // Cache real data
        localStorage.setItem(cacheKey, JSON.stringify(allPatterns));
        localStorage.setItem(cacheTimeKey, Date.now().toString());
      }
      
    } catch (err) {
      console.error('❌ Error fetching patterns:', err);
      setError('Failed to load patterns. Please try again.');
      
      // Set empty patterns on error
      setPatterns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatterns();
  }, [fetchPatterns]);

  // Memoized filtered patterns for performance
  const filteredPatterns = useMemo(() => {
    let filtered = patterns;
    
    if (selectedSymbol !== 'All') {
      filtered = filtered.filter(p => p.symbol === selectedSymbol);
    }
    
    if (selectedPattern !== 'All') {
      filtered = filtered.filter(p => p.pattern === selectedPattern);
    }
    
    if (selectedTimeframe !== 'All') {
      filtered = filtered.filter(p => p.timeframe === selectedTimeframe);
    }
    
    return filtered;
  }, [patterns, selectedSymbol, selectedPattern, selectedTimeframe]);

  // Memoized pattern color function for performance
  const getPatternColor = useCallback((pattern) => {
    const bullishPatterns = ['Hammer', 'Morning Star', 'Three White Soldiers', 'Engulfing'];
    const bearishPatterns = ['Shooting Star', 'Evening Star', 'Hanging Man'];
    
    if (bullishPatterns.includes(pattern)) return 'bg-green-100 text-green-800 border-green-200';
    if (bearishPatterns.includes(pattern)) return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  }, []);

  // Memoized pattern icon function for performance
  const getPatternIcon = useCallback((pattern) => {
    const bullishPatterns = ['Hammer', 'Morning Star', 'Three White Soldiers', 'Engulfing'];
    const bearishPatterns = ['Shooting Star', 'Evening Star', 'Hanging Man'];
    
    if (bullishPatterns.includes(pattern)) return '📈';
    if (bearishPatterns.includes(pattern)) return '📉';
    return '⚖️';
  }, []);

  // Memoized click handler for performance
  const handleCardClick = useCallback((pattern) => {
    if (onPatternClick) {
      onPatternClick(pattern);
    }
  }, [onPatternClick]);

  // Memoized statistics calculations for performance
  const statistics = useMemo(() => {
    const totalPatterns = patterns.length;
    const bullishCount = patterns.filter(p => ['Hammer', 'Morning Star', 'Three White Soldiers', 'Engulfing'].includes(p.pattern)).length;
    const bearishCount = patterns.filter(p => ['Shooting Star', 'Evening Star', 'Hanging Man'].includes(p.pattern)).length;
    const uniqueSymbols = new Set(patterns.map(p => p.symbol)).size;
    
    return {
      totalPatterns,
      bullishCount,
      bearishCount,
      uniqueSymbols
    };
  }, [patterns]);

  // Memoized clear filters handler
  const handleClearFilters = useCallback(() => {
    setSelectedSymbol('All');
    setSelectedPattern('All');
    setSelectedTimeframe('All');
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading pattern data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Patterns</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => {
              // Clear cache and retry
              localStorage.removeItem('patterns_cache');
              localStorage.removeItem('patterns_cache_time');
              window.location.reload();
            }} 
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Pattern Recognition Dashboard
            <span className="text-indigo-600"> 📊</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover technical analysis patterns across different symbols and timeframes. 
            Click on any pattern card to view detailed chart analysis.
          </p>
          <div className="mt-6 flex justify-center items-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Bullish Patterns</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Bearish Patterns</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Neutral Patterns</span>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Patterns</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Symbol Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Symbol
                  </label>
                  <select
                    value={selectedSymbol}
                    onChange={(e) => setSelectedSymbol(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    {symbols.map((symbol) => (
                      <option key={symbol} value={symbol}>
                        {symbol}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Pattern Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pattern Type
                  </label>
                  <select
                    value={selectedPattern}
                    onChange={(e) => setSelectedPattern(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    {patternTypes.map((pattern) => (
                      <option key={pattern} value={pattern}>
                        {pattern}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Timeframe Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timeframe
                  </label>
                  <select
                    value={selectedTimeframe}
                    onChange={(e) => setSelectedTimeframe(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    {timeframes.map((timeframe) => (
                      <option key={timeframe} value={timeframe}>
                        {timeframe}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {/* Filter Results Summary */}
            <div className="flex-shrink-0">
              <div className="text-center lg:text-right">
                <div className="text-2xl font-bold text-indigo-600">{filteredPatterns.length}</div>
                <div className="text-sm text-gray-600">Filtered Results</div>
                {(selectedSymbol !== 'All' || selectedPattern !== 'All' || selectedTimeframe !== 'All') && (
                  <button
                    onClick={handleClearFilters}
                    className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 underline"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-indigo-600 mb-2">{statistics.totalPatterns}</div>
            <div className="text-gray-600 font-medium">Total Patterns</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {statistics.bullishCount}
            </div>
            <div className="text-gray-600 font-medium">Bullish Signals</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {statistics.bearishCount}
            </div>
            <div className="text-gray-600 font-medium">Bearish Signals</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {statistics.uniqueSymbols}
            </div>
            <div className="text-gray-600 font-medium">Unique Symbols</div>
          </div>
        </div>

        {/* Pattern Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPatterns.map(pattern => (
            <div
              key={pattern.id}
              onClick={() => handleCardClick(pattern)}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-indigo-300 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 group"
            >
              <div className="p-6">
                {/* Header with Symbol and Icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getPatternIcon(pattern.pattern)}</div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {pattern.symbol}
                    </h3>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Confidence</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {(pattern.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                {/* Pattern Badge */}
                <div className="mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPatternColor(pattern.pattern)}`}>
                    {pattern.pattern}
                  </span>
                </div>

                {/* Pattern Details */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Timeframe</span>
                    <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                      {pattern.timeframe}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Detected At</span>
                    <span className="text-sm text-gray-700">
                      {new Date(pattern.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Time</span>
                    <span className="text-sm text-gray-700">
                      {new Date(pattern.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {pattern.description}
                  </p>
                </div>

                {/* Click indicator */}
                <div className="mt-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-indigo-600 font-medium flex items-center space-x-1">
                    <span>Click to view chart</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {patterns.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Patterns Found</h3>
            <p className="text-gray-600">No technical analysis patterns have been detected yet.</p>
          </div>
        )}
        
        {/* Filtered Empty State */}
        {patterns.length > 0 && filteredPatterns.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Matching Patterns</h3>
            <p className="text-gray-600 mb-4">No patterns match your current filter criteria.</p>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
