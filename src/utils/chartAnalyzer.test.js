import {
  createChartSnapshot,
  generateChartAnalysis,
  exportChartDataAsJson,
  exportChartAnalysisAsText
} from './chartAnalyzer';

// Mock chart data for testing
const mockChartData = {
  birthData: {
    name: 'Test User',
    date: new Date('2000-01-01'),
    time: '12:00',
    place: 'New York, NY',
    latitude: 40.7128,
    longitude: -74.0060
  },
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
      color: '#F1C40F' 
    },
    { 
      planet: 'moon', 
      name: 'Moon', 
      symbol: '☽', 
      longitude: 120.3, 
      zodiacSignName: 'Leo', 
      degree: 0.3, 
      isRetrograde: false, 
      color: '#7F8C8D' 
    },
    { 
      planet: 'mercury', 
      name: 'Mercury', 
      symbol: '☿', 
      longitude: 275.8, 
      zodiacSignName: 'Capricorn', 
      degree: 5.8, 
      isRetrograde: true, 
      color: '#9B59B6' 
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

// Mock transit data for testing
const mockTransitData = {
  date: new Date('2023-01-01'),
  time: '12:00',
  planets: [
    { 
      planet: 'sun', 
      name: 'Sun', 
      symbol: '☉', 
      longitude: 290.5, 
      zodiacSignName: 'Capricorn', 
      degree: 20.5, 
      isRetrograde: false, 
      color: '#F1C40F' 
    },
    { 
      planet: 'moon', 
      name: 'Moon', 
      symbol: '☽', 
      longitude: 150.3, 
      zodiacSignName: 'Virgo', 
      degree: 0.3, 
      isRetrograde: false, 
      color: '#7F8C8D' 
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

// Mock chartUtils functions
jest.mock('./chartUtils', () => ({
  getZodiacSignIndex: jest.fn().mockImplementation(longitude => Math.floor((longitude % 360) / 30)),
  getHouseNumber: jest.fn().mockImplementation((longitude, houses) => {
    const normalizedLongitude = ((longitude % 360) + 360) % 360;
    for (let i = 0; i < houses.length; i++) {
      const currentHouse = houses[i];
      const nextHouse = houses[(i + 1) % houses.length];
      let start = currentHouse.longitude;
      let end = nextHouse.longitude;
      if (end < start) end += 360;
      if (normalizedLongitude >= start && normalizedLongitude < end) {
        return currentHouse.house;
      }
    }
    return 1;
  }),
  getElementForSign: jest.fn().mockImplementation(signIndex => {
    const elements = ['Fire', 'Earth', 'Air', 'Water'];
    return elements[signIndex % 4];
  }),
  getModalityForSign: jest.fn().mockImplementation(signIndex => {
    const modalities = ['Cardinal', 'Fixed', 'Mutable'];
    return modalities[signIndex % 3];
  })
}));

describe('Chart Analyzer Utility', () => {
  describe('createChartSnapshot', () => {
    test('returns null if no chart data is provided', () => {
      expect(createChartSnapshot(null)).toBeNull();
    });

    test('creates a snapshot with basic info from chart data', () => {
      const snapshot = createChartSnapshot(mockChartData);
      
      expect(snapshot).toHaveProperty('basicInfo');
      expect(snapshot.basicInfo.name).toBe('Test User');
      expect(snapshot.basicInfo.birthPlace).toBe('New York, NY');
    });

    test('formats planetary positions correctly', () => {
      const snapshot = createChartSnapshot(mockChartData);
      
      expect(snapshot).toHaveProperty('planets');
      expect(snapshot.planets).toHaveLength(3);
      expect(snapshot.planets[0]).toHaveProperty('planet', 'Sun');
      expect(snapshot.planets[0]).toHaveProperty('sign', 'Capricorn');
      expect(snapshot.planets[0]).toHaveProperty('house');
      expect(snapshot.planets[0]).toHaveProperty('element');
      expect(snapshot.planets[0]).toHaveProperty('modality');
    });

    test('formats house cusps correctly', () => {
      const snapshot = createChartSnapshot(mockChartData);
      
      expect(snapshot).toHaveProperty('houses');
      expect(snapshot.houses).toHaveLength(12);
      expect(snapshot.houses[0]).toHaveProperty('house', 1);
      expect(snapshot.houses[0]).toHaveProperty('sign');
    });

    test('formats aspects correctly', () => {
      const snapshot = createChartSnapshot(mockChartData);
      
      expect(snapshot).toHaveProperty('aspects');
      expect(snapshot.aspects).toHaveLength(1);
      expect(snapshot.aspects[0]).toHaveProperty('aspect', 'conjunction');
      expect(snapshot.aspects[0]).toHaveProperty('planet1', 'Sun');
      expect(snapshot.aspects[0]).toHaveProperty('planet2', 'Mercury');
    });

    test('formats special points correctly', () => {
      const snapshot = createChartSnapshot(mockChartData);
      
      expect(snapshot).toHaveProperty('specialPoints');
      expect(snapshot.specialPoints).toHaveProperty('ascendant');
      expect(snapshot.specialPoints).toHaveProperty('midheaven');
      expect(snapshot.specialPoints.ascendant).toHaveProperty('sign');
      expect(snapshot.specialPoints.midheaven).toHaveProperty('sign');
    });

    test('includes transit data when provided', () => {
      const snapshot = createChartSnapshot(mockChartData, mockTransitData);
      
      expect(snapshot).toHaveProperty('transits');
      expect(snapshot.transits).toHaveProperty('planets');
      expect(snapshot.transits).toHaveProperty('aspects');
      expect(snapshot.transits.planets).toHaveLength(2);
    });
  });

  describe('generateChartAnalysis', () => {
    test('returns error object if no chart data is provided', () => {
      const analysis = generateChartAnalysis(null);
      expect(analysis).toHaveProperty('error');
    });

    test('generates analysis with all required sections', () => {
      const analysis = generateChartAnalysis(mockChartData);
      
      expect(analysis).toHaveProperty('summary');
      expect(analysis).toHaveProperty('planets');
      expect(analysis).toHaveProperty('houses');
      expect(analysis).toHaveProperty('aspects');
      expect(analysis).toHaveProperty('elements');
      expect(analysis.transits).toBeNull();
    });

    test('includes transit analysis when transit data is provided', () => {
      const analysis = generateChartAnalysis(mockChartData, mockTransitData);
      
      expect(analysis).toHaveProperty('transits');
      expect(typeof analysis.transits).toBe('string');
      expect(analysis.transits).toContain('Transit Analysis');
    });
  });

  describe('exportChartDataAsJson', () => {
    test('exports chart data as JSON string', () => {
      const jsonString = exportChartDataAsJson(mockChartData);
      
      expect(typeof jsonString).toBe('string');
      
      const parsedJson = JSON.parse(jsonString);
      expect(parsedJson).toHaveProperty('basicInfo');
      expect(parsedJson).toHaveProperty('planets');
      expect(parsedJson).toHaveProperty('houses');
      expect(parsedJson).toHaveProperty('aspects');
      expect(parsedJson).toHaveProperty('specialPoints');
    });

    test('includes transit data in JSON when provided', () => {
      const jsonString = exportChartDataAsJson(mockChartData, mockTransitData);
      
      const parsedJson = JSON.parse(jsonString);
      expect(parsedJson).toHaveProperty('transits');
      expect(parsedJson.transits).toHaveProperty('planets');
    });
  });

  describe('exportChartAnalysisAsText', () => {
    test('exports chart analysis as formatted text', () => {
      const textAnalysis = exportChartAnalysisAsText(mockChartData);
      
      expect(typeof textAnalysis).toBe('string');
      expect(textAnalysis).toContain('# NATAL CHART ANALYSIS');
      expect(textAnalysis).toContain('## Summary');
      expect(textAnalysis).toContain('## Planetary Positions');
      expect(textAnalysis).toContain('## House Placements');
      expect(textAnalysis).toContain('## Aspects');
      expect(textAnalysis).toContain('## Elemental Balance');
    });

    test('includes transit analysis in text when provided', () => {
      const textAnalysis = exportChartAnalysisAsText(mockChartData, mockTransitData);
      
      expect(textAnalysis).toContain('## Transit Analysis');
    });
  });
}); 