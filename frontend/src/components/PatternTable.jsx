import React from 'react';
import { getPatternColor, getConfidenceColor, formatTimestamp, getPatternDescription } from '../utils/highlightPattern';

const PatternTable = ({ patterns, onPatternClick, selectedPattern }) => {
  if (!patterns || patterns.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">📊</div>
          <p>No patterns detected for this symbol</p>
          <p className="text-sm">Try selecting a different symbol or timeframe</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Detected Patterns ({patterns.length})
        </h3>
        <p className="text-sm text-gray-500">
          Click on a pattern to highlight it on the chart
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pattern
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Confidence
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {patterns.map((pattern) => (
              <tr
                key={pattern.id}
                onClick={() => onPatternClick(pattern)}
                className={`pattern-row cursor-pointer transition-colors duration-200 ${
                  selectedPattern?.id === pattern.id
                    ? 'bg-primary-50 border-l-4 border-primary-500'
                    : 'hover:bg-gray-50'
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: getPatternColor(pattern.pattern) }}
                    ></div>
                    <span className="font-medium text-gray-900">
                      {pattern.pattern}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatTimestamp(pattern.timestamp)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div
                      className="w-2 h-2 rounded-full mr-2"
                      style={{ backgroundColor: getConfidenceColor(pattern.confidence) }}
                    ></div>
                    <span className="text-sm text-gray-900">
                      {(pattern.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                  <div className="truncate" title={getPatternDescription(pattern.pattern)}>
                    {getPatternDescription(pattern.pattern)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>
            Showing {patterns.length} pattern{patterns.length !== 1 ? 's' : ''}
          </span>
          <span>
            Timeframe: {patterns[0]?.timeframe || 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PatternTable; 