param(
    [string]$ProjectPath = "c:\Users\holy1\OneDrive\Desktop\New folder\online-student-grievance-system"
)

function d ($name) {
    return
}

Write-Host "Project path: $ProjectPath"

if (-not (Check-Command node)) {
    Write-Host "Node.js is not installed or not in PATH. Please install Node.js (LTS) from https://nodejs.org/ and re-run this script." -ForegroundColor Red
    exit 1
}

if (-not (Check-Command npm)) {
    Write-Host "npm is not available. Ensure Node.js installation added npm to PATH." -ForegroundColor Red
    exit 1
}

# Ensure project folder exists
if (-not (Test-Path $ProjectPath)) {
    Write-Host "Project path does not exist: $ProjectPath" -ForegroundColor Red
    exit 1
}

Set-Location $ProjectPath

Write-Host "Installing npm dependencies..."
npm install

# Create .env.local from example if missing
if (Test-Path .env.example -and -not (Test-Path .env.local)) {
    Copy-Item .env.example .env.local
    Write-Host "Created .env.local from .env.example — please review and update values if needed."
}

# Start Firebase emulators in a new PowerShell window using npx (no global install required)
$escapedPath = $ProjectPath -replace "'", "''"
$emulatorCmd = "cd '$escapedPath'; npx firebase emulators:start"
Write-Host "Starting Firebase emulators in a new window..."
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", $emulatorCmd

# Start Next.js dev server in a new PowerShell window
$devCmd = "cd '$escapedPath'; npm run dev"
Write-Host "Starting Next.js dev server in a new window..."
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", $devCmd

Start-Sleep -Seconds 2

# Open browser
try {
    Start-Process "http://localhost:3000"
} catch {
    Write-Host "Open http://localhost:3000 manually in your browser." -ForegroundColor Yellow
}

Write-Host "Automation script launched emulators and dev server in separate windows. Check the emulator UI at http://localhost:4000 if configured." -ForegroundColor Green
