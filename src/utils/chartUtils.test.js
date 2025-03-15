import {
  calculateOrb,
  isAspect,
  getZodiacSignIndex,
  getDegreeInSign,
  getHouseNumber,
  isRetrograde,
  calculateMidpoint,
  getElementForSign,
  getModalityForSign,
  formatZodiacPosition,
  getAllAspects,
  getTransitAspects
} from './chartUtils';

describe('Chart Utility Functions', () => {
  describe('calculateOrb', () => {
    test('calculates orb between two positions', () => {
      expect(calculateOrb(0, 10)).toBe(10);
      expect(calculateOrb(350, 10)).toBe(20);
      expect(calculateOrb(180, 0)).toBe(180);
      expect(calculateOrb(270, 90)).toBe(180);
    });

    test('always returns the shortest arc', () => {
      expect(calculateOrb(0, 190)).toBe(170); // Not 190
      expect(calculateOrb(10, 350)).toBe(20); // Not 340
    });
  });

  describe('isAspect', () => {
    test('returns true when positions form an aspect within orb', () => {
      expect(isAspect(0, 120, 120, 8)).toBe(true); // Exact trine
      expect(isAspect(0, 125, 120, 8)).toBe(true); // Trine with 5° orb
      expect(isAspect(0, 178, 180, 8)).toBe(true); // Opposition with 2° orb
    });

    test('returns false when positions do not form an aspect within orb', () => {
      expect(isAspect(0, 130, 120, 8)).toBe(false); // Trine with 10° orb
      expect(isAspect(0, 170, 180, 8)).toBe(false); // Opposition with 10° orb
    });
  });

  describe('getZodiacSignIndex', () => {
    test('returns correct zodiac sign index for longitude', () => {
      expect(getZodiacSignIndex(0)).toBe(0); // Aries
      expect(getZodiacSignIndex(45)).toBe(1); // Taurus
      expect(getZodiacSignIndex(90)).toBe(3); // Cancer
      expect(getZodiacSignIndex(359)).toBe(11); // Pisces
    });

    test('handles normalized longitudes', () => {
      expect(getZodiacSignIndex(360)).toBe(0); // Aries
      expect(getZodiacSignIndex(390)).toBe(1); // Taurus
      expect(getZodiacSignIndex(-30)).toBe(11); // Pisces
    });
  });

  describe('getDegreeInSign', () => {
    test('returns correct degree within sign', () => {
      expect(getDegreeInSign(0)).toBe(0); // 0° Aries
      expect(getDegreeInSign(31)).toBe(1); // 1° Taurus
      expect(getDegreeInSign(359)).toBe(29); // 29° Pisces
    });
  });

  describe('getHouseNumber', () => {
    const houses = [
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
    ];

    test('returns correct house for longitude', () => {
      expect(getHouseNumber(15, houses)).toBe(1);
      expect(getHouseNumber(45, houses)).toBe(2);
      expect(getHouseNumber(275, houses)).toBe(10);
    });

    test('handles house cusps that cross 0°', () => {
      const irregularHouses = [
        { house: 1, longitude: 350 },
        { house: 2, longitude: 20 },
        { house: 3, longitude: 50 }
      ];
      
      expect(getHouseNumber(355, irregularHouses)).toBe(1);
      expect(getHouseNumber(5, irregularHouses)).toBe(1);
      expect(getHouseNumber(30, irregularHouses)).toBe(2);
    });
  });

  describe('isRetrograde', () => {
    test('returns true for negative daily motion', () => {
      expect(isRetrograde(-0.5)).toBe(true);
      expect(isRetrograde(-1.2)).toBe(true);
    });

    test('returns false for positive daily motion', () => {
      expect(isRetrograde(0.5)).toBe(false);
      expect(isRetrograde(1.2)).toBe(false);
      expect(isRetrograde(0)).toBe(false);
    });
  });

  describe('calculateMidpoint', () => {
    test('calculates midpoint between two positions', () => {
      expect(calculateMidpoint(0, 10)).toBe(5);
      expect(calculateMidpoint(350, 10)).toBe(0);
      expect(calculateMidpoint(90, 270)).toBe(0);
    });

    test('handles positions that cross 0°', () => {
      expect(calculateMidpoint(350, 10)).toBe(0);
      expect(calculateMidpoint(10, 350)).toBe(0);
    });
  });

  describe('getElementForSign', () => {
    test('returns correct element for sign index', () => {
      expect(getElementForSign(0)).toBe('Fire'); // Aries
      expect(getElementForSign(1)).toBe('Earth'); // Taurus
      expect(getElementForSign(2)).toBe('Air'); // Gemini
      expect(getElementForSign(3)).toBe('Water'); // Cancer
      expect(getElementForSign(11)).toBe('Water'); // Pisces
    });
  });

  describe('getModalityForSign', () => {
    test('returns correct modality for sign index', () => {
      expect(getModalityForSign(0)).toBe('Cardinal'); // Aries
      expect(getModalityForSign(1)).toBe('Fixed'); // Taurus
      expect(getModalityForSign(2)).toBe('Mutable'); // Gemini
      expect(getModalityForSign(11)).toBe('Mutable'); // Pisces
    });
  });

  describe('formatZodiacPosition', () => {
    const zodiacSigns = [
      { name: 'Aries' },
      { name: 'Taurus' },
      { name: 'Gemini' },
      { name: 'Cancer' },
      { name: 'Leo' },
      { name: 'Virgo' },
      { name: 'Libra' },
      { name: 'Scorpio' },
      { name: 'Sagittarius' },
      { name: 'Capricorn' },
      { name: 'Aquarius' },
      { name: 'Pisces' }
    ];

    test('formats longitude as zodiac position', () => {
      expect(formatZodiacPosition(0, zodiacSigns)).toBe('0° Aries');
      expect(formatZodiacPosition(31, zodiacSigns)).toBe('1° Taurus');
      expect(formatZodiacPosition(359, zodiacSigns)).toBe('29° Pisces');
    });
  });

  describe('getAllAspects', () => {
    const planets = [
      { planet: 'sun', longitude: 0 },
      { planet: 'moon', longitude: 60 },
      { planet: 'mercury', longitude: 90 }
    ];

    const aspectTypes = [
      { name: 'Conjunction', angle: 0, orb: 8 },
      { name: 'Sextile', angle: 60, orb: 6 },
      { name: 'Square', angle: 90, orb: 8 }
    ];

    test('finds all aspects between planets', () => {
      const aspects = getAllAspects(planets, aspectTypes);
      
      // Should find a sextile between sun and moon
      expect(aspects.some(a => 
        a.planet1 === 'sun' && a.planet2 === 'moon' && a.aspect === 'sextile'
      )).toBe(true);
      
      // Should find a square between sun and mercury
      expect(aspects.some(a => 
        a.planet1 === 'sun' && a.planet2 === 'mercury' && a.aspect === 'square'
      )).toBe(true);
      
      // Should find a square between moon and mercury
      expect(aspects.some(a => 
        a.planet1 === 'moon' && a.planet2 === 'mercury' && a.aspect === 'square'
      )).toBe(true);
    });
  });

  describe('getTransitAspects', () => {
    const natalPlanets = [
      { planet: 'sun', longitude: 0 },
      { planet: 'moon', longitude: 60 }
    ];

    const transitPlanets = [
      { planet: 'sun', longitude: 180 },
      { planet: 'moon', longitude: 120 }
    ];

    const aspectTypes = [
      { name: 'Opposition', angle: 180, orb: 8 },
      { name: 'Trine', angle: 120, orb: 8 }
    ];

    test('finds aspects between transit and natal planets', () => {
      const aspects = getTransitAspects(transitPlanets, natalPlanets, aspectTypes);
      
      // Should find an opposition between transit sun and natal sun
      expect(aspects.some(a => 
        a.planet1 === 'sun' && a.planet2 === 'sun' && 
        a.aspect === 'opposition' && a.isTransitToNatal === true
      )).toBe(true);
      
      // Should find a trine between transit moon and natal sun
      expect(aspects.some(a => 
        a.planet1 === 'moon' && a.planet2 === 'sun' && 
        a.aspect === 'trine' && a.isTransitToNatal === true
      )).toBe(true);
    });

    test('also finds aspects between transit planets', () => {
      const aspects = getTransitAspects(transitPlanets, natalPlanets, aspectTypes);
      
      // Should find a trine between transit sun and transit moon
      expect(aspects.some(a => 
        ((a.planet1 === 'sun' && a.planet2 === 'moon') || 
         (a.planet1 === 'moon' && a.planet2 === 'sun')) && 
        a.aspect === 'trine' && a.isTransitToNatal === false
      )).toBe(true);
    });
  });
}); 