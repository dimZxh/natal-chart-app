import React, { useState, useEffect } from 'react';
import { useChartContext } from '../../context/ChartContext';
import { generateChartAnalysis, exportChartDataAsJson, exportChartAnalysisAsText } from '../../utils/chartAnalyzer';

const ChartAnalysis = () => {
  const { chartData, transitData } = useChartContext();
  const [analysis, setAnalysis] = useState(null);
  const [activeSection, setActiveSection] = useState('summary');
  const [exportFormat, setExportFormat] = useState('text');

  useEffect(() => {
    if (chartData) {
      const chartAnalysis = generateChartAnalysis(chartData, transitData);
      setAnalysis(chartAnalysis);
    }
  }, [chartData, transitData]);

  const handleExport = () => {
    if (!chartData) return;
    
    let exportData;
    let fileName;
    let fileType;
    
    if (exportFormat === 'json') {
      exportData = exportChartDataAsJson(chartData, transitData);
      fileName = `natal-chart-data-${new Date().toISOString().split('T')[0]}.json`;
      fileType = 'application/json';
    } else {
      exportData = exportChartAnalysisAsText(chartData, transitData);
      fileName = `natal-chart-analysis-${new Date().toISOString().split('T')[0]}.txt`;
      fileType = 'text/plain';
    }
    
    // Create a blob and download link
    const blob = new Blob([exportData], { type: fileType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    if (!chartData) return;
    
    let exportData;
    
    if (exportFormat === 'json') {
      exportData = exportChartDataAsJson(chartData, transitData);
    } else {
      exportData = exportChartAnalysisAsText(chartData, transitData);
    }
    
    navigator.clipboard.writeText(exportData)
      .then(() => {
        alert('Chart data copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy to clipboard. Please try again.');
      });
  };

  if (!analysis) {
    return <div className="chart-analysis-container">No chart data available for analysis.</div>;
  }

  return (
    <div className="chart-analysis-container">
      <h2>Chart Analysis</h2>
      
      <div className="analysis-tabs">
        <button 
          className={`tab-btn ${activeSection === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveSection('summary')}
        >
          Summary
        </button>
        <button 
          className={`tab-btn ${activeSection === 'planets' ? 'active' : ''}`}
          onClick={() => setActiveSection('planets')}
        >
          Planets
        </button>
        <button 
          className={`tab-btn ${activeSection === 'houses' ? 'active' : ''}`}
          onClick={() => setActiveSection('houses')}
        >
          Houses
        </button>
        <button 
          className={`tab-btn ${activeSection === 'aspects' ? 'active' : ''}`}
          onClick={() => setActiveSection('aspects')}
        >
          Aspects
        </button>
        <button 
          className={`tab-btn ${activeSection === 'elements' ? 'active' : ''}`}
          onClick={() => setActiveSection('elements')}
        >
          Elements
        </button>
        {analysis.transits && (
          <button 
            className={`tab-btn ${activeSection === 'transits' ? 'active' : ''}`}
            onClick={() => setActiveSection('transits')}
          >
            Transits
          </button>
        )}
      </div>
      
      <div className="analysis-content">
        {activeSection === 'summary' && (
          <div className="analysis-section">
            <h3>Chart Summary</h3>
            <p className="analysis-text">{analysis.summary}</p>
          </div>
        )}
        
        {activeSection === 'planets' && (
          <div className="analysis-section">
            <h3>Planetary Positions</h3>
            <pre className="analysis-text">{analysis.planets}</pre>
          </div>
        )}
        
        {activeSection === 'houses' && (
          <div className="analysis-section">
            <h3>House Placements</h3>
            <pre className="analysis-text">{analysis.houses}</pre>
          </div>
        )}
        
        {activeSection === 'aspects' && (
          <div className="analysis-section">
            <h3>Aspect Analysis</h3>
            <pre className="analysis-text">{analysis.aspects}</pre>
          </div>
        )}
        
        {activeSection === 'elements' && (
          <div className="analysis-section">
            <h3>Elemental Balance</h3>
            <pre className="analysis-text">{analysis.elements}</pre>
          </div>
        )}
        
        {activeSection === 'transits' && analysis.transits && (
          <div className="analysis-section">
            <h3>Transit Analysis</h3>
            <pre className="analysis-text">{analysis.transits}</pre>
          </div>
        )}
      </div>
      
      <div className="export-section">
        <h3>Export Chart Data</h3>
        <p>Export your chart data for analysis by an AI language model or for personal reference.</p>
        
        <div className="export-options">
          <div className="export-format">
            <label>
              <input 
                type="radio" 
                name="exportFormat" 
                value="text" 
                checked={exportFormat === 'text'} 
                onChange={() => setExportFormat('text')} 
              />
              Text Analysis (Readable)
            </label>
            <label>
              <input 
                type="radio" 
                name="exportFormat" 
                value="json" 
                checked={exportFormat === 'json'} 
                onChange={() => setExportFormat('json')} 
              />
              JSON Data (For AI/LLM)
            </label>
          </div>
          
          <div className="export-buttons">
            <button className="btn" onClick={handleExport}>
              Download {exportFormat === 'json' ? 'JSON' : 'Text'} File
            </button>
            <button className="btn btn-secondary" onClick={copyToClipboard}>
              Copy to Clipboard
            </button>
          </div>
        </div>
        
        <div className="llm-prompt-suggestion">
          <h4>Suggested Prompt for AI/LLM:</h4>
          <p className="prompt-text">
            "I'm sharing my natal chart data. Could you provide insights about my personality traits, 
            strengths, challenges, and potential life path based on this astrological information? 
            Please focus on the relationships between planets, houses, and signs, and how they might 
            influence different areas of my life."
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChartAnalysis; 