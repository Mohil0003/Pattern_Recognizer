from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_caching import Cache
from services.pattern_service import PatternService
from utils.response_formatter import format_response
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure caching
app.config['CACHE_TYPE'] = 'SimpleCache'  # In-memory cache
app.config['CACHE_DEFAULT_TIMEOUT'] = 300  # 5 minutes cache timeout
cache = Cache(app)

pattern_service = PatternService()

@app.route('/api/patterns/<company_name>', methods=['GET'])
@cache.cached(timeout=600, key_prefix='patterns_all')  # Cache for 10 minutes
def get_all_patterns(company_name):
    """Get all patterns for a company across all timeframes"""
    try:
        # Validate company exists
        if not pattern_service.company_exists(company_name.upper()):
            return jsonify({'error': f'Company {company_name} not found'}), 404
        
        patterns = pattern_service.detect_all_patterns(company_name.upper())
        return jsonify(format_response(patterns))
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/patterns/<company_name>/<timeframe>', methods=['GET'])
@cache.cached(timeout=600, key_prefix='patterns_timeframe')  # Cache for 10 minutes
def get_patterns_by_timeframe(company_name, timeframe):
    """Get patterns for a company for specific timeframe"""
    try:
        # Validate company exists
        if not pattern_service.company_exists(company_name.upper()):
            return jsonify({'error': f'Company {company_name} not found'}), 404
        
        # Validate timeframe
        valid_timeframes = ['1min', '5min', '10min', '15min', '30min', '60min']
        if timeframe not in valid_timeframes:
            return jsonify({'error': f'Invalid timeframe. Valid options: {valid_timeframes}'}), 400
        
        patterns = pattern_service.detect_patterns_by_timeframe(company_name.upper(), timeframe)
        return jsonify(format_response(patterns))
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Candlestick Pattern Detection API is running'})

@app.route('/api/ohlcv/<company_name>', methods=['GET'])
@cache.cached(timeout=300, key_prefix='ohlcv_data')  # Cache for 5 minutes
def get_ohlcv_data(company_name):
    """Get OHLCV data for a company"""
    try:
        # Validate company exists
        if not pattern_service.company_exists(company_name.upper()):
            return jsonify({'error': f'Company {company_name} not found'}), 404
        
        ohlcv_data = pattern_service.get_ohlcv_data(company_name.upper())
        return jsonify(ohlcv_data)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/companies', methods=['GET'])
@cache.cached(timeout=1800, key_prefix='companies_list')  # Cache for 30 minutes
def get_available_companies():
    """Get list of available companies"""
    try:
        companies = pattern_service.get_available_companies()
        return jsonify({'companies': companies})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Cache management endpoints
@app.route('/admin/cache/clear', methods=['POST'])
def clear_cache():
    """Clear all caches"""
    try:
        cache.clear()  # Clear Flask cache
        pattern_service.clear_cache()  # Clear internal cache
        return jsonify({'message': 'All caches cleared successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/admin/cache/stats', methods=['GET'])
def get_cache_stats():
    """Get cache statistics"""
    try:
        internal_stats = pattern_service.get_cache_stats()
        return jsonify({
            'internal_cache': internal_stats,
            'flask_cache': 'SimpleCache (stats not available)'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/admin/cache/cleanup', methods=['POST'])
def cleanup_cache():
    """Clean up expired cache entries"""
    try:
        pattern_service.cleanup_expired_cache()
        return jsonify({'message': 'Expired cache entries cleaned up'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
