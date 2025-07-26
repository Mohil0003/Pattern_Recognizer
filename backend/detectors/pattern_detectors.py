import numpy as np
import pandas as pd
from typing import List, Tuple

class CandlestickPatternDetector:
    """Class containing all candlestick pattern detection methods"""
    
    @staticmethod
    def detect_dragonfly_doji(df: pd.DataFrame) -> List[Tuple]:
        """
        Detect Dragonfly Doji pattern
        Characteristics:
        - Very small body (open ≈ close)
        - Long lower shadow
        - No or very small upper shadow
        """
        patterns = []
        
        for i in range(len(df)):
            row = df.iloc[i]
            open_price = row['open']
            high_price = row['high']
            low_price = row['low']
            close_price = row['close']
            
            # Calculate body and shadows
            body = abs(close_price - open_price)
            total_range = high_price - low_price
            upper_shadow = high_price - max(open_price, close_price)
            lower_shadow = min(open_price, close_price) - low_price
            
            # Dragonfly Doji conditions
            if total_range > 0:  # Avoid division by zero
                body_ratio = body / total_range
                upper_shadow_ratio = upper_shadow / total_range
                lower_shadow_ratio = lower_shadow / total_range
                
                # Very small body, minimal upper shadow, significant lower shadow
                if (body_ratio <= 0.05 and 
                    upper_shadow_ratio <= 0.1 and 
                    lower_shadow_ratio >= 0.6):
                    patterns.append((df.index[i], "Dragonfly Doji"))
        
        return patterns
    
    @staticmethod
    def detect_hammer(df: pd.DataFrame) -> List[Tuple]:
        """
        Detect Hammer pattern
        Characteristics:
        - Small body
        - Long lower shadow (at least 2x body size)
        - Small or no upper shadow
        """
        patterns = []
        
        for i in range(len(df)):
            row = df.iloc[i]
            open_price = row['open']
            high_price = row['high']
            low_price = row['low']
            close_price = row['close']
            
            # Calculate body and shadows
            body = abs(close_price - open_price)
            upper_shadow = high_price - max(open_price, close_price)
            lower_shadow = min(open_price, close_price) - low_price
            
            # Hammer conditions
            if (body > 0 and 
                lower_shadow >= 2 * body and 
                upper_shadow <= body * 0.5):
                patterns.append((df.index[i], "Hammer"))
        
        return patterns
    
    @staticmethod
    def detect_rising_window(df: pd.DataFrame) -> List[Tuple]:
        """
        Detect Rising Window (Gap Up) pattern
        Characteristics:
        - Current candle's low is higher than previous candle's high
        - Both candles are bullish (green)
        """
        patterns = []
        
        for i in range(1, len(df)):
            prev_row = df.iloc[i - 1]
            curr_row = df.iloc[i]
            
            # Check if both candles are bullish
            prev_bullish = prev_row['close'] > prev_row['open']
            curr_bullish = curr_row['close'] > curr_row['open']
            
            # Check for gap up
            gap_up = curr_row['low'] > prev_row['high']
            
            if prev_bullish and curr_bullish and gap_up:
                patterns.append((df.index[i], "Rising Window"))
        
        return patterns
    
    @staticmethod
    def detect_evening_star(df: pd.DataFrame) -> List[Tuple]:
        """
        Detect Evening Star pattern
        Characteristics:
        - Three candles pattern
        - First: Long bullish candle
        - Second: Small body (star) - can be bullish or bearish
        - Third: Long bearish candle that closes below midpoint of first candle
        """
        patterns = []
        
        for i in range(2, len(df)):
            first = df.iloc[i - 2]
            second = df.iloc[i - 1]
            third = df.iloc[i]
            
            # First candle: Long bullish
            first_bullish = first['close'] > first['open']
            first_body = abs(first['close'] - first['open'])
            
            # Second candle: Small body (star)
            second_body = abs(second['close'] - second['open'])
            
            # Third candle: Long bearish
            third_bearish = third['close'] < third['open']
            third_body = abs(third['close'] - third['open'])
            
            # Pattern conditions
            if (first_bullish and
                second_body < first_body * 0.3 and  # Star is small
                third_bearish and
                third['close'] < (first['open'] + first['close']) / 2 and  # Third closes below first's midpoint
                second['low'] > first['high']):  # Gap between first and second
                patterns.append((df.index[i], "Evening Star"))
        
        return patterns
    
    @staticmethod
    def detect_three_white_soldiers(df: pd.DataFrame) -> List[Tuple]:
        """
        Detect Three White Soldiers pattern
        Characteristics:
        - Three consecutive bullish candles
        - Each candle opens within the previous candle's body
        - Each candle closes higher than the previous
        - Each candle has a relatively large body
        """
        patterns = []
        
        for i in range(2, len(df)):
            first = df.iloc[i - 2]
            second = df.iloc[i - 1]
            third = df.iloc[i]
            
            # All three must be bullish
            first_bullish = first['close'] > first['open']
            second_bullish = second['close'] > second['open']
            third_bullish = third['close'] > third['open']
            
            if first_bullish and second_bullish and third_bullish:
                # Each candle should open within previous candle's body
                second_opens_in_first = (second['open'] > first['open'] and 
                                       second['open'] < first['close'])
                third_opens_in_second = (third['open'] > second['open'] and 
                                       third['open'] < second['close'])
                
                # Each candle closes higher than previous
                ascending_closes = (second['close'] > first['close'] and 
                                  third['close'] > second['close'])
                
                # Calculate body sizes to ensure they're significant
                first_body = first['close'] - first['open']
                second_body = second['close'] - second['open']
                third_body = third['close'] - third['open']
                
                # All bodies should be reasonably sized
                min_body_size = (first['high'] - first['low']) * 0.3
                decent_bodies = (first_body >= min_body_size and 
                               second_body >= min_body_size and 
                               third_body >= min_body_size)
                
                if (second_opens_in_first and third_opens_in_second and 
                    ascending_closes and decent_bodies):
                    patterns.append((df.index[i], "Three White Soldiers"))
        
        return patterns
    
    @classmethod
    def detect_all_patterns(cls, df: pd.DataFrame) -> List[Tuple]:
        """
        Detect all supported patterns in the given DataFrame
        Returns list of tuples: (timestamp, pattern_name)
        """
        all_patterns = []
        
        # Single candle patterns
        all_patterns.extend(cls.detect_dragonfly_doji(df))
        all_patterns.extend(cls.detect_hammer(df))
        
        # Multi-candle patterns
        all_patterns.extend(cls.detect_rising_window(df))
        all_patterns.extend(cls.detect_evening_star(df))
        all_patterns.extend(cls.detect_three_white_soldiers(df))
        
        # Sort by timestamp
        all_patterns.sort(key=lambda x: x[0])
        
        return all_patterns
