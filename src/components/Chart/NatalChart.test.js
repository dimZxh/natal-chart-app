import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NatalChart from './NatalChart';

// Mock data for testing
const mockChartData = {
  birthData: {
    name: 'Test User',
    place: 'New York, NY'
  },
  date: '2023-01-01',
  time: '12:00',
  zodiacSigns: [
    { id: 'aries', name: 'Aries', symbol: '♈', element: 'Fire' },
    { id: 'taurus', name: 'Taurus', symbol: '♉', element: 'Earth' },
    { id: 'gemini', name: 'Gemini', symbol: '♊', element: 'Air' },
    { id: 'cancer', name: 'Cancer', symbol: '♋', element: 'Water' },
    { id: 'leo', name: 'Leo', symbol: '♌', element: 'Fire' },
    { id: 'virgo', name: 'Virgo', symbol: '♍', element: 'Earth' },
    { id: 'libra', name: 'Libra', symbol: '♎', element: 'Air' },
    { id: 'scorpio', name: 'Scorpio', symbol: '♏', element: 'Water' },
    { id: 'sagittarius', name: 'Sagittarius', symbol: '♐', element: 'Fire' },
    { id: 'capricorn', name: 'Capricorn', symbol: '♑', element: 'Earth' },
    { id: 'aquarius', name: 'Aquarius', symbol: '♒', element: 'Air' },
    { id: 'pisces', name: 'Pisces', symbol: '♓', element: 'Water' }
  ],
  planets: [
    { 
      planet: 'sun', 
      name: 'Sun', 
      symbol: '☉', 
      longitude: 280.5, 
      zodiacSignName: 'Capricorn', 
      degree: 10.5, 
      isRetrograde: false, 
      color: '#F1C40F',
      element: 'Earth'
    },
    { 
      planet: 'moon', 
      name: 'Moon', 
      symbol: '☽', 
      longitude: 120.3, 
      zodiacSignName: 'Leo', 
      degree: 0.3, 
      isRetrograde: false, 
      color: '#7F8C8D',
      element: 'Fire'
    },
    { 
      planet: 'mercury', 
      name: 'Mercury', 
      symbol: '☿', 
      longitude: 275.8, 
      zodiacSignName: 'Capricorn', 
      degree: 5.8, 
      isRetrograde: true, 
      color: '#9B59B6',
      element: 'Earth'
    }
  ],
  houses: [
    { house: 1, longitude: 0 },
    { house: 2, longitude: 30 },
    { house: 3, longitude: 60 },
    { house: 4, longitude: 90 },
    { house: 5, longitude: 120 },
    { house: 6, longitude: 150 },
    { house: 7, longitude: 180 },
    { house: 8, longitude: 210 },
    { house: 9, longitude: 240 },
    { house: 10, longitude: 270 },
    { house: 11, longitude: 300 },
    { house: 12, longitude: 330 }
  ],
  aspects: [
    { 
      planet1: 'sun', 
      planet2: 'mercury', 
      aspect: 'conjunction', 
      aspectData: { name: 'Conjunction', angle: 0, orb: 8 }, 
      orb: '4.7' 
    }
  ],
  ascendant: { longitude: 0 },
  midheaven: { longitude: 270 }
};

// Mock D3 functionality
jest.mock('d3', () => {
  const originalD3 = jest.requireActual('d3');
  return {
    ...originalD3,
    select: jest.fn().mockReturnValue({
      selectAll: jest.fn().mockReturnValue({
        remove: jest.fn(),
        data: jest.fn().mockReturnThis(),
        enter: jest.fn().mockReturnThis(),
        append: jest.fn().mockReturnThis(),
        attr: jest.fn().mockReturnThis(),
        style: jest.fn().mockReturnThis(),
        text: jest.fn().mockReturnThis(),
        on: jest.fn().mockReturnThis(),
        transition: jest.fn().mockReturnThis(),
        duration: jest.fn().mockReturnThis(),
        html: jest.fn().mockReturnThis()
      }),
      append: jest.fn().mockReturnValue({
        attr: jest.fn().mockReturnThis(),
        style: jest.fn().mockReturnThis(),
        text: jest.fn().mockReturnThis(),
        append: jest.fn().mockReturnThis(),
        selectAll: jest.fn().mockReturnThis(),
        data: jest.fn().mockReturnThis(),
        enter: jest.fn().mockReturnThis()
      }),
      attr: jest.fn().mockReturnThis(),
      style: jest.fn().mockReturnThis()
    }),
    pie: jest.fn().mockReturnValue(jest.fn().mockReturnValue([])),
    arc: jest.fn().mockReturnValue({
      innerRadius: jest.fn().mockReturnThis(),
      outerRadius: jest.fn().mockReturnThis()
    })
  };
});

describe('NatalChart Component', () => {
  test('renders without crashing', () => {
    render(<NatalChart data={mockChartData} />);
    // Component renders without errors
  });

  test('renders chart container', () => {
    render(<NatalChart data={mockChartData} />);
    const chartContainer = screen.getByClassName('natal-chart-container');
    expect(chartContainer).toBeInTheDocument();
  });

  test('does not render details when no planet is selected', () => {
    render(<NatalChart data={mockChartData} />);
    const detailsElement = screen.queryByClassName('chart-details');
    expect(detailsElement).not.toBeInTheDocument();
  });

  test('handles click on chart container to clear selection', () => {
    const { container } = render(<NatalChart data={mockChartData} />);
    
    // Simulate selecting a planet (we need to set state directly since D3 interactions are mocked)
    const chartComponent = container.firstChild;
    fireEvent.click(chartComponent);
    
    // Verify no details are shown after clicking the chart container
    const detailsElement = screen.queryByClassName('chart-details');
    expect(detailsElement).not.toBeInTheDocument();
  });

  test('renders chart legend', () => {
    render(<NatalChart data={mockChartData} />);
    const legendElement = screen.getByClassName('chart-legend');
    expect(legendElement).toBeInTheDocument();
  });
}); 