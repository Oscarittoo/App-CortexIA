import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    this.logError(error, errorInfo);
  }

  logError(error, errorInfo) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    try {
      const existingLogs = JSON.parse(localStorage.getItem('cortexai_error_logs') || '[]');
      existingLogs.push(errorLog);
      
      if (existingLogs.length > 50) {
        existingLogs.shift();
      }
      
      localStorage.setItem('cortexai_error_logs', JSON.stringify(existingLogs));
    } catch (e) {
      console.error('Failed to log error:', e);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          backgroundColor: 'var(--color-bg-secondary)',
        }}>
          <div style={{
            maxWidth: '600px',
            width: '100%',
            padding: '2rem',
            backgroundColor: 'var(--color-bg-primary)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--color-border-light)',
          }}>
            <div style={{
              fontSize: '3rem',
              textAlign: 'center',
              marginBottom: '1rem',
            }}>
              ⚠️
            </div>
            
            <h2 style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)',
              marginBottom: '0.5rem',
              textAlign: 'center',
            }}>
              Something went wrong
            </h2>
            
            <p style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              marginBottom: '1.5rem',
              textAlign: 'center',
            }}>
              An unexpected error occurred. The error has been logged for debugging.
            </p>
            
            {this.state.error && (
              <details style={{
                marginBottom: '1.5rem',
                padding: '1rem',
                backgroundColor: 'var(--color-bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-xs)',
                fontFamily: 'var(--font-mono)',
              }}>
                <summary style={{
                  cursor: 'pointer',
                  fontWeight: 'var(--font-weight-medium)',
                  marginBottom: '0.5rem',
                  color: 'var(--color-text-primary)',
                }}>
                  Error details
                </summary>
                <div style={{
                  color: 'var(--color-text-secondary)',
                  whiteSpace: 'pre-wrap',
                  overflowX: 'auto',
                }}>
                  <div><strong>Error:</strong> {this.state.error.toString()}</div>
                  {this.state.errorInfo && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <strong>Component Stack:</strong>
                      {this.state.errorInfo.componentStack}
                    </div>
                  )}
                </div>
              </details>
            )}
            
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'center',
            }}>
              <button
                onClick={this.handleReset}
                className="btn btn-secondary"
              >
                Try Again
              </button>
              
              <button
                onClick={this.handleReload}
                className="btn btn-primary"
              >
                Reload Page
              </button>
            </div>
            
            {this.state.errorCount > 3 && (
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem',
                backgroundColor: 'var(--color-error-light)',
                color: 'var(--color-error)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-sm)',
                textAlign: 'center',
              }}>
                Multiple errors detected. Consider clearing cache or contacting support.
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
