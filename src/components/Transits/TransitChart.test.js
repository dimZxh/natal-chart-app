import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TransitChart from './TransitChart';

// Mock data for testing
const mockNatalData = {
  birthData: {
    name: 'Test User',
    place: 'New York, NY'
  },
  date: '2000-01-01',
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
  aspects: [],
  ascendant: { longitude: 0 },
  midheaven: { longitude: 270 }
};

const mockTransitData = {
  date: '2023-01-01',
  time: '12:00',
  zodiacSigns: mockNatalData.zodiacSigns,
  planets: [
    { 
      planet: 'sun', 
      name: 'Sun', 
      symbol: '☉', 
      longitude: 290.5, 
      zodiacSignName: 'Capricorn', 
      degree: 20.5, 
      isRetrograde: false, 
      color: '#F1C40F',
      element: 'Earth'
    },
    { 
      planet: 'moon', 
      name: 'Moon', 
      symbol: '☽', 
      longitude: 150.3, 
      zodiacSignName: 'Virgo', 
      degree: 0.3, 
      isRetrograde: false, 
      color: '#7F8C8D',
      element: 'Earth'
    }
  ],
  aspects: [
    { 
      planet1: 'sun', 
      planet2: 'sun', 
      aspect: 'conjunction', 
      aspectData: { name: 'Conjunction', angle: 0, orb: 8 }, 
      orb: '10.0',
      isTransitToNatal: true
    }
  ],
  ascendant: { longitude: 10 },
  midheaven: { longitude: 280 }
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

describe('TransitChart Component', () => {
  test('renders without crashing', () => {
    render(<TransitChart natalData={mockNatalData} transitData={mockTransitData} />);
    // Component renders without errors
  });

  test('renders transit chart container', () => {
    render(<TransitChart natalData={mockNatalData} transitData={mockTransitData} />);
    const chartContainer = screen.getByClassName('transit-chart-container');
    expect(chartContainer).toBeInTheDocument();
  });

  test('does not render details when no planet is selected', () => {
    render(<TransitChart natalData={mockNatalData} transitData={mockTransitData} />);
    const detailsElement = screen.queryByClassName('chart-details');
    expect(detailsElement).not.toBeInTheDocument();
  });

  test('handles click on chart container to clear selection', () => {
    const { container } = render(<TransitChart natalData={mockNatalData} transitData={mockTransitData} />);
    
    // Simulate selecting a planet (we need to set state directly since D3 interactions are mocked)
    const chartComponent = container.firstChild;
    fireEvent.click(chartComponent);
    
    // Verify no details are shown after clicking the chart container
    const detailsElement = screen.queryByClassName('chart-details');
    expect(detailsElement).not.toBeInTheDocument();
  });

  test('renders chart legend', () => {
    render(<TransitChart natalData={mockNatalData} transitData={mockTransitData} />);
    const legendElement = screen.getByClassName('chart-legend');
    expect(legendElement).toBeInTheDocument();
  });

  test('renders legend note about natal and transit planets', () => {
    render(<TransitChart natalData={mockNatalData} transitData={mockTransitData} />);
    const legendNote = screen.getByText(/Solid circles represent natal planets/i);
    expect(legendNote).toBeInTheDocument();
  });
}); 