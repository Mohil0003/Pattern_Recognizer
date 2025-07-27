import { useState, useEffect, useRef, useCallback } from 'react';

// Frontend cache for API responses
const apiCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

const useOHLCVData = (symbol = 'RELIANCE') => {
  const [ohlcvData, setOHLCVData] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);

  // Map frontend symbols to backend symbols
  const getBackendSymbol = useCallback((frontendSymbol) => {
    const symbolMapping = {
      'RELIANCE': 'RELIANCE',
      'BAJAJ-AUTO': 'BAJAJ-AUTO',
      'TCS': 'TCS',
      'ICICIBANK': 'ICICIBANK',
      'BHARTIARTL': 'BHARTIARTL'
    };
    return symbolMapping[frontendSymbol] || frontendSymbol;
  }, []);

  // Check if cached data is still valid
  const getCachedData = useCallback((key) => {
    const cached = apiCache.get(key);
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
      return cached.data;
    }
    return null;
  }, []);

  // Cache API response
  const setCachedData = useCallback((key, data) => {
    apiCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      // Abort previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      const { signal } = abortControllerRef.current;

      try {
        setLoading(true);
        setError(null);
        
        const backendSymbol = getBackendSymbol(symbol);
        console.log(`Fetching data for symbol: ${symbol} (backend: ${backendSymbol})`);
        
        const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
        
        // Check frontend cache first
        const ohlcvCacheKey = `ohlcv_${backendSymbol}`;
        const patternsCacheKey = `patterns_${backendSymbol}`;
        
        const cachedOhlcv = getCachedData(ohlcvCacheKey);
        const cachedPatterns = getCachedData(patternsCacheKey);
        
        if (cachedOhlcv && cachedPatterns) {
          console.log(`Using cached data for ${symbol}`);
          if (isMountedRef.current) {
            setOHLCVData(cachedOhlcv);
            setPatterns(cachedPatterns);
            setLoading(false);
          }
          return;
        }
        
        // Fetch both OHLCV and patterns data concurrently for better performance
        const [ohlcvResponse, patternsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/ohlcv/${backendSymbol}`, { 
            signal,
            headers: {
              'Accept': 'application/json',
              'Cache-Control': 'max-age=300' // 5 minutes browser cache
            }
          }),
          fetch(`${API_BASE_URL}/api/patterns/${backendSymbol}`, { 
            signal,
            headers: {
              'Accept': 'application/json',
              'Cache-Control': 'max-age=600' // 10 minutes browser cache
            }
          })
        ]);
        
        // Check if requests were successful
        if (!ohlcvResponse.ok) {
          throw new Error(`Failed to fetch OHLCV data for ${symbol}: ${ohlcvResponse.status}`);
        }
        if (!patternsResponse.ok) {
          throw new Error(`Failed to fetch patterns data for ${symbol}: ${patternsResponse.status}`);
        }
        
        // Parse responses concurrently
        const [ohlcvData, patternsData] = await Promise.all([
          ohlcvResponse.json(),
          patternsResponse.json()
        ]);
        
        // Early return if component unmounted during fetch
        if (!isMountedRef.current) return;
        
        // Validate and process OHLCV data
        if (!Array.isArray(ohlcvData) || ohlcvData.length === 0) {
          throw new Error(`No OHLCV data available for symbol ${symbol}`);
        }
        
        const validOhlcvData = ohlcvData.filter(candle => {
          return candle && 
                 typeof candle.open === 'number' &&
                 typeof candle.high === 'number' &&
                 typeof candle.low === 'number' &&
                 typeof candle.close === 'number' &&
                 typeof candle.volume === 'number' &&
                 candle.timestamp;
        });
        
        if (validOhlcvData.length === 0) {
          throw new Error(`Invalid OHLCV data format for symbol ${symbol}`);
        }
        
        // Process patterns data with better validation
        const validPatterns = Array.isArray(patternsData) ? patternsData.filter(pattern => {
          return pattern && 
                 pattern.company_name &&
                 pattern.pattern &&
                 pattern.timeframe &&
                 pattern.pattern_start_time;
        }).map((pattern, index) => ({
          ...pattern,
          id: `${pattern.company_name}_${pattern.timeframe}_${index}`,
          symbol: pattern.company_name,
          candleIndex: index,
          confidence: Math.random() * 0.3 + 0.7, // Mock confidence for now
          timestamp: pattern.pattern_start_time,
          description: `${pattern.pattern} pattern detected in ${pattern.company_name} on ${pattern.timeframe} timeframe`
        })) : [];
        
        console.log(`✅ Loaded ${validOhlcvData.length} OHLCV candles and ${validPatterns.length} patterns for ${symbol}`);
        
        // Cache the results
        setCachedData(ohlcvCacheKey, validOhlcvData);
        setCachedData(patternsCacheKey, validPatterns);
        
        // Update state if component is still mounted
        if (isMountedRef.current) {
          setOHLCVData(validOhlcvData);
          setPatterns(validPatterns);
          setLoading(false);
        }
        
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('Request was cancelled');
          return;
        }
        
        console.error('Error fetching data:', err);
        
        if (isMountedRef.current) {
          setError(err.message || 'Failed to load data. Please try again.');
          setOHLCVData([]);
          setPatterns([]);
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [symbol, getBackendSymbol, getCachedData, setCachedData]);

  const getPatternByIndex = (candleIndex) => {
    return patterns.find(pattern => pattern.candleIndex === candleIndex);
  };

  const getPatternsForSymbol = (symbol) => {
    return patterns.filter(pattern => pattern.symbol === symbol);
  };

  return {
    ohlcvData,
    patterns,
    loading,
    error,
    getPatternByIndex,
    getPatternsForSymbol
  };
};

export default useOHLCVData; 