# Let's add some advanced features to the natal chart application

# 1. Create a ChartSettings component for customization
Write-Host "1. Creating ChartSettings component for customization..." -ForegroundColor Green
$chartSettingsPath = ".\src\components\Chart\ChartSettings.js"

# Create the ChartSettings component content
$chartSettingsContent = @"
import React from 'react';
import { useChartContext } from '../../context/ChartContext';
import Button from '../UI/Button';

/**
 * ChartSettings component for customizing chart display options
 */
const ChartSettings = () => {
  const { chartSettings, updateChartSettings } = useChartContext();
  
  const toggleSetting = (setting) => {
    updateChartSettings({
      ...chartSettings,
      [setting]: !chartSettings[setting]
    });
  };
  
  const changeHouseSystem = (system) => {
    updateChartSettings({
      ...chartSettings,
      houseSystem: system
    });
  };
  
  return (
    <div className="chart-settings">
      <h3>Chart Settings</h3>
      
      <div className="settings-group">
        <h4>Display Options</h4>
        <div className="setting-toggles">
          <Button 
            variant={chartSettings.showAspects ? "primary" : "outline"}
            size="small"
            onClick={() => toggleSetting('showAspects')}
          >
            {chartSettings.showAspects ? 'Hide Aspects' : 'Show Aspects'}
          </Button>
          
          <Button 
            variant={chartSettings.showHouses ? "primary" : "outline"}
            size="small"
            onClick={() => toggleSetting('showHouses')}
          >
            {chartSettings.showHouses ? 'Hide Houses' : 'Show Houses'}
          </Button>
          
          <Button 
            variant={chartSettings.showDegrees ? "primary" : "outline"}
            size="small"
            onClick={() => toggleSetting('showDegrees')}
          >
            {chartSettings.showDegrees ? 'Hide Degrees' : 'Show Degrees'}
          </Button>
        </div>
      </div>
      
      <div className="settings-group">
        <h4>House System</h4>
        <div className="house-system-select">
          {['Placidus', 'Koch', 'Whole Sign', 'Equal'].map(system => (
            <Button 
              key={system}
              variant={chartSettings.houseSystem === system ? "primary" : "outline"}
              size="small"
              onClick={() => changeHouseSystem(system)}
            >
              {system}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="settings-group">
        <h4>Zodiac Type</h4>
        <div className="zodiac-type-select">
          <Button 
            variant={chartSettings.zodiacType === 'Tropical' ? "primary" : "outline"}
            size="small"
            onClick={() => updateChartSettings({...chartSettings, zodiacType: 'Tropical'})}
          >
            Tropical
          </Button>
          
          <Button 
            variant={chartSettings.zodiacType === 'Sidereal' ? "primary" : "outline"}
            size="small"
            onClick={() => updateChartSettings({...chartSettings, zodiacType: 'Sidereal'})}
          >
            Sidereal
          </Button>
        </div>
      </div>
      
      <style jsx>{`
        .chart-settings {
          margin: 1.5rem 0;
          padding: 1rem;
          background-color: var(--color-bg-light);
          border-radius: var(--border-radius-md);
          border: 1px solid var(--color-border);
        }
        
        .chart-settings h3 {
          margin-top: 0;
          margin-bottom: 1rem;
          color: var(--color-primary);
          font-size: 1.2rem;
        }
        
        .settings-group {
          margin-bottom: 1.5rem;
        }
        
        .settings-group h4 {
          margin-top: 0;
          margin-bottom: 0.75rem;
          font-size: 1rem;
          color: var(--color-text);
        }
        
        .setting-toggles,
        .house-system-select,
        .zodiac-type-select {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        @media (max-width: 768px) {
          .chart-settings {
            padding: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ChartSettings;
"@

# Write the component to the file
$chartSettingsContent | Set-Content -Path $chartSettingsPath

# 2. Update ChartContext to support the chart settings
Write-Host "2. Updating ChartContext to support chart settings..." -ForegroundColor Green
$contextPath = ".\src\context\ChartContext.js"
$context = Get-Content -Path $contextPath -Raw

# Add chartSettings state to the context
$contextWithSettings = $context -replace "const \[chartData, setChartData\] = useState\(null\);", @"
const [chartData, setChartData] = useState(null);
  const [chartSettings, setChartSettings] = useState({
    showAspects: true,
    showHouses: true,
    showDegrees: true,
    houseSystem: 'Placidus',
    zodiacType: 'Tropical'
  });
"@

# Add updateChartSettings function
$contextWithUpdateFunction = $contextWithSettings -replace "const saveProfile = \(profile\) => {", @"
const updateChartSettings = (newSettings) => {
    setChartSettings(newSettings);
  };

  const saveProfile = (profile) => {
"@

# Add chartSettings to the context value
$updatedContext = $contextWithUpdateFunction -replace "value={{ birthData, setBirthData, chartData, isLoading, error, saveProfile, savedProfiles }}", "value={{ birthData, setBirthData, chartData, isLoading, error, saveProfile, savedProfiles, chartSettings, updateChartSettings }}"

# Write the updated context to the file
$updatedContext | Set-Content -Path $contextPath

# 3. Update NatalChart to use the ChartSettings component
Write-Host "3. Updating NatalChart to use ChartSettings component..." -ForegroundColor Green
$natalChartPath = ".\src\components\Chart\NatalChart.js"
$natalChart = Get-Content -Path $natalChartPath -Raw

# Import ChartSettings
$natalChartWithImport = $natalChart -replace "import AspectLines from './AspectLines';", "import AspectLines from './AspectLines';\nimport ChartSettings from './ChartSettings';"

# Update context consumption
$natalChartWithContextUpdate = $natalChartWithImport -replace "const { birthData, chartData, isLoading, error } = useChartContext\(\);", "const { birthData, chartData, isLoading, error, chartSettings } = useChartContext();"

# Add ChartSettings component after chart heading
$chartHeadingPattern = "</div>\s*<div class=\"chart-controls\">"
$chartHeadingReplacement = "</div>\n\n      <ChartSettings />\n      \n      <div class=\"chart-controls\">"
$updatedNatalChart = $natalChartWithContextUpdate -replace $chartHeadingPattern, $chartHeadingReplacement

# Use chartSettings to control visibility
$aspectPattern = "aspectDisplayActive && aspects"
$aspectReplacement = "chartSettings.showAspects && aspects"
$updatedNatalChart = $updatedNatalChart -replace $aspectPattern, $aspectReplacement

# Write the updated NatalChart to the file
$updatedNatalChart | Set-Content -Path $natalChartPath

Write-Host "All advanced features have been added!" -ForegroundColor Green 