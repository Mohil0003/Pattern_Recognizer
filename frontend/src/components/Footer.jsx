import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">📊</span>
              <h3 className="text-xl font-bold">Pattern Recognizer</h3>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Advanced technical analysis platform for detecting candlestick patterns 
              across multiple timeframes and symbols. Make informed trading decisions 
              with AI-powered pattern recognition.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-300">Live Data</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-300">Real-time Analysis</span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span className="text-sm">Pattern Detection</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span className="text-sm">Multiple Timeframes</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span className="text-sm">Interactive Charts</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span className="text-sm">Confidence Scores</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span className="text-sm">Real-time Updates</span>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Supported Patterns</h4>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center space-x-2">
                <span className="text-green-400">📈</span>
                <span className="text-sm">Hammer</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-400">📈</span>
                <span className="text-sm">Morning Star</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-red-400">📉</span>
                <span className="text-sm">Shooting Star</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-red-400">📉</span>
                <span className="text-sm">Evening Star</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-yellow-400">⚖️</span>
                <span className="text-sm">Doji</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
              <p className="text-gray-400 text-sm">
                © 2024 Pattern Recognizer. All rights reserved.
              </p>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <span className="text-blue-400">🔒</span>
                <span>Secure</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400">⚡</span>
                <span>Fast</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-purple-400">🎯</span>
                <span>Accurate</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
