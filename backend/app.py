from flask import Flask, request, jsonify
from services.pattern_service import PatternService
from utils.response_formatter import format_response
import os

app = Flask(__name__)
pattern_service = PatternService()

@app.route('/<company_name>', methods=['GET'])
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

@app.route('/<company_name>/<timeframe>', methods=['GET'])
def get_patterns_by_timeframe(company_name, timeframe):
    """Get patterns for a company for specific timeframe"""
    try:
        # Validate company exists
        if not pattern_service.company_exists(company_name.upper()):
            return jsonify({'error': f'Company {company_name} not found'}), 404
        
        # Validate timeframe
        valid_timeframes = ['1min', '5min', '10min', '15min', '30min', '1hr']
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

@app.route('/companies', methods=['GET'])
def get_available_companies():
    """Get list of available companies"""
    try:
        companies = pattern_service.get_available_companies()
        return jsonify({'companies': companies})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
