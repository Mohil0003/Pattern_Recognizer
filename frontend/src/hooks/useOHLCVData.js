import { useState, useEffect } from 'react';

const useOHLCVData = (symbol = 'RELIANCE') => {
  const [ohlcvData, setOHLCVData] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch patterns data
        const patternsResponse = await fetch('/data/patterns.json');
        const patternsData = await patternsResponse.json();
        
        // Filter patterns for the selected symbol
        const symbolPatterns = patternsData.filter(pattern => pattern.symbol === symbol);
        setPatterns(symbolPatterns);
        
        // Fetch OHLCV data for the symbol
        const ohlcvResponse = await fetch(`/data/ohlcv/${symbol}.json`);
        const ohlcvData = await ohlcvResponse.json();
        setOHLCVData(ohlcvData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
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