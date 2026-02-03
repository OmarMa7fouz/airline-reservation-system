
$baseUrl = "http://localhost:5000/api"
$cities = @("New York", "London", "Paris", "Tokyo", "Dubai", "Sydney", "Los Angeles", "Toronto", "Berlin", "Singapore", "Hong Kong", "Mumbai", "Cairo", "Rio de Janeiro", "Moscow", "Rome", "Barcelona", "Amsterdam", "Istanbul", "Bangkok", "Seoul", "Beijing", "Madrid", "Chicago", "San Francisco")

function New-Flight {
    param (
        $flightNumber, $source, $destination, $depTime, $arrTime, $planeType
    )

    # Determine capacity based on plane type
    if ($planeType -eq "Large") {
        $total = 300
        $econ = 200
        $bus = 60
        $first = 40
    } elseif ($planeType -eq "Medium") {
        $total = 150
        $econ = 120
        $bus = 20
        $first = 10
    } else { # Small
        $total = 60
        $econ = 50
        $bus = 10
        $first = 0
    }

    $body = @{
        FlightNumber = $flightNumber
        Source = $source
        Destination = $destination
        DepartureTime = $depTime
        ArrivalTime = $arrTime
        GateId = "G" + (Get-Random -Minimum 1 -Maximum 50)
        EconomyPrice = (Get-Random -Minimum 200 -Maximum 900)
        BusinessPrice = (Get-Random -Minimum 1200 -Maximum 2200)
        FirstClassPrice = (Get-Random -Minimum 3500 -Maximum 8000)
        TotalSeats = $total
        EconomySeatsAvailable = $econ
        BusinessSeatsAvailable = $bus
        FirstClassSeatsAvailable = $first
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/flights" -Method Post -Body $body -ContentType "application/json"
        return @{ id = $response.id; type = $planeType }
    } catch {
        Write-Host "Error creating flight $flightNumber : $_"
        return $null
    }
}

function New-Seats {
    param ($flightId, $planeType)
    if (-not $flightId) { return }

    $letters = @()
    if ($planeType -eq "Large") {
        $letters = @("A", "B", "C", "D", "E", "F", "G", "H", "J", "K") # 10 seats per row
        $firstClassRows = 4  # 4 * 10 = 40
        $businessRows = 6    # 6 * 10 = 60
        $economyRows = 20    # 20 * 10 = 200
        # Total ~300
    } elseif ($planeType -eq "Medium") {
        $letters = @("A", "B", "C", "D", "E", "F") # 6 seats per row
        $firstClassRows = 2  # 2 * 6 = 12 (approx 10)
        $businessRows = 4    # 4 * 6 = 24 (approx 20)
        $economyRows = 20    # 20 * 6 = 120
        # Total ~150
    } else {
        $letters = @("A", "B", "C", "D") # 4 seats per row
        $firstClassRows = 0
        $businessRows = 3    # 3 * 4 = 12 (approx 10)
        $economyRows = 12    # 12 * 4 = 48 (approx 50)
        # Total ~60
    }

    $currentRow = 1

    # Generate First Class
    if ($firstClassRows -gt 0) {
        1..$firstClassRows | ForEach-Object {
            $r = $currentRow
            $letters | ForEach-Object {
                $seatNum = "$r$_"
                $body = @{ FlightId = $flightId; SeatNumber = $seatNum; Class = "FirstClass"; IsAvailable = 1 } | ConvertTo-Json
                Invoke-RestMethod -Uri "$baseUrl/seatAssignments" -Method Post -Body $body -ContentType "application/json" | Out-Null
            }
            $currentRow++
        }
    }

    # Generate Business Class
    if ($businessRows -gt 0) {
        1..$businessRows | ForEach-Object {
            $r = $currentRow
            $letters | ForEach-Object {
                $seatNum = "$r$_"
                $body = @{ FlightId = $flightId; SeatNumber = $seatNum; Class = "Business"; IsAvailable = 1 } | ConvertTo-Json
                Invoke-RestMethod -Uri "$baseUrl/seatAssignments" -Method Post -Body $body -ContentType "application/json" | Out-Null
            }
            $currentRow++
        }
    }

    # Generate Economy Class
    1..$economyRows | ForEach-Object {
        $r = $currentRow
        $letters | ForEach-Object {
            $seatNum = "$r$_"
            $body = @{ FlightId = $flightId; SeatNumber = $seatNum; Class = "Economy"; IsAvailable = 1 } | ConvertTo-Json
            Invoke-RestMethod -Uri "$baseUrl/seatAssignments" -Method Post -Body $body -ContentType "application/json" | Out-Null
        }
        $currentRow++
    }

    Write-Host "Seats created for Flight ID $flightId ($planeType)"
}

# Generate 5 Very Large Flights (Boeing 777 style)
1..5 | ForEach-Object {
    $src = $cities | Get-Random
    $dest = $cities | Get-Random
    while ($src -eq $dest) { $dest = $cities | Get-Random }
    $flightNum = "LH" + (Get-Random -Minimum 500 -Maximum 999)
    $depTime = (Get-Date).AddDays((Get-Random -Minimum 1 -Maximum 30)).ToString("yyyy-MM-ddTHH:mm:ss")
    $arrTime = (Get-Date).AddDays(31).ToString("yyyy-MM-ddTHH:mm:ss") # Dummy arrival

    $res = Create-Flight $flightNum $src $dest $depTime $arrTime "Large"
    if ($res) { Create-Seats $res.id "Large" }
}

# Generate 10 Medium Flights (A320 style)
1..10 | ForEach-Object {
    $src = $cities | Get-Random
    $dest = $cities | Get-Random
    while ($src -eq $dest) { $dest = $cities | Get-Random }
    $flightNum = "MD" + (Get-Random -Minimum 300 -Maximum 499)
    $depTime = (Get-Date).AddDays((Get-Random -Minimum 1 -Maximum 30)).ToString("yyyy-MM-ddTHH:mm:ss")
    $arrTime = (Get-Date).AddDays(31).ToString("yyyy-MM-ddTHH:mm:ss")

    $res = Create-Flight $flightNum $src $dest $depTime $arrTime "Medium"
    if ($res) { Create-Seats $res.id "Medium" }
}

# Generate 10 Small Flights (Regional Jet)
1..10 | ForEach-Object {
    $src = $cities | Get-Random
    $dest = $cities | Get-Random
    while ($src -eq $dest) { $dest = $cities | Get-Random }
    $flightNum = "SM" + (Get-Random -Minimum 100 -Maximum 299)
    $depTime = (Get-Date).AddDays((Get-Random -Minimum 1 -Maximum 30)).ToString("yyyy-MM-ddTHH:mm:ss")
    $arrTime = (Get-Date).AddDays(31).ToString("yyyy-MM-ddTHH:mm:ss")

    $res = Create-Flight $flightNum $src $dest $depTime $arrTime "Small"
    if ($res) { Create-Seats $res.id "Small" }
}

Write-Host "Realistic seeding complete!"
