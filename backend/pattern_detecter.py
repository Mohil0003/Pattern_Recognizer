import pandas as pd

def load_and_prepare_data(file_path):
    df = pd.read_csv(file_path)
    df['datetime'] = pd.to_datetime(df['date'] + ' ' + df['time'], format='%d-%m-%Y %H:%M:%S')
    df.set_index('datetime', inplace=True)
    ohlc = df[['open', 'high', 'low', 'close']]  # optionally include 'volume' if needed
    return ohlc

# Example pattern functions
def detect_dragonfly_doji(row):
    body = abs(row['close'] - row['open'])
    upper_shadow = row['high'] - max(row['open'], row['close'])
    lower_shadow = min(row['open'], row['close']) - row['low']
    return body <= 0.05 and upper_shadow <= 0.1 and lower_shadow >= (row['high'] - row['low']) * 0.7

def detect_hammer(row):
    body = abs(row['close'] - row['open'])
    lower_shadow = min(row['open'], row['close']) - row['low']
    upper_shadow = row['high'] - max(row['open'], row['close'])
    return lower_shadow >= 2 * body and upper_shadow <= body

def detect_rising_window(df):
    windows = []
    for i in range(1, len(df)):
        prev = df.iloc[i - 1]
        curr = df.iloc[i]
        if (prev['close'] > prev['open'] and
            curr['close'] > curr['open'] and
            curr['low'] > prev['high']):
            windows.append((df.index[i], "Rising Window"))
    return windows

def detect_evening_star(df):
    stars = []
    for i in range(2, len(df)):
        first = df.iloc[i - 2]
        second = df.iloc[i - 1]
        third = df.iloc[i]
        if (first['close'] > first['open'] and
            abs(second['close'] - second['open']) < (first['close'] - first['open']) * 0.5 and
            third['close'] < third['open'] and
            third['close'] < (first['open'] + first['close']) / 2):
            stars.append((df.index[i], "Evening Star"))
    return stars

def detect_three_white_soldiers(df):
    soldiers = []
    for i in range(2, len(df)):
        c1, c2, c3 = df.iloc[i - 2], df.iloc[i - 1], df.iloc[i]
        if (c1['close'] > c1['open'] and
            c2['close'] > c2['open'] and
            c3['close'] > c3['open'] and
            c2['open'] > c1['open'] and c2['close'] > c1['close'] and
            c3['open'] > c2['open'] and c3['close'] > c2['close']):
            soldiers.append((df.index[i], "Three White Soldiers"))
    return soldiers


def detect_patterns(df, interval, company_name):
    patterns = []
    resampled = df.resample(interval).agg({
        'open': 'first',
        'high': 'max',
        'low': 'min',
        'close': 'last'
    }).dropna()

    for idx, row in resampled.iterrows():
        if detect_dragonfly_doji(row):
            patterns.append((company_name, "Dragonfly Doji", interval, idx))
        elif detect_hammer(row):
            patterns.append((company_name, "Hammer", interval, idx))

    # Add multi-candle pattern detection
    t_ws = detect_three_white_soldiers(resampled)
    for dt, name in t_ws:
        patterns.append((company_name, name, interval, dt))

    return patterns
