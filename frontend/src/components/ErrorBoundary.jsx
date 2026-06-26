import { Component } from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled rendering error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
          <div className="relative w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl overflow-hidden text-center">
            {/* Background Glow */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-rose-500/10 rounded-full blur-[60px] pointer-events-none"></div>

            {/* Warning Icon */}
            <div className="mx-auto p-4 bg-rose-500/10 border border-rose-500/30 text-rose-450 rounded-2xl w-fit mb-6 animate-pulse">
              <FiAlertTriangle className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-slate-450 text-xs sm:text-sm leading-relaxed mb-6">
              An unexpected rendering crash occurred. SkillForge AI is wrapped in safety boundaries to prevent blank pages.
            </p>

            {/* Error Detail (collapsible/subtle) */}
            <div className="bg-slate-950/60 border border-slate-850 p-3.5 rounded-xl text-left font-mono text-[10px] text-slate-500 mb-6 max-h-32 overflow-y-auto scrollbar-thin">
              {this.state.error?.toString() || 'Unknown React rendering issue'}
            </div>

            <button
              onClick={this.handleReload}
              className="w-full bg-slate-800 hover:bg-slate-750 text-white font-bold py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 text-sm border border-slate-700/50"
            >
              <FiRefreshCw className="animate-spin-slow" /> Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
