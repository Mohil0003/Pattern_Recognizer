import pandas as pd
import os
from detectors.pattern_detectors import CandlestickPatternDetector

class PatternService:
    def __init__(self):
        self.data_path = "data"
        self.timeframes = ['1min', '5min', '10min', '15min', '30min', '1hr']

    def company_exists(self, company_name):
        return os.path.exists(os.path.join(self.data_path, company_name))

    def detect_all_patterns(self, company_name):
        all_patterns = []
        for timeframe in self.timeframes:
            patterns = self.detect_patterns_by_timeframe(company_name, timeframe)
            # Add timeframe info to each pattern
            for pattern in patterns:
                all_patterns.append((pattern[0], pattern[1], timeframe, company_name))
        return all_patterns

    def detect_patterns_by_timeframe(self, company_name, timeframe):
        company_path = os.path.join(self.data_path, company_name)
        all_patterns = []
        
        if not os.path.exists(company_path):
            return all_patterns
            
        for file in os.listdir(company_path):
            if file.endswith('.csv'):
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
        df = pd.read_csv(file_path)
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

    def get_available_companies(self):
        companies = []
        if os.path.exists(self.data_path):
            companies = [name for name in os.listdir(self.data_path) if os.path.isdir(os.path.join(self.data_path, name))]
        return companies
