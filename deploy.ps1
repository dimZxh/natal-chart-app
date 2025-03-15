# Create GitHub repository and push code
$token = Read-Host -Prompt "Enter your GitHub Personal Access Token" -AsSecureString
$bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($token)
$plainToken = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)

# Set remote URL with token
$remoteUrl = "https://dimzxh:$plainToken@github.com/dimzxh/natal-chart-app.git"
git remote set-url origin $remoteUrl

# Push to GitHub
git push -u origin main

Write-Host "Code pushed to GitHub. Now go to Vercel to deploy:"
Write-Host "1. Go to https://vercel.com"
Write-Host "2. Sign up or sign in (you can use your GitHub account)"
Write-Host "3. Click 'Add New...' and select 'Project'"
Write-Host "4. Find and select your 'natal-chart-app' repository"
Write-Host "5. Configure your project (most settings should be auto-detected)"
Write-Host "6. Click 'Deploy'" 