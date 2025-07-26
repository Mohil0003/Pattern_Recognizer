import { useState, useEffect } from 'react';

const useOHLCVData = (symbol = 'RELIANCE') => {
  const [ohlcvData, setOHLCVData] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Map frontend symbols to backend symbols
  const getBackendSymbol = (frontendSymbol) => {
    const symbolMapping = {
      'RELIANCE': 'RELIANCE',
      'BAJAJ-AUTO': 'BAJAJ-AUTO',
      'TCS': 'TCS',
      'ICICIBANK': 'ICICIBANK',
      'BHARTIARTL': 'BHARTIARTL'
    };
    return symbolMapping[frontendSymbol] || frontendSymbol;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const backendSymbol = getBackendSymbol(symbol);
        console.log(`Fetching data for symbol: ${symbol} (backend: ${backendSymbol})`);
        
        // Check if backend is available
        const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
        
        // Fetch OHLCV data from backend API
        const ohlcvResponse = await fetch(`${API_BASE_URL}/api/ohlcv/${backendSymbol}`);
        if (!ohlcvResponse.ok) {
          throw new Error(`Failed to fetch OHLCV data for ${symbol}: ${ohlcvResponse.status}`);
        }
        const ohlcvData = await ohlcvResponse.json();
        
        if (!Array.isArray(ohlcvData) || ohlcvData.length === 0) {
          throw new Error(`No OHLCV data available for symbol ${symbol}`);
        }
        
        // Validate OHLCV data structure
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
        
        console.log(`Loaded ${validOhlcvData.length} OHLCV candles for ${symbol}`);
        setOHLCVData(validOhlcvData);
        
        // Fetch patterns data from backend API
        const patternsResponse = await fetch(`${API_BASE_URL}/api/patterns/${backendSymbol}`);
        if (!patternsResponse.ok) {
          throw new Error(`Failed to fetch patterns data: ${patternsResponse.status}`);
        }
        const patternsData = await patternsResponse.json();
        
        // Validate patterns data
        const validPatterns = Array.isArray(patternsData) ? patternsData.filter(pattern => {
          return pattern && 
                 pattern.symbol &&
                 typeof pattern.candleIndex === 'number' &&
                 pattern.candleIndex >= 0 &&
                 pattern.candleIndex < validOhlcvData.length &&
                 pattern.pattern &&
                 typeof pattern.confidence === 'number';
        }) : [];
        
        console.log(`Found ${validPatterns.length} valid patterns for ${symbol}`);
        setPatterns(validPatterns);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data. Please try again.');
        setOHLCVData([]);
        setPatterns([]);
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

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