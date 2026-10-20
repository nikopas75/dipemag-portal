import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Copy, Check } from 'lucide-react';

interface Props {
  children: ReactNode;
  moduleTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null, copied: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, copied: false });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  private handleCopy = () => {
    const details = [
      `Module: ${this.props.moduleTitle || 'Unknown'}`,
      `Error: ${this.state.error?.message || 'Unknown error'}`,
      `Stack: ${this.state.error?.stack || 'No stack'}`,
      `Component Stack: ${this.state.errorInfo?.componentStack || 'No component stack'}`
    ].join('\n\n');

    navigator.clipboard.writeText(details).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    }).catch(() => {});
  };

  public render() {
    if (this.state.hasError) {
      const title = this.props.moduleTitle || 'Εφαρμογής';
      return (
        <div className="min-h-[400px] w-full p-6 sm:p-8 rounded-3xl bg-slate-900 border border-red-900/60 shadow-2xl flex flex-col justify-center items-center text-center space-y-6 animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-2xl bg-red-950/80 border border-red-800 flex items-center justify-center text-red-400 shadow-lg shadow-red-950/40">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="max-w-xl space-y-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-red-950 text-red-400 border border-red-800">
              ΕΝΤΟΠΙΣΜΟΣ ΣΦΑΛΜΑΤΟΣ
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Παρουσιάστηκε πρόβλημα κατά τη φόρτωση {title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Η εφαρμογή απέτρεψε την εμφάνιση κενής οθόνης (λευκής σελίδας). Μπορείτε να επιστρέψετε στην κεντρική πύλη ή να προσπαθήσετε ξανά.
            </p>
          </div>

          {this.state.error && (
            <div className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl p-4 text-left font-mono text-xs text-red-300 space-y-2 overflow-x-auto">
              <div className="flex items-center justify-between text-slate-400 text-[11px] pb-1 border-b border-slate-800">
                <span>Λεπτομέρειες Σφάλματος:</span>
                <button
                  onClick={this.handleCopy}
                  className="flex items-center space-x-1 text-slate-300 hover:text-white px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 transition text-[11px]"
                >
                  {this.state.copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{this.state.copied ? 'Αντιγράφηκε' : 'Αντιγραφή'}</span>
                </button>
              </div>
              <p className="font-semibold text-red-200">{this.state.error.toString()}</p>
              {this.state.error.stack && (
                <pre className="text-[10px] text-slate-500 whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {this.state.error.stack}
                </pre>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center space-x-2 shadow-lg shadow-blue-600/20 transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Δοκιμή Ξανά</span>
            </button>
            <button
              onClick={() => {
                if (this.props.onReset) this.props.onReset();
                window.location.hash = '';
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center space-x-2 transition"
            >
              <Home className="w-4 h-4" />
              <span>Κεντρική Πύλη (Hub)</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
