import { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
  isReporting: boolean;
  reportSent: boolean;
  userFeedback: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void;
  level?: 'page' | 'component' | 'critical';
  isolate?: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryCount = 0;
  private readonly maxRetries = 3;
  
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      isReporting: false,
      reportSent: false,
      userFeedback: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = this.generateErrorId();
    
    this.setState({
      error,
      errorInfo,
      errorId,
    });

    // Log error to console for development
    console.error('Error Boundary caught error:', error);
    console.error('Component stack:', errorInfo.componentStack);

    // Report error to analytics and error tracking
    this.reportError(error, errorInfo, errorId);

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo, errorId);
    }

    // Track error in analytics
    this.trackErrorEvent(error, errorInfo, errorId);
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async reportError(error: Error, errorInfo: ErrorInfo, errorId: string) {
    try {
      const errorData = {
        id: errorId,
        error_type: 'javascript',
        error_message: error.message,
        stack_trace: error.stack,
        user_agent: navigator.userAgent,
        url: window.location.href,
        severity: this.props.level === 'critical' ? 'critical' : 'error',
        metadata: {
          componentStack: errorInfo.componentStack,
          retryCount: this.retryCount,
          timestamp: new Date().toISOString(),
          props: this.props.level,
          isolate: this.props.isolate,
        },
      };

      await supabase
        .from('error_logs')
        .insert([errorData]);

    } catch (reportError) {
      console.error('Failed to report error:', reportError);
    }
  }

  private async trackErrorEvent(error: Error, errorInfo: ErrorInfo, errorId: string) {
    try {
      await supabase
        .from('analytics_events')
        .insert([{
          event_type: 'error_boundary',
          event_data: {
            errorId,
            errorType: error.constructor.name,
            message: error.message,
            level: this.props.level,
          },
          success: false,
          metadata: {
            componentStack: errorInfo.componentStack?.split('\n').slice(0, 5) || [], // Limit stack trace
            retryAttempt: this.retryCount,
          },
        }]);
    } catch (analyticsError) {
      console.error('Failed to track error event:', analyticsError);
    }
  }

  private retry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        errorId: undefined,
        reportSent: false,
        userFeedback: '',
      });
    }
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleSendFeedback = async () => {
    if (!this.state.userFeedback.trim()) return;

    this.setState({ isReporting: true });

    try {
      await supabase
        .from('error_logs')
        .update({
          metadata: {
            ...this.state.errorInfo,
            userFeedback: this.state.userFeedback,
            feedbackTimestamp: new Date().toISOString(),
          },
        })
        .eq('id', this.state.errorId);

      this.setState({ reportSent: true, isReporting: false });
    } catch (error) {
      console.error('Failed to send feedback:', error);
      this.setState({ isReporting: false });
    }
  };

  private renderErrorDetails() {
    const { error, errorInfo, errorId } = this.state;
    if (!error || !errorInfo) return null;

    return (
      <details className="mt-4 text-left">
        <summary className="cursor-pointer text-slate-400 hover:text-slate-300 text-sm">
          Technical Details (Error ID: {errorId})
        </summary>
        <div className="mt-2 p-3 bg-slate-800 rounded border text-xs font-mono">
          <div className="mb-2">
            <strong className="text-red-400">Error:</strong> {error.message}
          </div>
          {error.stack && (
            <div className="mb-2">
              <strong className="text-red-400">Stack:</strong>
              <pre className="mt-1 text-slate-300 whitespace-pre-wrap text-xs overflow-x-auto">
                {error.stack.split('\n').slice(0, 10).join('\n')}
              </pre>
            </div>
          )}
          <div>
            <strong className="text-red-400">Component Stack:</strong>
            <pre className="mt-1 text-slate-300 whitespace-pre-wrap text-xs overflow-x-auto">
              {errorInfo.componentStack?.split('\n').slice(0, 8).join('\n') || 'No component stack available'}
            </pre>
          </div>
        </div>
      </details>
    );
  }

  private renderFeedbackForm() {
    const { userFeedback, isReporting, reportSent } = this.state;

    if (reportSent) {
      return (
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <p className="text-green-400 text-sm">
            ✓ Thank you for your feedback! We'll investigate this issue.
          </p>
        </div>
      );
    }

    return (
      <div className="mt-4">
        <label className="block text-sm text-slate-300 mb-2">
          Help us fix this by describing what you were doing:
        </label>
        <textarea
          value={userFeedback}
          onChange={(e) => this.setState({ userFeedback: e.target.value })}
          placeholder="I was trying to... when this error occurred."
          className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm resize-none"
          rows={3}
        />
        <button
          onClick={this.handleSendFeedback}
          disabled={isReporting || !userFeedback.trim()}
          className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg text-sm flex items-center gap-2 transition-colors"
        >
          {isReporting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send size={16} />
              Send Feedback
            </>
          )}
        </button>
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback && this.state.error && this.state.errorInfo) {
        return this.props.fallback(this.state.error, this.state.errorInfo, this.retry);
      }

      // Component-level error (smaller, inline recovery)
      if (this.props.level === 'component') {
        return (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h3 className="text-red-400 font-medium">Component Error</h3>
                <p className="text-slate-300 text-sm mt-1">
                  This component encountered an error and couldn't render properly.
                </p>
                {this.retryCount < this.maxRetries && (
                  <button
                    onClick={this.retry}
                    className="mt-2 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-sm transition-colors"
                  >
                    Try Again ({this.maxRetries - this.retryCount} attempts left)
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      }

      // Page-level or critical error (full error page)
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bug size={32} className="text-red-400" />
              </div>
              
              <h1 className="text-2xl font-bold text-white mb-2">
                {this.props.level === 'critical' ? 'Critical Error' : 'Something Went Wrong'}
              </h1>
              
              <p className="text-slate-400 mb-6">
                {this.props.level === 'critical' 
                  ? 'A critical error occurred that requires immediate attention.'
                  : 'An unexpected error occurred. We\'ve been notified and will investigate.'
                }
              </p>

              <div className="flex gap-3 justify-center mb-6">
                {this.retryCount < this.maxRetries && (
                  <button
                    onClick={this.retry}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <RefreshCw size={18} />
                    Try Again ({this.maxRetries - this.retryCount} left)
                  </button>
                )}
                
                <button
                  onClick={this.handleRefresh}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <RefreshCw size={18} />
                  Reload Page
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Home size={18} />
                  Go Home
                </button>
              </div>

              {this.renderFeedbackForm()}
              {this.renderErrorDetails()}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easy wrapping
export function withErrorBoundary<P extends object>(
  Component: import('react').ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook for manual error reporting
export function useErrorReporting() {
  const reportError = async (
    error: Error | string,
    context?: {
      component?: string;
      action?: string;
      metadata?: Record<string, any>;
    }
  ) => {
    try {
      const errorData = {
        error_type: 'manual' as const,
        error_message: typeof error === 'string' ? error : error.message,
        stack_trace: typeof error === 'string' ? undefined : error.stack,
        user_agent: navigator.userAgent,
        url: window.location.href,
        severity: 'warning' as const,
        metadata: {
          ...context,
          timestamp: new Date().toISOString(),
          manual: true,
        },
      };

      await supabase.from('error_logs').insert([errorData]);
      
      // Also track as analytics event
      await supabase.from('analytics_events').insert([{
        event_type: 'error_boundary',
        event_data: {
          errorType: 'manual',
          message: typeof error === 'string' ? error : error.message,
          context: context?.component || 'unknown',
        },
        success: false,
        metadata: context,
      }]);
      
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  return { reportError };
}