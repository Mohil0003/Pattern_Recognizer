import React, { useState, useMemo } from 'react';
import { getPatternColor, getConfidenceColor, formatTimestamp, getPatternDescription } from '../utils/highlightPattern';

const PatternTable = ({ patterns, onPatternClick, selectedPattern }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const itemsPerPage = 10;
  
  // Sort patterns
  const sortedPatterns = useMemo(() => {
    if (!patterns) return [];
    
    return [...patterns].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'timestamp') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (sortBy === 'confidence') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [patterns, sortBy, sortOrder]);
  
  // Paginate patterns
  const paginatedPatterns = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedPatterns.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedPatterns, currentPage]);
  
  const totalPages = Math.ceil(sortedPatterns.length / itemsPerPage);
  
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };
  
  const SortIcon = ({ column }) => {
    if (sortBy !== column) {
      return <span className="text-gray-400">↕️</span>;
    }
    return sortOrder === 'asc' ? <span className="text-indigo-600">↑</span> : <span className="text-indigo-600">↓</span>;
  };
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
    <div className="bg-white rounded-lg shadow overflow-hidden h-fit">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Patterns ({sortedPatterns.length})
            </h3>
            <p className="text-xs text-gray-500">
              Click to highlight on chart
            </p>
          </div>
          <div className="text-xs text-gray-500">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      </div>
      
      {/* Compact Table */}
      <div className="overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          {paginatedPatterns.map((pattern, index) => (
            <div
              key={pattern.id}
              onClick={() => onPatternClick(pattern)}
              className={`px-4 py-3 border-b border-gray-100 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                selectedPattern?.id === pattern.id
                  ? 'bg-indigo-50 border-l-4 border-indigo-500'
                  : ''
              }`}
            >
              {/* Pattern Info Row */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getPatternColor(pattern.pattern) }}
                  ></div>
                  <span className="font-medium text-sm text-gray-900 truncate">
                    {pattern.pattern}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getConfidenceColor(pattern.confidence) }}
                  ></div>
                  <span className="text-xs font-medium text-gray-700">
                    {(pattern.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              
              {/* Details Row */}
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{formatTimestamp(pattern.timestamp)}</span>
                <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                  {pattern.timeframe}
                </span>
              </div>
              
              {/* Description (if selected) */}
              {selectedPattern?.id === pattern.id && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-600">
                    {getPatternDescription(pattern.pattern)}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, sortedPatterns.length)} of {sortedPatterns.length}
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 text-xs bg-white border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Prev
              </button>
              <span className="px-2 py-1 text-xs bg-indigo-600 text-white rounded">
                {currentPage}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-2 py-1 text-xs bg-white border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Sort Options */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500">Sort by:</span>
          <div className="flex space-x-2">
            <button
              onClick={() => handleSort('timestamp')}
              className={`px-2 py-1 rounded text-xs ${
                sortBy === 'timestamp' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Time <SortIcon column="timestamp" />
            </button>
            <button
              onClick={() => handleSort('confidence')}
              className={`px-2 py-1 rounded text-xs ${
                sortBy === 'confidence' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Confidence <SortIcon column="confidence" />
            </button>
            <button
              onClick={() => handleSort('pattern')}
              className={`px-2 py-1 rounded text-xs ${
                sortBy === 'pattern' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Pattern <SortIcon column="pattern" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatternTable; 