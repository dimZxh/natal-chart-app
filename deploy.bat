@echo off
echo This script will help deploy your Natal Chart App to GitHub and Vercel
echo.
echo First, create a GitHub repository:
echo 1. Go to https://github.com/new
echo 2. Name: natal-chart-app
echo 3. Description: An interactive web application for generating and exploring natal charts
echo 4. Choose visibility (public or private)
echo 5. Click "Create repository"
echo.
echo Press any key when you've created the repository...
pause > nul

echo.
echo Now, let's push your code to GitHub...
echo.

git remote set-url origin https://github.com/dimzxh/natal-chart-app.git
git push -u origin main

echo.
echo If you're prompted for credentials, enter your GitHub username and password/token.
echo.
echo After pushing your code, deploy to Vercel:
echo 1. Go to https://vercel.com
echo 2. Sign up or sign in (you can use your GitHub account)
echo 3. Click "Add New..." and select "Project"
echo 4. Find and select your "natal-chart-app" repository
echo 5. Configure your project (most settings should be auto-detected)
echo 6. Click "Deploy"
echo.
echo Press any key to exit...
pause > nul

echo Building the application...
call npm run build

if %ERRORLEVEL% neq 0 (
  echo Build failed. Aborting deployment.
  exit /b 1
)

echo Checking for Vercel CLI...
where vercel >nul 2>&1
if %ERRORLEVEL% neq 0 (
  echo Installing Vercel CLI...
  call npm install -g vercel
)

echo Deploying to Vercel...
call vercel --prod

echo Deployment complete! 