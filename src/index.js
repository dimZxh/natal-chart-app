import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ChartProvider } from './context/ChartContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ChartProvider>
      <App />
    </ChartProvider>
  </React.StrictMode>
); 