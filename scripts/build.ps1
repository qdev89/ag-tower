# AG Tower Build Script
# Builds MSI + NSIS installers for Windows
# Requires: Rust toolchain (rustup.rs)

$ErrorActionPreference = "Stop"

Write-Host "`n🗼 AG Tower Build Pipeline" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor DarkGray

# Step 1: Check prerequisites
Write-Host "`n[1/5] Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Host "❌ Node.js not found. Install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ Node.js $(node --version)" -ForegroundColor Green

# Check Rust
$cargo = Get-Command cargo -ErrorAction SilentlyContinue
if (-not $cargo) {
    Write-Host "  ❌ Rust/cargo not found." -ForegroundColor Red
    Write-Host ""
    Write-Host "  To install Rust:" -ForegroundColor Yellow
    Write-Host "    1. Visit https://rustup.rs/" -ForegroundColor White
    Write-Host "    2. Download and run rustup-init.exe" -ForegroundColor White
    Write-Host "    3. Restart your terminal" -ForegroundColor White
    Write-Host "    4. Run this script again" -ForegroundColor White
    Write-Host ""
    $install = Read-Host "  Install Rust now? (y/n)"
    if ($install -eq 'y') {
        Write-Host "  ⬇️ Downloading rustup-init.exe..." -ForegroundColor Cyan
        Invoke-WebRequest -Uri "https://win.rustup.rs/x86_64" -OutFile "$env:TEMP\rustup-init.exe"
        & "$env:TEMP\rustup-init.exe" -y
        $env:Path = "$env:USERPROFILE\.cargo\bin;" + $env:Path
        Write-Host "  ✅ Rust installed. Refreshing PATH..." -ForegroundColor Green
    } else {
        exit 1
    }
}
$rustVersion = (rustc --version 2>&1) -replace 'rustc ', ''
Write-Host "  ✅ Rust $rustVersion" -ForegroundColor Green

# Step 2: Install dependencies
Write-Host "`n[2/5] Installing dependencies..." -ForegroundColor Yellow
npm install --silent
Write-Host "  ✅ npm packages installed" -ForegroundColor Green

# Step 3: TypeScript check
Write-Host "`n[3/5] Type checking..." -ForegroundColor Yellow
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ TypeScript errors found. Fix before building." -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ Zero TypeScript errors" -ForegroundColor Green

# Step 4: Build frontend
Write-Host "`n[4/5] Building frontend..." -ForegroundColor Yellow
npm run build
Write-Host "  ✅ Frontend built" -ForegroundColor Green

# Step 5: Build Tauri installer
Write-Host "`n[5/5] Building Tauri installer..." -ForegroundColor Yellow
Write-Host "  ⏳ This may take a few minutes on first run (compiling Rust)..." -ForegroundColor DarkGray
npx tauri build

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n" -NoNewline
    Write-Host "===========================================" -ForegroundColor Green
    Write-Host "  ✅ BUILD SUCCESS" -ForegroundColor Green
    Write-Host "===========================================" -ForegroundColor Green
    
    $bundleDir = "src-tauri\target\release\bundle"
    
    # Check for MSI
    $msi = Get-ChildItem "$bundleDir\msi\*.msi" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($msi) {
        $sizeMB = [math]::Round($msi.Length / 1MB, 1)
        Write-Host "  📦 MSI:  $($msi.Name) ($sizeMB MB)" -ForegroundColor Cyan
    }
    
    # Check for NSIS
    $nsis = Get-ChildItem "$bundleDir\nsis\*.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($nsis) {
        $sizeMB = [math]::Round($nsis.Length / 1MB, 1)
        Write-Host "  📦 NSIS: $($nsis.Name) ($sizeMB MB)" -ForegroundColor Cyan
    }
    
    Write-Host "`n  Output: $bundleDir\" -ForegroundColor DarkGray
    Write-Host ""
} else {
    Write-Host "`n  ❌ Build failed. Check errors above." -ForegroundColor Red
    exit 1
}
