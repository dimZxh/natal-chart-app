# Let's apply some performance improvements based on React best practices

# 1. Optimize the NatalChart component with useMemo and useCallback
Write-Host "1. Optimizing NatalChart with useMemo and useCallback..." -ForegroundColor Green
$natalChartPath = ".\src\components\Chart\NatalChart.js"
$natalChart = Get-Content -Path $natalChartPath -Raw

# Memoize expensive calculations in the NatalChart component
$improvedNatalChart = $natalChart

# Add useMemo for transform calculation
$transformCalculation = "  // Calculate transform for zoom and pan
  const transform = `scale(\${zoomLevel}) translate(\${(chartCenter.x - baseChartCenter) / zoomLevel}px, \${(chartCenter.y - baseChartCenter) / zoomLevel}px)`;"

$memoizedTransformCalculation = "  // Memoize transform calculation to prevent recalculation on every render
  const transform = React.useMemo(() => {
    return `scale(${zoomLevel}) translate(${(chartCenter.x - baseChartCenter) / zoomLevel}px, ${(chartCenter.y - baseChartCenter) / zoomLevel}px)`;
  }, [zoomLevel, chartCenter.x, chartCenter.y, baseChartCenter]);"

$improvedNatalChart = $improvedNatalChart -replace [regex]::Escape($transformCalculation), $memoizedTransformCalculation

# Memoize event handlers with useCallback
$improvedNatalChart = $improvedNatalChart -replace "const handlePlanetClick = \(planet\) => {", "const handlePlanetClick = React.useCallback((planet) => {"
$improvedNatalChart = $improvedNatalChart -replace "  };", "  }, [selectedPlanet]);"

$improvedNatalChart = $improvedNatalChart -replace "const handleZoomIn = \(\) => {", "const handleZoomIn = React.useCallback(() => {"
$improvedNatalChart = $improvedNatalChart -replace "const handleZoomOut = \(\) => {", "const handleZoomOut = React.useCallback(() => {"
$improvedNatalChart = $improvedNatalChart -replace "const resetView = \(\) => {", "const resetView = React.useCallback(() => {"

# Write the improved component back to the file
$improvedNatalChart | Set-Content -Path $natalChartPath

# 2. Optimize EnhancedDatePicker component
Write-Host "2. Optimizing EnhancedDatePicker component..." -ForegroundColor Green
$datePickerPath = ".\src\components\Form\EnhancedDatePicker.js"
$datePicker = Get-Content -Path $datePickerPath -Raw

# Memoize date format function
$improvedDatePicker = $datePicker -replace "const getAriaLabel = \(\) => {", "const getAriaLabel = React.useCallback(() => {"
$improvedDatePicker = $improvedDatePicker -replace "  };", "  }, [selectedDate, showTimeSelect]);"

# Write the improved component back to the file
$improvedDatePicker | Set-Content -Path $datePickerPath

# 3. Optimize PlanetMark component by memoizing it
Write-Host "3. Memoizing PlanetMark component to prevent unnecessary re-renders..." -ForegroundColor Green
$planetMarkPath = ".\src\components\Chart\PlanetMark.js"
$planetMark = Get-Content -Path $planetMarkPath -Raw

# Add memo to the component export
if ($planetMark -match "export default PlanetMark") {
  $improvedPlanetMark = $planetMark -replace "export default PlanetMark", "export default React.memo(PlanetMark)"
  $improvedPlanetMark | Set-Content -Path $planetMarkPath
}

Write-Host "All performance improvements have been applied!" -ForegroundColor Green 