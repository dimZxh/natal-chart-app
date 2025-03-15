import React, { useState, useEffect } from 'react';
import BirthDataForm from './components/Form/BirthDataForm';
import NatalChart from './components/Chart/NatalChart';
import TransitChart from './components/Transits/TransitChart';
import ChartAnalysis from './components/Analysis/ChartAnalysis';
import ProfileList from './components/Form/ProfileList';
import { useChartContext } from './context/ChartContext';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <p>Please try refreshing the page or contact support if the problem persists.</p>
          <button onClick={() => window.location.reload()}>Refresh Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const { birthData, chartData, transitData, loading, error } = useChartContext();
  const [activeTab, setActiveTab] = useState('natal'); // 'natal', 'transit', or 'analysis'
  const [appError, setAppError] = useState(null);
  const [theme, setTheme] = useState('light');

  // Handle any unexpected errors
  useEffect(() => {
    const handleGlobalError = (event) => {
      console.error('Global error:', event.error);
      setAppError('An unexpected error occurred. Please refresh the page.');
      event.preventDefault();
    };

    window.addEventListener('error', handleGlobalError);

    return () => {
      window.removeEventListener('error', handleGlobalError);
    };
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
    document.body.classList.toggle('dark-theme');
  };

  return (
    <ErrorBoundary>
      <div className={`app-container ${theme}`}>
        <div className="container">
          <header className="app-header">
            <div className="app-header-content">
              <h1 className="app-title">Interactive Natal Chart</h1>
              <p className="app-subtitle">Explore your astrological birth chart and current transits</p>
            </div>
            <div className="app-controls">
              <button 
                className="theme-toggle" 
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
            </div>
          </header>

          {appError && (
            <div className="alert alert-danger">
              {appError}
              <button
                className="refresh-btn"
                onClick={() => window.location.reload()}
              >
                Refresh
              </button>
            </div>
          )}

          <div className="row">
            <div className="col-md-4">
              <div className="card">
                <ErrorBoundary>
                  <BirthDataForm />
                </ErrorBoundary>
              </div>

              {birthData && (
                <div className="card">
                  <h3 className="card-title">Saved Profiles</h3>
                  <ErrorBoundary>
                    <ProfileList />
                  </ErrorBoundary>
                </div>
              )}
            </div>

            <div className="col-md-8">
              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <p>Loading chart data...</p>
                </div>
              ) : (
                <>
                  <div className="chart-tabs">
                    <button 
                      className={`tab-btn ${activeTab === 'natal' ? 'active' : ''}`}
                      onClick={() => setActiveTab('natal')}
                    >
                      Natal Chart
                    </button>
                    <button 
                      className={`tab-btn ${activeTab === 'transit' ? 'active' : ''}`}
                      onClick={() => setActiveTab('transit')}
                      disabled={!chartData}
                    >
                      Current Transits
                    </button>
                    <button 
                      className={`tab-btn ${activeTab === 'analysis' ? 'active' : ''}`}
                      onClick={() => setActiveTab('analysis')}
                      disabled={!chartData}
                    >
                      Chart Analysis
                    </button>
                  </div>

                  <div className="chart-content">
                    {activeTab === 'natal' && chartData && (
                      <ErrorBoundary>
                        <NatalChart data={chartData} />
                      </ErrorBoundary>
                    )}

                    {activeTab === 'transit' && transitData && (
                      <ErrorBoundary>
                        <TransitChart
                          natalData={chartData}
                          transitData={transitData}
                        />
                      </ErrorBoundary>
                    )}

                    {activeTab === 'analysis' && chartData && (
                      <ErrorBoundary>
                        <ChartAnalysis
                          chartData={chartData}
                          transitData={transitData}
                        />
                      </ErrorBoundary>
                    )}

                    {!chartData && (
                      <div className="no-chart-message">
                        <p>Enter your birth details to generate your natal chart.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
          
          <footer className="app-footer">
            <p>&copy; {new Date().getFullYear()} Interactive Natal Chart. All rights reserved.</p>
            <p>For entertainment purposes only.</p>
          </footer>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App; 