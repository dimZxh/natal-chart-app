# Let's apply some accessibility improvements directly based on best practices

# 1. Enhance the LoadingSpinner component
Write-Host "1. Enhancing LoadingSpinner component with better accessibility..." -ForegroundColor Green
$loadingSpinnerPath = ".\src\components\UI\LoadingSpinner.js"
$loadingSpinner = Get-Content -Path $loadingSpinnerPath -Raw

# Update LoadingSpinner component with ARIA attributes
$improvedLoadingSpinner = $loadingSpinner -replace '<div className="loading-spinner-container">', '<div className="loading-spinner-container" role="alert" aria-busy="true" aria-label={message}>'

# Write the improved component back to the file
$improvedLoadingSpinner | Set-Content -Path $loadingSpinnerPath

# 2. Enhance the Button component
Write-Host "2. Enhancing Button component with better keyboard accessibility..." -ForegroundColor Green
$buttonPath = ".\src\components\UI\Button.js"
$button = Get-Content -Path $buttonPath -Raw

# Update Button component with improved keyboard handling
$improvedButton = $button -replace 'aria-label={ariaLabel}', 'aria-label={ariaLabel} tabIndex={tabIndex || 0}'

# Write the improved component back to the file
$improvedButton | Set-Content -Path $buttonPath

# 3. Enhance the NatalChart for keyboard navigation
Write-Host "3. Enhancing NatalChart component for better keyboard navigation..." -ForegroundColor Green
$natalChartPath = ".\src\components\Chart\NatalChart.js"
$natalChart = Get-Content -Path $natalChartPath -Raw

# Update chart controls with tabIndex and keyboard event handlers
$improvedNatalChart = $natalChart -replace 'aria-label="Zoom in"', 'aria-label="Zoom in" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && handleZoomIn()}'
$improvedNatalChart = $improvedNatalChart -replace 'aria-label="Zoom out"', 'aria-label="Zoom out" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && handleZoomOut()}'
$improvedNatalChart = $improvedNatalChart -replace 'aria-label="Reset view"', 'aria-label="Reset view" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && handleResetView()}'

# Write the improved component back to the file
$improvedNatalChart | Set-Content -Path $natalChartPath

Write-Host "All accessibility improvements have been applied!" -ForegroundColor Green 