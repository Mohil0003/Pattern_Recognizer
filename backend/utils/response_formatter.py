# Formatter for API response

def format_response(patterns):
    """
    Format the detected patterns into a structured response
    :param patterns: List of tuples containing (timestamp, pattern_name, timeframe, company_name)
    :return: List of dictionaries for JSON response
    """
    formatted = []
    for pattern in patterns:
        if len(pattern) == 4:  # (timestamp, pattern_name, timeframe, company_name)
            formatted.append({
                "company_name": pattern[3],
                "pattern": pattern[1],
                "timeframe": pattern[2],
                "pattern_start_time": pattern[0].strftime('%Y-%m-%d %H:%M:%S')
            })
        else:  # Fallback for older format (timestamp, pattern_name)
            formatted.append({
                "pattern_start_time": pattern[0].strftime('%Y-%m-%d %H:%M:%S'),
                "pattern": pattern[1]
            })
    return formatted
