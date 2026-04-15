param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$Args
)

if (-not $Args -or $Args.Count -eq 0) {
  Write-Host "Uso: ./scripts/defuddle.ps1 parse <url> --md" -ForegroundColor Yellow
  exit 1
}

$cmd = Get-Command defuddle -ErrorAction SilentlyContinue
if ($cmd) {
  & $cmd.Source @Args
  exit $LASTEXITCODE
}

$globalCmd = Join-Path $env:APPDATA 'npm\defuddle.cmd'
if (Test-Path $globalCmd) {
  try {
    & $globalCmd @Args
    exit $LASTEXITCODE
  } catch {
    # Fall through to npm exec when global bin is not accessible in sandboxed environments.
  }
}

npm exec --yes defuddle -- @Args
exit $LASTEXITCODE
