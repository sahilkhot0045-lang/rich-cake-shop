import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6 bg-cream-50">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-cream-200 shadow-card text-center space-y-4">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>

            <h2 className="font-serif text-2xl font-bold text-chocolate-950">
              Something went wrong
            </h2>

            <p className="text-xs text-chocolate-600 leading-relaxed">
              We encountered an issue while rendering this page. Your order data and items are safe in our bakery database.
            </p>

            {this.state.error && (
              <div className="p-3 bg-cream-100 rounded-xl text-left font-mono text-[11px] text-chocolate-800 break-all max-h-24 overflow-y-auto">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="pt-2 flex gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="px-4 py-2.5 bg-chocolate-900 text-gold-400 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-chocolate-800 transition flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="px-4 py-2.5 border border-cream-300 bg-white text-chocolate-800 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-cream-50 transition flex items-center gap-2 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
