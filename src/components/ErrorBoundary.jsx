import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              ⚠️ エラーが発生しました
            </h1>
            
            <div className="mb-4">
              <h2 className="font-semibold text-gray-700 mb-2">エラー内容:</h2>
              <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                {this.state.error && this.state.error.toString()}
              </pre>
            </div>
            
            {this.state.errorInfo && (
              <div className="mb-4">
                <h2 className="font-semibold text-gray-700 mb-2">スタックトレース:</h2>
                <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs max-h-64">
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}
            
            <div className="flex space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                ページを再読み込み
              </button>
              
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                エラーを無視して続行
              </button>
            </div>
            
            <div className="mt-6 text-sm text-gray-600">
              <p>このエラーを報告する場合は、上記の内容をコピーしてください。</p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;