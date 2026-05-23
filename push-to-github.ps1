# PrepWise — push to GitHub
# 1. Create repo at https://github.com/new (name: PrepWise, no README)
# 2. Replace YOUR_USERNAME below, then run: .\push-to-github.ps1

param(
    [string]$GitHubUsername = "YOUR_USERNAME",
    [string]$RepoName = "PrepWise"
)

if ($GitHubUsername -eq "YOUR_USERNAME") {
    Write-Host "Edit this script or run:" -ForegroundColor Yellow
    Write-Host '  .\push-to-github.ps1 -GitHubUsername "your-github-username"' -ForegroundColor Cyan
    exit 1
}

$remoteUrl = "https://github.com/$GitHubUsername/$RepoName.git"

git remote remove origin 2>$null
git remote add origin $remoteUrl
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nSuccess! Repo: https://github.com/$GitHubUsername/$RepoName" -ForegroundColor Green
    Write-Host "Next: follow DEPLOYMENT.md to deploy on Render + Vercel" -ForegroundColor Green
}
