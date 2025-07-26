from flask import Flask, request, jsonify
from flask_cors import CORS
from services.pattern_service import PatternService
from utils.response_formatter import format_response
import os
import time

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
pattern_service = PatternService()

@app.route('/<company_name>', methods=['GET'])
def get_all_patterns(company_name):
    """Get all patterns for a company across all timeframes"""
    try:
        # Get optional query parameters for performance tuning
        max_files = int(request.args.get('max_files', 3))  # Default to 3 files
        max_rows = int(request.args.get('max_rows', 300))   # Default to 300 rows
        
        # Set processing limits
        pattern_service.set_limits(max_files=max_files, max_rows=max_rows)
        
        # Validate company exists
        if not pattern_service.company_exists(company_name.upper()):
            return jsonify({'error': f'Company {company_name} not found'}), 404
        
        start_time = time.time()
        patterns = pattern_service.detect_all_patterns(company_name.upper())
        processing_time = time.time() - start_time
        
        response = {
            'patterns': format_response(patterns),
            'processing_time_seconds': round(processing_time, 2),
            'total_patterns_found': len(patterns),
            'processing_limits': {
                'max_files_per_timeframe': max_files,
                'max_rows_per_file': max_rows
            }
        }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/<company_name>/<timeframe>', methods=['GET'])
def get_patterns_by_timeframe(company_name, timeframe):
    """Get patterns for a company for specific timeframe"""
    try:
        # Get optional query parameters for performance tuning
        max_files = int(request.args.get('max_files', 3))  # Default to 3 files
        max_rows = int(request.args.get('max_rows', 300))   # Default to 300 rows
        
        # Set processing limits
        pattern_service.set_limits(max_files=max_files, max_rows=max_rows)
        
        # Validate company exists
        if not pattern_service.company_exists(company_name.upper()):
            return jsonify({'error': f'Company {company_name} not found'}), 404
        
        # Validate timeframe
        valid_timeframes = ['1min', '5min', '10min', '15min', '30min', '60min']
        if timeframe not in valid_timeframes:
            return jsonify({'error': f'Invalid timeframe. Valid options: {valid_timeframes}'}), 400
        
        start_time = time.time()
        patterns = pattern_service.detect_patterns_by_timeframe(company_name.upper(), timeframe)
        processing_time = time.time() - start_time
        
        response = {
            'patterns': format_response(patterns),
            'processing_time_seconds': round(processing_time, 2),
            'total_patterns_found': len(patterns),
            'processing_limits': {
                'max_files': max_files,
                'max_rows_per_file': max_rows
            }
        }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Candlestick Pattern Detection API is running'})

@app.route('/companies', methods=['GET'])
def get_available_companies():
    """Get list of available companies"""
    try:
        companies = pattern_service.get_available_companies()
        return jsonify({'companies': companies})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/quick-test/<company_name>', methods=['GET'])
def quick_test(company_name):
    """Quick test with minimal data processing"""
    try:
        # Set very limited processing for quick results
        pattern_service.set_limits(max_files=1, max_rows=100)
        
        if not pattern_service.company_exists(company_name.upper()):
            return jsonify({'error': f'Company {company_name} not found'}), 404
        
        start_time = time.time()
        # Only test with 5min timeframe for speed
        patterns = pattern_service.detect_patterns_by_timeframe(company_name.upper(), '5min')
        processing_time = time.time() - start_time
        
        response = {
            'patterns': format_response(patterns),
            'processing_time_seconds': round(processing_time, 2),
            'total_patterns_found': len(patterns),
            'note': 'Quick test mode - limited to 1 file, 100 rows, 5min timeframe'
        }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting Candlestick Pattern Detection API...")
    print("Available endpoints:")
    print("  GET /companies - List all companies")
    print("  GET /health - Health check")
    print("  GET /quick-test/<company> - Quick test (1 file, 100 rows)")
    print("  GET /<company> - All patterns (add ?max_files=3&max_rows=300)")
    print("  GET /<company>/<timeframe> - Specific timeframe patterns")
    print("")
    app.run(debug=True, host='0.0.0.0', port=5000)
