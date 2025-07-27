import pandas as pd
import os
from detectors.pattern_detectors import CandlestickPatternDetector
from datetime import datetime, timedelta
import hashlib
import pickle
from functools import lru_cache

class PatternService:
    def __init__(self):
        self.data_path = "data"
        self.timeframes = ['1min', '5min', '10min', '15min', '30min', '60min']
        self.max_files_to_process = 3  # Reduced from 5 for better performance
        self.max_rows_per_file = 200   # Reduced from 500 for better performance
        self._cache = {}  # Internal memory cache
        self._file_cache = {}  # Cache for loaded files
        
    def set_limits(self, max_files=5, max_rows=500):
        """Allow dynamic adjustment of processing limits"""
        self.max_files_to_process = max_files
        self.max_rows_per_file = max_rows

    def _get_cache_key(self, *args):
        """Generate a cache key from arguments"""
        key_string = "_".join(str(arg) for arg in args)
        return hashlib.md5(key_string.encode()).hexdigest()
    
    def _get_from_cache(self, key):
        """Get data from internal cache"""
        return self._cache.get(key)
    
    def _set_cache(self, key, data, ttl=300):
        """Set data in internal cache with TTL"""
        self._cache[key] = {
            'data': data,
            'timestamp': datetime.now(),
            'ttl': ttl
        }
    
    def _is_cache_valid(self, key):
        """Check if cached data is still valid"""
        if key not in self._cache:
            return False
        
        cache_entry = self._cache[key]
        age = (datetime.now() - cache_entry['timestamp']).total_seconds()
        return age < cache_entry['ttl']
    
    def company_exists(self, company_name):
        return os.path.exists(os.path.join(self.data_path, company_name))

    def detect_all_patterns(self, company_name):
        # Check cache first
        cache_key = self._get_cache_key("all_patterns", company_name)
        if self._is_cache_valid(cache_key):
            cached_data = self._get_from_cache(cache_key)
            if cached_data:
                print(f"Cache hit for all patterns: {company_name}")
                return cached_data['data']
        
        print(f"Cache miss for all patterns: {company_name} - Processing...")
        all_patterns = []
        for timeframe in self.timeframes:
            patterns = self.detect_patterns_by_timeframe(company_name, timeframe)
            # Add timeframe info to each pattern
            for pattern in patterns:
                all_patterns.append((pattern[0], pattern[1], timeframe, company_name))
        
        # Cache the result
        self._set_cache(cache_key, all_patterns, ttl=600)  # Cache for 10 minutes
        return all_patterns

    def detect_patterns_by_timeframe(self, company_name, timeframe):
        company_path = os.path.join(self.data_path, company_name)
        all_patterns = []
        
        if not os.path.exists(company_path):
            return all_patterns
        
        # Get all CSV files and sort them by date (newest first)
        csv_files = [f for f in os.listdir(company_path) if f.endswith('.csv')]
        csv_files.sort(reverse=True)  # Sort by filename (assuming date format DD-MM-YYYY.csv)
        
        # Only process the most recent files
        files_to_process = csv_files[:self.max_files_to_process]
        print(f"Processing {len(files_to_process)} files for {company_name} ({timeframe})")
        
        for file in files_to_process:
            file_path = os.path.join(company_path, file)
            try:
                df = self.load_and_prepare_data(file_path)
                patterns = self.detect_patterns(df, timeframe, company_name)
                # Add timeframe and company info to each pattern
                for pattern in patterns:
                    all_patterns.append((pattern[0], pattern[1], timeframe, company_name))
            except Exception as e:
                print(f"Error processing file {file}: {str(e)}")
                continue
        return all_patterns

    def load_and_prepare_data(self, file_path):
        # Only read a limited number of rows to improve performance
        df = pd.read_csv(file_path, nrows=self.max_rows_per_file)
        df['datetime'] = pd.to_datetime(df['date'] + ' ' + df['time'], format='%d-%m-%Y %H:%M:%S')
        df.set_index('datetime', inplace=True)
        return df[['open', 'high', 'low', 'close']]

    def detect_patterns(self, df, timeframe, company_name):
        # Resample data according to timeframe
        resampled = df.resample(timeframe).agg({
            'open': 'first',
            'high': 'max',
            'low': 'min',
            'close': 'last'
        }).dropna()

        # Use the pattern detector to find all patterns
        patterns = CandlestickPatternDetector.detect_all_patterns(resampled)
        
        return patterns

    def get_ohlcv_data(self, company_name):
        """Get OHLCV data for a company"""
        # Check cache first
        cache_key = self._get_cache_key("ohlcv_data", company_name)
        if self._is_cache_valid(cache_key):
            cached_data = self._get_from_cache(cache_key)
            if cached_data:
                print(f"Cache hit for OHLCV data: {company_name}")
                return cached_data['data']
        
        print(f"Cache miss for OHLCV data: {company_name} - Processing...")
        company_path = os.path.join(self.data_path, company_name)
        ohlcv_data = []
        
        if not os.path.exists(company_path):
            return ohlcv_data
        
        # Get most recent CSV files
        csv_files = [f for f in os.listdir(company_path) if f.endswith('.csv')]
        csv_files.sort(reverse=True)
        
        # Process only a few recent files for performance
        files_to_process = csv_files[:2]  # Reduced to 2 files for better performance
        
        for file in files_to_process:
            file_path = os.path.join(company_path, file)
            try:
                df = pd.read_csv(file_path, nrows=50)  # Reduced to 50 rows for better performance
                df['timestamp'] = pd.to_datetime(df['date'] + ' ' + df['time'], format='%d-%m-%Y %H:%M:%S')
                
                for _, row in df.iterrows():
                    ohlcv_data.append({
                        'timestamp': row['timestamp'].isoformat(),
                        'open': float(row['open']),
                        'high': float(row['high']),
                        'low': float(row['low']),
                        'close': float(row['close']),
                        'volume': float(row.get('volume', 0))  # Default to 0 if volume not available
                    })
            except Exception as e:
                print(f"Error processing OHLCV file {file}: {str(e)}")
                continue
        
        # Cache the result
        self._set_cache(cache_key, ohlcv_data, ttl=300)  # Cache for 5 minutes
        return ohlcv_data

    def clear_cache(self):
        """Clear all cached data"""
        self._cache.clear()
        self._file_cache.clear()
        print("Cache cleared")
    
    def cleanup_expired_cache(self):
        """Remove expired cache entries"""
        expired_keys = []
        for key in self._cache.keys():
            if not self._is_cache_valid(key):
                expired_keys.append(key)
        
        for key in expired_keys:
            del self._cache[key]
        
        if expired_keys:
            print(f"Cleaned up {len(expired_keys)} expired cache entries")
    
    def get_cache_stats(self):
        """Get cache statistics"""
        total_entries = len(self._cache)
        valid_entries = sum(1 for key in self._cache.keys() if self._is_cache_valid(key))
        return {
            'total_entries': total_entries,
            'valid_entries': valid_entries,
            'expired_entries': total_entries - valid_entries
        }

    def get_available_companies(self):
        # Check cache first
        cache_key = self._get_cache_key("companies_list")
        if self._is_cache_valid(cache_key):
            cached_data = self._get_from_cache(cache_key)
            if cached_data:
                print("Cache hit for companies list")
                return cached_data['data']
        
        print("Cache miss for companies list - Processing...")
        companies = []
        if os.path.exists(self.data_path):
            companies = [name for name in os.listdir(self.data_path) if os.path.isdir(os.path.join(self.data_path, name))]
        
        # Cache the result
        self._set_cache(cache_key, companies, ttl=1800)  # Cache for 30 minutes
        return companies
