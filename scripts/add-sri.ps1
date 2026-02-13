# Downloads specified CDN script URLs from index.html, computes SHA-384 SRI hashes,
# and injects integrity and crossorigin attributes into the <script> tags.

$indexPath = "index.html"
if (-not (Test-Path $indexPath)) { Write-Error "index.html not found in current directory."; exit 1 }

$html = Get-Content $indexPath -Raw
# Use a simpler double-quoted regex to avoid embedded single-quote issues
$pattern = @'
<script\b[^>]*\bsrc=["'](?<url>[^"']+)["'][^>]*>\s*</script>
'@
$matches = [regex]::Matches($html, $pattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
if ($matches.Count -eq 0) { Write-Output "No external script tags found."; exit 0 }

foreach ($m in $matches) {
    $fullTag = $m.Value
    $url = $m.Groups['url'].Value
    if ($fullTag -match 'integrity=') { Write-Output "Skipping (already has integrity): $url"; continue }
    if ($url -notmatch 'cdn.tailwindcss.com' -and $url -notmatch 'cdn.jsdelivr.net' -and $url -notmatch 'jsdelivr.net') {
        Write-Output "Skipping (not targeted CDN): $url"; continue
    }

    Write-Output "Processing: $url"
    try {
        $wc = New-Object System.Net.WebClient
        $bytes = $wc.DownloadData($url)
        if (-not $bytes) { Write-Warning "Failed to download $url"; continue }

        $sha = [System.Security.Cryptography.SHA384]::Create().ComputeHash($bytes)
        $b64 = [Convert]::ToBase64String($sha)
        $integrity = "sha384-$b64"

        $openEnd = $fullTag.IndexOf('>')
        if ($openEnd -lt 0) { Write-Warning "Malformed script tag for $url"; continue }
        $insert = ' integrity="' + $integrity + '" crossorigin="anonymous"'
        $newTag = $fullTag.Insert($openEnd, $insert)

        $html = $html.Replace($fullTag, $newTag)
        Write-Output "Updated tag for $url"
    } catch {
        Write-Warning ("Error processing {0}: {1}" -f $url, $_)
    }
}

# Backup original
Copy-Item $indexPath "$indexPath.bak" -Force
Set-Content -Path $indexPath -Value $html -Encoding UTF8
Write-Output "index.html updated and backup saved to index.html.bak";
