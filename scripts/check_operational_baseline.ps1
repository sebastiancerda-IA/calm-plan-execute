param(
  [string]$SupabaseUrl = '',
  [string]$PublishableKey = '',
  [string]$ServiceRoleKey = '',
  [string]$UserJwt = '',
  [string]$ExpectedProjectId = 'wipeaufqdiohfdtcbhac',
  [string]$OutputPath = '.\scripts\output\operational_baseline_latest.json'
)

$ErrorActionPreference = 'Stop'

function Get-DotEnvValue {
  param([string]$Path, [string]$Key)
  if (-not (Test-Path $Path)) { return '' }
  $line = Get-Content -Path $Path | Where-Object { $_ -match "^$Key=" } | Select-Object -First 1
  if (-not $line) { return '' }
  $value = $line.Substring($Key.Length + 1).Trim()
  if ($value.StartsWith('"') -and $value.EndsWith('"')) {
    return $value.Substring(1, $value.Length - 2)
  }
  return $value
}

function Invoke-CurlJson {
  param(
    [string]$Url,
    [hashtable]$Headers
  )

  $headerArgs = @()
  foreach ($kv in $Headers.GetEnumerator()) {
    $headerArgs += @('-H', "$($kv.Key): $($kv.Value)")
  }

  $raw = & curl.exe -s $Url @headerArgs
  if ($LASTEXITCODE -ne 0) {
    throw "curl failed for $Url"
  }

  if ([string]::IsNullOrWhiteSpace($raw)) { return $null }
  return ($raw | ConvertFrom-Json)
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$envPath = Join-Path $repoRoot '.env'

if (-not $SupabaseUrl) {
  $SupabaseUrl = Get-DotEnvValue -Path $envPath -Key 'VITE_SUPABASE_URL'
}
if (-not $PublishableKey) {
  $PublishableKey = Get-DotEnvValue -Path $envPath -Key 'VITE_SUPABASE_PUBLISHABLE_KEY'
}
if (-not $ServiceRoleKey) {
  $ServiceRoleKey = [System.Environment]::GetEnvironmentVariable('SUPABASE_SERVICE_ROLE_KEY')
}

if (-not $SupabaseUrl) { throw "Missing Supabase URL. Set VITE_SUPABASE_URL in $envPath or pass -SupabaseUrl." }
if (-not $PublishableKey) { throw "Missing publishable key. Set VITE_SUPABASE_PUBLISHABLE_KEY in $envPath or pass -PublishableKey." }
if (-not $ServiceRoleKey) { throw "Missing service role key. Pass -ServiceRoleKey or set SUPABASE_SERVICE_ROLE_KEY env var." }

$projectId = ($SupabaseUrl -replace '^https://', '').Split('.')[0]
$projectMatches = $projectId -eq $ExpectedProjectId

$serverHeaders = @{
  apikey = $ServiceRoleKey
  'User-Agent' = 'idma-operational-check/1.0'
}

$convenios = Invoke-CurlJson -Url "$SupabaseUrl/rest/v1/convenios?select=id,archivo_drive_url" -Headers $serverHeaders
$profiles = Invoke-CurlJson -Url "$SupabaseUrl/rest/v1/profiles?select=id,email,display_name" -Headers $serverHeaders
$roles = Invoke-CurlJson -Url "$SupabaseUrl/rest/v1/user_roles?select=user_id,role" -Headers $serverHeaders

$convenioRows = @($convenios)
$totalRows = $convenioRows.Count
$linksLocalizados = @($convenioRows | Where-Object { -not [string]::IsNullOrWhiteSpace($_.archivo_drive_url) }).Count
$linksPendientes = $totalRows - $linksLocalizados

$anonProbeType = 'unknown'
$anonProbeCount = 0
$anonRaw = & curl.exe -s "$SupabaseUrl/rest/v1/convenios?select=id&limit=5" -H "apikey: $PublishableKey"
if ([string]::IsNullOrWhiteSpace($anonRaw)) {
  $anonProbeType = 'empty-response'
} else {
  $anonParsed = $anonRaw | ConvertFrom-Json
  if ($anonRaw.Trim() -eq '[]') {
    $anonProbeType = 'rows'
    $anonProbeCount = 0
  } elseif ($anonParsed -is [System.Array]) {
    $anonProbeType = 'rows'
    $anonProbeCount = @($anonParsed).Count
  } else {
    $anonProbeType = 'error-object'
    $anonProbeCount = 0
  }
}

$jwtProbeType = 'not_run'
$jwtProbeCount = 0
if (-not [string]::IsNullOrWhiteSpace($UserJwt)) {
  $jwtRaw = & curl.exe -s "$SupabaseUrl/rest/v1/convenios?select=id&limit=5" -H "apikey: $PublishableKey" -H "Authorization: Bearer $UserJwt"
  if ([string]::IsNullOrWhiteSpace($jwtRaw)) {
    $jwtProbeType = 'empty-response'
  } else {
    $jwtParsed = $jwtRaw | ConvertFrom-Json
    if ($jwtRaw.Trim() -eq '[]') {
      $jwtProbeType = 'rows'
      $jwtProbeCount = 0
    } elseif ($jwtParsed -is [System.Array]) {
      $jwtProbeType = 'rows'
      $jwtProbeCount = @($jwtParsed).Count
    } else {
      $jwtProbeType = 'error-object'
    }
  }
}

$acceptance = [ordered]@{
  final_rows_expected = 196
  links_localizados_expected = 26
  links_pendientes_expected = 170
  final_rows_ok = ($totalRows -eq 196)
  links_localizados_ok = ($linksLocalizados -eq 26)
  links_pendientes_ok = ($linksPendientes -eq 170)
}

$report = [ordered]@{
  timestamp = (Get-Date).ToString('s')
  expected_project_id = $ExpectedProjectId
  active_project_id = $projectId
  project_match = $projectMatches
  backend = [ordered]@{
    convenios_rows = $totalRows
    links_localizados = $linksLocalizados
    links_pendientes = $linksPendientes
    profiles_count = @($profiles).Count
    user_roles_count = @($roles).Count
  }
  frontend_visibility = [ordered]@{
    publishable_without_session_type = $anonProbeType
    publishable_without_session_count = $anonProbeCount
    publishable_with_jwt_type = $jwtProbeType
    publishable_with_jwt_count = $jwtProbeCount
  }
  acceptance = $acceptance
}

$absOutput = if ([System.IO.Path]::IsPathRooted($OutputPath)) {
  $OutputPath
} else {
  Join-Path $repoRoot $OutputPath
}

New-Item -ItemType Directory -Path (Split-Path $absOutput -Parent) -Force | Out-Null
$report | ConvertTo-Json -Depth 8 | Set-Content -Path $absOutput -Encoding UTF8

Write-Host "Operational baseline check completed."
Write-Host "Project: $projectId (expected: $ExpectedProjectId)"
Write-Host "Convenios: $totalRows | Links localizados: $linksLocalizados | Pendientes: $linksPendientes"
Write-Host "Profiles: $(@($profiles).Count) | Roles: $(@($roles).Count)"
Write-Host "Publishable sin sesion: $anonProbeType ($anonProbeCount)"
Write-Host "Publishable con JWT: $jwtProbeType ($jwtProbeCount)"
Write-Host "Report: $absOutput"
