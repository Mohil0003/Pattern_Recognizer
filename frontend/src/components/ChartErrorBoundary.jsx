import React from 'react';

class ChartErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error details
    console.error('Chart Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="chart-error-fallback bg-white rounded-lg shadow-sm border border-red-200 p-8">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-red-800 mb-2">
              Chart Error
            </h3>
            <p className="text-red-600 mb-4">
              Unable to display the candlestick chart. There might be an issue with the data format.
            </p>
            <div className="text-left bg-red-50 p-4 rounded-lg mb-4">
              <h4 className="font-semibold text-red-800 mb-2">Error Details:</h4>
              <pre className="text-xs text-red-700 overflow-auto">
                {this.state.error && this.state.error.toString()}
              </pre>
            </div>
            <button
              onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChartErrorBoundary;
