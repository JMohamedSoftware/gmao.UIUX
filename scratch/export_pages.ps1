$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$baseUrl = "http://localhost:5174/"
$outDir = "C:\Users\User\Downloads\gmao.UIUX\figma_vector_exports"

$pages = @(
    # Logins
    @{ name = "login_midi.pdf"; url = "$baseUrl/?tenant=tenant-midi" },
    @{ name = "login_nord.pdf"; url = "$baseUrl/?tenant=tenant-nord" },
    @{ name = "login_admin.pdf"; url = "$baseUrl/?tenant=admin" },
    
    # Conserverie du Midi (Red)
    @{ name = "dashboard_midi.pdf"; url = "$baseUrl/?tenant=tenant-midi&autologin=midi&screen=dashboard" },
    @{ name = "equipment_midi.pdf"; url = "$baseUrl/?tenant=tenant-midi&autologin=midi&screen=equipment" },
    @{ name = "preventive_midi.pdf"; url = "$baseUrl/?tenant=tenant-midi&autologin=midi&screen=preventive" },
    @{ name = "corrective_midi.pdf"; url = "$baseUrl/?tenant=tenant-midi&autologin=midi&screen=corrective" },
    @{ name = "workorders_midi.pdf"; url = "$baseUrl/?tenant=tenant-midi&autologin=midi&screen=workorders" },
    @{ name = "inventory_midi.pdf"; url = "$baseUrl/?tenant=tenant-midi&autologin=midi&screen=inventory" },
    @{ name = "suppliers_midi.pdf"; url = "$baseUrl/?tenant=tenant-midi&autologin=midi&screen=suppliers" },
    @{ name = "reports_midi.pdf"; url = "$baseUrl/?tenant=tenant-midi&autologin=midi&screen=reports" },
    @{ name = "admin_midi.pdf"; url = "$baseUrl/?tenant=tenant-midi&autologin=midi&screen=admin" },
    
    # Tomates du Nord (Teal)
    @{ name = "dashboard_nord.pdf"; url = "$baseUrl/?tenant=tenant-nord&autologin=nord&screen=dashboard" },
    @{ name = "equipment_nord.pdf"; url = "$baseUrl/?tenant=tenant-nord&autologin=nord&screen=equipment" },
    @{ name = "preventive_nord.pdf"; url = "$baseUrl/?tenant=tenant-nord&autologin=nord&screen=preventive" },
    @{ name = "corrective_nord.pdf"; url = "$baseUrl/?tenant=tenant-nord&autologin=nord&screen=corrective" },
    @{ name = "workorders_nord.pdf"; url = "$baseUrl/?tenant=tenant-nord&autologin=nord&screen=workorders" },
    @{ name = "inventory_nord.pdf"; url = "$baseUrl/?tenant=tenant-nord&autologin=nord&screen=inventory" },
    @{ name = "suppliers_nord.pdf"; url = "$baseUrl/?tenant=tenant-nord&autologin=nord&screen=suppliers" },
    @{ name = "reports_nord.pdf"; url = "$baseUrl/?tenant=tenant-nord&autologin=nord&screen=reports" },
    @{ name = "admin_nord.pdf"; url = "$baseUrl/?tenant=tenant-nord&autologin=nord&screen=admin" },
    
    # Super Admin (Gold)
    @{ name = "superadmin_dashboard.pdf"; url = "$baseUrl/?tenant=admin&autologin=admin&screen=superadmin" }
)

Write-Output "Starting page exports to Figma PDF vectors..."

foreach ($page in $pages) {
    $name = $page.name
    $url = $page.url
    $dest = Join-Path $outDir $name
    Write-Output "Printing $name from $url..."
    
    # Delete file if exists to ensure clean write
    if (Test-Path $dest) {
        Remove-Item -Force $dest
    }
    
    # Run chrome print-to-pdf synchronously
    $args = @(
        "--headless",
        "--no-sandbox",
        "--print-to-pdf-no-header",
        "--disable-gpu",
        "--print-to-pdf=$dest",
        $url
    )
    
    Start-Process -FilePath $chromePath -ArgumentList $args -Wait
    
    if (Test-Path $dest) {
        $size = (Get-Item $dest).Length
        Write-Output "Successfully saved $name ($size bytes)."
    } else {
        Write-Warning "Failed to save $name."
    }
}

Write-Output "All page exports complete!"
