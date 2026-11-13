# Strictly synthetic QA in a disposable Postgres 16 container with networking disabled.
# Never connects to real Supabase and never reads .env or application/customer records.
$ErrorActionPreference = 'Stop'
$name = 'vonix-affiliates-c26-social-qa'
$existing = @(docker ps -a --format '{{.Names}}')
if ($LASTEXITCODE -ne 0) { throw 'Cannot inspect Docker containers safely.' }
if ($existing -contains $name) { throw "QA container $name already exists; refusing to reuse it." }
$started = $false
try {
  docker run --rm -d --name $name --network none -e POSTGRES_PASSWORD=synthetic-only -e POSTGRES_DB=vonix_affiliates_qa postgres:16 | Out-Null
  if ($LASTEXITCODE -ne 0) { throw 'Could not start isolated PostgreSQL.' }
  $started = $true
  $ready = $false
  for ($i=0; $i -lt 45; $i++) {
    $probe = 'docker exec ' + $name + ' psql -X -v ON_ERROR_STOP=1 -U postgres -d vonix_affiliates_qa -Atc "SELECT 1" >NUL 2>NUL'
    cmd.exe /c $probe | Out-Null
    if ($LASTEXITCODE -eq 0) { $ready = $true; break }
    Start-Sleep -Milliseconds 750
  }
  if (-not $ready) { throw 'Isolated PostgreSQL not ready.' }
  docker exec $name psql -X -v ON_ERROR_STOP=1 -U postgres -d vonix_affiliates_qa -c 'CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN; CREATE ROLE service_role NOLOGIN BYPASSRLS;'
  if ($LASTEXITCODE -ne 0) { throw 'Cannot create synthetic QA roles.' }
  $files = @(
    'vonix-affiliate-applications.sql',
    'vonix-affiliate-auth-qa-scaffold.sql',
    'vonix-affiliate-portal-status.sql',
    'vonix-affiliate-simple-form-20261110.sql',
    'vonix-affiliate-reapply-reasons-20261111.sql',
    'vonix-affiliate-admin-social-search-20261113.sql',
    'vonix-affiliate-admin-social-search-qa-20261113.sql'
  )
  foreach ($file in $files) {
    docker cp ('supabase/' + $file) ($name + ':/tmp/' + $file)
    if ($LASTEXITCODE -ne 0) { throw ('Cannot copy synthetic QA file: ' + $file) }
  }
  foreach ($file in $files) {
    Write-Output ('QA_SQL_FILE=' + $file)
    docker exec $name psql -X -v ON_ERROR_STOP=1 -U postgres -d vonix_affiliates_qa -f ('/tmp/' + $file)
    if ($LASTEXITCODE -ne 0) { throw ('Synthetic isolated SQL failed: ' + $file) }
  }
  Write-Output 'C26_ISOLATED_SOCIAL_SEARCH_QA_PASS'
}
finally {
  if ($started) {
    docker stop $name | Out-Null
  }
}
