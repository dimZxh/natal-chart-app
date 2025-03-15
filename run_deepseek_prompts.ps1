# PowerShell script to run prompts with Ollama's Deepseek R1 model

Write-Host "Running accessibility improvement prompts..." -ForegroundColor Green
$prompt1 = Get-Content -Path .\prompt_1_accessibility.txt -Raw
$response1 = ollama run deepseek-r1 "$prompt1" 2>&1
$response1 | Out-File -FilePath .\response_1_accessibility.txt

Write-Host "Running performance optimization prompts..." -ForegroundColor Green
$prompt2 = Get-Content -Path .\prompt_2_performance.txt -Raw
$response2 = ollama run deepseek-r1 "$prompt2" 2>&1
$response2 | Out-File -FilePath .\response_2_performance.txt

Write-Host "Running advanced features prompts..." -ForegroundColor Green
$prompt3 = Get-Content -Path .\prompt_3_advanced_features.txt -Raw
$response3 = ollama run deepseek-r1 "$prompt3" 2>&1
$response3 | Out-File -FilePath .\response_3_advanced_features.txt

Write-Host "All prompts have been processed. Check the response files for Deepseek's suggestions." -ForegroundColor Green 