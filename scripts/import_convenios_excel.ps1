param(
  [string]$ExcelPath = 'C:\Users\sebas\Downloads\Consolidado_IDMA_CONVENIOS.xlsx',
  [ValidateSet('dry_run','replace_all')]
  [string]$Action = 'dry_run',
  [switch]$InvokeEndpoint,
  [string]$ServiceRoleKey = '',
  [string]$AccessToken = '',
  [string]$OutputDir = '.\scripts\output'
)

$ErrorActionPreference = 'Stop'

function Get-DotEnvValue {
  param([string]$Path,[string]$Key)
  if (-not (Test-Path $Path)) { return '' }
  $line = Get-Content -Path $Path | Where-Object { $_ -match "^$Key=" } | Select-Object -First 1
  if (-not $line) { return '' }
  $value = $line.Substring($Key.Length + 1).Trim()
  if ($value.StartsWith('"') -and $value.EndsWith('"')) {
    return $value.Substring(1, $value.Length - 2)
  }
  return $value
}

function Read-XmlEntry {
  param($Zip, [string]$FullName)
  $entry = $Zip.Entries | Where-Object { $_.FullName -eq $FullName }
  if (-not $entry) { return $null }
  $sr = New-Object System.IO.StreamReader($entry.Open())
  try { return [xml]$sr.ReadToEnd() } finally { $sr.Dispose() }
}

function Get-CellValue {
  param($Cell, $Ns, [string[]]$Shared)
  $t = $Cell.GetAttribute('t')
  if ($t -eq 'inlineStr') {
    $tn = $Cell.SelectSingleNode('x:is/x:t', $Ns)
    if ($tn) { return $tn.InnerText.Trim() }
    return ''
  }
  if ($t -eq 's') {
    $vn = $Cell.SelectSingleNode('x:v', $Ns)
    if ($vn) {
      $idx = [int]$vn.InnerText
      if ($idx -ge 0 -and $idx -lt $Shared.Count) { return ($Shared[$idx]).Trim() }
    }
    return ''
  }
  $v = $Cell.SelectSingleNode('x:v', $Ns)
  if ($v) { return $v.InnerText.Trim() }
  return ''
}

function Get-CellOrEmpty {
  param($Cells, [string]$Key)
  if ($Cells.ContainsKey($Key) -and $null -ne $Cells[$Key]) { return [string]$Cells[$Key] }
  return ''
}

function Normalize-Text {
  param([string]$Text)
  if ([string]::IsNullOrWhiteSpace($Text)) { return '' }
  return $Text.ToLowerInvariant()
}

function Map-Tipo {
  param([string]$TipoRaw)
  $t = Normalize-Text $TipoRaw
  if ($t -match 'pract') { return 'practica_profesional' }
  if ($t -match 'prosec') { return 'prosecucion_estudios' }
  if ($t -match 'cooper') { return 'cooperacion_tecnica' }
  if ($t -match 'beneficio') { return 'descuento_arancel' }
  return 'colaboracion_institucional'
}

function Map-Contraparte {
  param([string]$Nombre, [string]$Sistema)
  $n = Normalize-Text $Nombre
  $s = Normalize-Text $Sistema

  if ($n -match 'municipalidad') { return 'municipalidad' }
  if ($n -match 'universidad') { return 'ies_universidad' }
  if ($n -match 'instituto|\bcft\b|\bip\b|iplacex|ipg') { return 'ies_cft_ip' }
  if ($n -match 'fundacion') { return 'fundacion' }
  if ($n -match 'ong|corporacion') { return 'sociedad_civil_ong' }
  if ($n -match 'argentina|costa rica|peru|espana|internacional|erasmus') { return 'internacional' }
  if ($s -match 'publico') { return 'organismo_publico' }
  if ($s -match 'privado') { return 'empresa_privada' }
  return 'otro'
}

function Map-Estado {
  param([string]$EstadoFinal, [string]$Vigencia, [string]$Nivel, [string]$EstadoEnlace)
  $ef = Normalize-Text $EstadoFinal
  $vg = Normalize-Text $Vigencia
  $nv = Normalize-Text $Nivel
  $el = Normalize-Text $EstadoEnlace

  $isHistorical = ($ef -match 'historic') -or ($vg -match 'historic') -or ($nv -match 'referencial')
  if ($isHistorical) { return 'expirado' }

  $isLocalized = $el -match 'localizado'
  $isCurrentSignal = ($vg -match 'vigente|reciente|tramitacion') -or ($ef -match 'respaldo identificado|por revisar|borrador')
  if ($isLocalized -and $isCurrentSignal) { return 'activo' }

  if (($ef -match 'por revisar|revision|pendiente|borrador|gestion') -or ($vg -match 'tramitacion|por definir|validar') -or ($el -match 'pendiente localizar')) {
    return 'en_negociacion'
  }

  return 'suspendido'
}

function Parse-RowYear {
  param([string]$Raw)
  $value = ''
  if (-not [string]::IsNullOrWhiteSpace($Raw)) { $value = $Raw.Trim() }

  $result = [ordered]@{
    fecha_inicio = $null
    fecha_termino = $null
    beneficio_arancel_pct = $null
  }

  if (-not $value) { return [pscustomobject]$result }

  if ($value -match '^(19|20)\d{2}$') {
    $result.fecha_inicio = "${value}-01-01"
    return [pscustomobject]$result
  }

  if ($value -match '^(?<a>(19|20)\d{2})\s*-\s*(?<b>\d{2,4})$') {
    $startYear = $Matches['a']
    $endToken = $Matches['b']
    $endYear = $endToken
    if ($endToken.Length -eq 2) { $endYear = "$($startYear.Substring(0,2))$endToken" }

    if ($endYear -match '^(19|20)\d{2}$') {
      $result.fecha_inicio = "${startYear}-01-01"
      $result.fecha_termino = "${endYear}-12-31"
      return [pscustomobject]$result
    }
  }

  $norm = $value.Replace(',', '.')
  $n = 0.0
  if ([double]::TryParse($norm, [ref]$n)) {
    if ($n -gt 0 -and $n -le 1.0) {
      $result.beneficio_arancel_pct = [math]::Round($n * 100, 2)
      return [pscustomobject]$result
    }
    if ($n -gt 1 -and $n -le 100) {
      $result.beneficio_arancel_pct = [math]::Round($n, 2)
      return [pscustomobject]$result
    }
  }

  return [pscustomobject]$result
}

function Get-Criterios {
  param([string]$Tipo, [string]$Contraparte)
  $criteria = New-Object System.Collections.Generic.HashSet[string]
  switch ($Tipo) {
    'practica_profesional' { $null = $criteria.Add('C4'); $null = $criteria.Add('C13') }
    'prosecucion_estudios' { $null = $criteria.Add('C3'); $null = $criteria.Add('C5') }
    'cooperacion_tecnica' { $null = $criteria.Add('C13'); $null = $criteria.Add('C14') }
    'descuento_arancel' { $null = $criteria.Add('C7') }
    default { $null = $criteria.Add('C13'); $null = $criteria.Add('C14') }
  }
  if ($Contraparte -eq 'internacional') { $null = $criteria.Add('C16') }
  return @($criteria)
}

function Split-Carreras {
  param([string]$Value)
  $raw = ''
  if (-not [string]::IsNullOrWhiteSpace($Value)) { $raw = $Value.Trim() }
  if (-not $raw) { return $null }
  $parts = $raw -split '\s*\|\s*|\s*/\s*' | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' }
  if ($parts.Count -eq 0) { return $null }
  return @($parts)
}

$candidatePaths = @(
  $ExcelPath,
  'C:\Users\sebas\Downloads\Consolidado_IDMA_CONVENIOS.xlsx',
  'C:\Users\sebas\Downloads\Consolidado_IDMA_Compacto_Paso3_localizable_rapido.xlsx'
) | Select-Object -Unique

$resolvedExcelPath = $candidatePaths | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $resolvedExcelPath) {
  throw "Excel file not found. Checked: $($candidatePaths -join ', ')"
}
$ExcelPath = $resolvedExcelPath

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$envPath = Join-Path $repoRoot '.env'
$sbUrl = Get-DotEnvValue -Path $envPath -Key 'VITE_SUPABASE_URL'
$sbPublishable = Get-DotEnvValue -Path $envPath -Key 'VITE_SUPABASE_PUBLISHABLE_KEY'

if (-not $sbUrl) { throw "VITE_SUPABASE_URL missing in $envPath" }
if (-not $ServiceRoleKey) { $ServiceRoleKey = [System.Environment]::GetEnvironmentVariable('SUPABASE_SERVICE_ROLE_KEY') }

Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead($ExcelPath)

try {
  $sheetXml = Read-XmlEntry -Zip $zip -FullName 'xl/worksheets/sheet2.xml'
  $relsXml = Read-XmlEntry -Zip $zip -FullName 'xl/worksheets/_rels/sheet2.xml.rels'
  $sharedXml = Read-XmlEntry -Zip $zip -FullName 'xl/sharedStrings.xml'

  if (-not $sheetXml) { throw 'sheet2.xml not found in workbook' }

  $shared = @()
  if ($sharedXml) {
    foreach ($si in $sharedXml.sst.si) {
      if ($si.t) {
        $shared += [string]$si.t
      } elseif ($si.r) {
        $txt = ''
        foreach ($r in $si.r) { $txt += [string]$r.t }
        $shared += $txt
      } else {
        $shared += ''
      }
    }
  }

  $ns = New-Object System.Xml.XmlNamespaceManager($sheetXml.NameTable)
  $ns.AddNamespace('x', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main')

  $linkByRef = @{}
  if ($relsXml) {
    $nsr = New-Object System.Xml.XmlNamespaceManager($relsXml.NameTable)
    $nsr.AddNamespace('r', 'http://schemas.openxmlformats.org/package/2006/relationships')

    $targetById = @{}
    foreach ($rel in $relsXml.SelectNodes('//r:Relationship', $nsr)) {
      $targetById[$rel.Id] = $rel.Target
    }

    foreach ($hl in $sheetXml.SelectNodes('//x:hyperlinks/x:hyperlink', $ns)) {
      $rid = $hl.GetAttribute('id', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships')
      if ($targetById.ContainsKey($rid)) {
        $linkByRef[$hl.ref] = $targetById[$rid]
      }
    }
  }

  $rows = $sheetXml.SelectNodes('//x:sheetData/x:row[number(@r)>=5]', $ns)
  $records = @()

  foreach ($row in $rows) {
    $cells = @{}
    foreach ($cell in $row.SelectNodes('x:c', $ns)) {
      $col = ($cell.r -replace '\d', '')
      $cells[$col] = Get-CellValue -Cell $cell -Ns $ns -Shared $shared
    }

    $aVal = (Get-CellOrEmpty -Cells $cells -Key 'A').Trim()
    if (-not $aVal) { continue }

    $bVal = Get-CellOrEmpty -Cells $cells -Key 'B'
    $eVal = Get-CellOrEmpty -Cells $cells -Key 'E'
    $fVal = Get-CellOrEmpty -Cells $cells -Key 'F'
    $gVal = Get-CellOrEmpty -Cells $cells -Key 'G'
    $hVal = Get-CellOrEmpty -Cells $cells -Key 'H'
    $iVal = Get-CellOrEmpty -Cells $cells -Key 'I'
    $jVal = Get-CellOrEmpty -Cells $cells -Key 'J'
    $kVal = Get-CellOrEmpty -Cells $cells -Key 'K'
    $lVal = Get-CellOrEmpty -Cells $cells -Key 'L'
    $nVal = Get-CellOrEmpty -Cells $cells -Key 'N'

    $tipo = Map-Tipo -TipoRaw $bVal
    $contraparte = Map-Contraparte -Nombre $aVal -Sistema $eVal
    $estado = Map-Estado -EstadoFinal $iVal -Vigencia $jVal -Nivel $kVal -EstadoEnlace $nVal
    $yearInfo = Parse-RowYear -Raw $fVal

    $linkCell = "M$($row.r)"
    $driveUrl = $null
    if ($linkByRef.ContainsKey($linkCell)) { $driveUrl = $linkByRef[$linkCell] }

    $descParts = @()
    if ($bVal) { $descParts += "Tipo original: $bVal" }
    if ($cells.ContainsKey('C') -and $cells['C']) { $descParts += "Subtipo: $($cells['C'])" }
    if ($gVal) { $descParts += "Alcance: $gVal" }
    if ($hVal) { $descParts += "Carreras: $hVal" }
    $desc = $null
    if ($descParts.Count -gt 0) { $desc = ($descParts -join ' | ') }

    $observaciones = "import_orquesta_v1|estado_homologado_final=$iVal|vigencia_estim=$jVal|nivel_respaldo=$kVal|estado_enlace=$nVal"

    $paraCarrera = $null
    if ($gVal.Trim()) { $paraCarrera = $gVal.Trim() }

    $archivoNombre = $null
    if ($lVal.Trim()) { $archivoNombre = $lVal.Trim() }

    $rec = [ordered]@{
      nombre_institucion = $aVal
      tipo = $tipo
      contraparte = $contraparte
      estado = $estado
      fecha_inicio = $yearInfo.fecha_inicio
      fecha_termino = $yearInfo.fecha_termino
      descripcion = $desc
      carreras_habilitadas = Split-Carreras -Value $hVal
      beneficio_creditos = $null
      beneficio_arancel_pct = $yearInfo.beneficio_arancel_pct
      para_carrera = $paraCarrera
      cupos_anuales = $null
      persona_contacto = $null
      email_contacto = $null
      criterios_cna = Get-Criterios -Tipo $tipo -Contraparte $contraparte
      archivo_drive_url = $driveUrl
      archivo_nombre = $archivoNombre
      observaciones = $observaciones
    }

    $records += [pscustomobject]$rec
  }

  New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
  $payloadPath = Join-Path $OutputDir 'convenios_import_payload.json'
  $sqlPath = Join-Path $OutputDir 'convenios_replace_all.sql'

  $payload = [ordered]@{
    action = $Action
    source_file = [System.IO.Path]::GetFileName($ExcelPath)
    records = $records
  }

  $payloadJson = $payload | ConvertTo-Json -Depth 8
  Set-Content -Path $payloadPath -Value $payloadJson -Encoding utf8

  $escaped = ($records | ConvertTo-Json -Depth 8).Replace("'", "''")
  $sql = @"
-- Replace-all convenios using imported payload
SELECT public.replace_all_convenios(
  '$escaped'::jsonb,
  '$([System.IO.Path]::GetFileName($ExcelPath))',
  '{}'::jsonb
);
"@
  Set-Content -Path $sqlPath -Value $sql -Encoding utf8

  $localizados = ($records | Where-Object { $_.archivo_drive_url }).Count
  $pendientes = $records.Count - $localizados
  $historicos = ($records | Where-Object { $_.estado -eq 'expirado' }).Count

  Write-Host "Total registros mapeados: $($records.Count)"
  Write-Host "Links localizados: $localizados"
  Write-Host "Links pendientes: $pendientes"
  Write-Host "Historicos (expirado): $historicos"
  Write-Host "Payload JSON: $payloadPath"
  Write-Host "SQL fallback: $sqlPath"

  if (-not $InvokeEndpoint) {
    Write-Host "Invocacion remota omitida. Usa -InvokeEndpoint para llamar convenios-import."
    exit 0
  }

  $headers = @{ 'Content-Type' = 'application/json' }
  if ($ServiceRoleKey) {
    $headers['x-api-key'] = $ServiceRoleKey
  } elseif ($AccessToken) {
    $headers['Authorization'] = "Bearer $AccessToken"
    if ($sbPublishable) { $headers['apikey'] = $sbPublishable }
  } else {
    throw 'No auth provided. Pass -ServiceRoleKey or -AccessToken for endpoint invocation.'
  }

  $endpoint = "$sbUrl/functions/v1/convenios-import"
  Write-Host "Invoking: $endpoint ($Action)"

  $resp = Invoke-RestMethod -Method Post -Uri $endpoint -Headers $headers -Body $payloadJson
  $resp | ConvertTo-Json -Depth 8
} finally {
  $zip.Dispose()
}
