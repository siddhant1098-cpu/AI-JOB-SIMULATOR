import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('AI Job Simulator React ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-screen flex items-center justify-center p-6 bg-[#070913] text-white">
          <div className="ios-glass-card rounded-3xl p-8 max-w-lg w-full text-center space-y-4 border-rose-500/40 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Workspace Session Recovered</h2>
            <p className="text-slate-300 text-xs leading-relaxed">
              A temporary interface issue occurred. Your progress was safely handled.
            </p>
            {this.state.error?.message && (
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 font-mono text-[11px] text-rose-300 text-left overflow-x-auto">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="ios-glass-btn-primary w-full py-3 rounded-2xl text-xs font-bold text-white flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restart / Return to Setup</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
