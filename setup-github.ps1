# GitHub Repository Setup Script
# This script helps you create and push to a new GitHub repository

Write-Host "=== GitHub Repository Setup ===" -ForegroundColor Cyan
Write-Host ""

# Get repository name
$repoName = Read-Host "Enter repository name (default: stitch-sagespace)"
if ([string]::IsNullOrWhiteSpace($repoName)) {
    $repoName = "stitch-sagespace"
    Write-Host "Using default: $repoName" -ForegroundColor Yellow
}

# Get GitHub username
$username = Read-Host "Enter your GitHub username"
if ([string]::IsNullOrWhiteSpace($username)) {
    Write-Host "Error: GitHub username is required" -ForegroundColor Red
    exit 1
}

# Repository URL
$repoUrl = "https://github.com/$username/$repoName.git"

Write-Host ""
Write-Host "Repository will be created at: $repoUrl" -ForegroundColor Green
Write-Host ""

# Check if remote already exists
try {
    $existingRemote = git remote get-url origin 2>$null
    if ($existingRemote) {
        Write-Host "Remote 'origin' already exists: $existingRemote" -ForegroundColor Yellow
        $replace = Read-Host "Replace it? (y/n)"
        if ($replace -eq 'y' -or $replace -eq 'Y') {
            git remote remove origin
        } else {
            Write-Host "Keeping existing remote. Exiting." -ForegroundColor Yellow
            exit 0
        }
    }
} catch {
    # Remote doesn't exist, continue
}

# Add remote
Write-Host "Adding remote repository..." -ForegroundColor Cyan
git remote add origin $repoUrl

if ($LASTEXITCODE -eq 0) {
    Write-Host "Remote added successfully" -ForegroundColor Green
} else {
    Write-Host "Failed to add remote" -ForegroundColor Red
    exit 1
}

# Show current branch
$currentBranch = git branch --show-current
Write-Host "Current branch: $currentBranch" -ForegroundColor Cyan

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Create the repository on GitHub:" -ForegroundColor Yellow
Write-Host "   Go to: https://github.com/new" -ForegroundColor White
Write-Host "   Repository name: $repoName" -ForegroundColor White
Write-Host "   Description: AI-powered platform for work, play, and creation" -ForegroundColor White
Write-Host "   Choose: Public or Private" -ForegroundColor White
Write-Host "   DO NOT check 'Add a README file' (we already have one)" -ForegroundColor White
Write-Host "   Click 'Create repository'" -ForegroundColor White
Write-Host ""
Write-Host "2. After creating, run this command to push:" -ForegroundColor Yellow
Write-Host "   git push -u origin $currentBranch" -ForegroundColor White
Write-Host ""
Write-Host "3. If prompted for credentials:" -ForegroundColor Yellow
Write-Host "   Username: $username" -ForegroundColor White
Write-Host "   Password: Use a Personal Access Token (not your password)" -ForegroundColor White
Write-Host "   Create token at: https://github.com/settings/tokens" -ForegroundColor White
Write-Host ""

$ready = Read-Host "Have you created the repository on GitHub? (y/n)"
if ($ready -eq 'y' -or $ready -eq 'Y') {
    Write-Host ""
    Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
    git push -u origin $currentBranch
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Successfully pushed to GitHub!" -ForegroundColor Green
        Write-Host "View your repository at: https://github.com/$username/$repoName" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "Push failed. Please check:" -ForegroundColor Red
        Write-Host "  - Repository exists on GitHub" -ForegroundColor Yellow
        Write-Host "  - You have push permissions" -ForegroundColor Yellow
        Write-Host "  - Authentication credentials are correct" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "Please create the repository on GitHub first, then run:" -ForegroundColor Yellow
    Write-Host "  git push -u origin $currentBranch" -ForegroundColor White
}
