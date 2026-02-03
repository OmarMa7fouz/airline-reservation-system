
$baseUrl = "http://localhost:5000/api"

function New-Flight {
    param (
        $flightNumber, $source, $destination, $depTime, $arrTime
    )
    $body = @{
        FlightNumber = $flightNumber
        Source = $source
        Destination = $destination
        DepartureTime = $depTime
        ArrivalTime = $arrTime
        GateId = "G" + (Get-Random -Minimum 1 -Maximum 50)
        EconomyPrice = (Get-Random -Minimum 100 -Maximum 900)
        BusinessPrice = (Get-Random -Minimum 1000 -Maximum 2500)
        FirstClassPrice = (Get-Random -Minimum 3000 -Maximum 8000)
        TotalSeats = 60
        EconomySeatsAvailable = 20
        BusinessSeatsAvailable = 20
        FirstClassSeatsAvailable = 20
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/flights" -Method Post -Body $body -ContentType "application/json"
        return $response.id
    } catch {
        Write-Host "Error creating flight $flightNumber : $_"
        return $null
    }
}

function New-Seats {
    param ($flightId)
    if (-not $flightId) { return }

    # Create Economy Seats (10)
    1..10 | ForEach-Object {
        $seatNum = "E$_"
        $body = @{
            FlightId = $flightId
            SeatNumber = $seatNum
            Class = "Economy"
            IsAvailable = 1
            TicketId = $null
        } | ConvertTo-Json
        Invoke-RestMethod -Uri "$baseUrl/seatAssignments" -Method Post -Body $body -ContentType "application/json" | Out-Null
    }
    
    # Create Business Seats (5)
    1..5 | ForEach-Object {
        $seatNum = "B$_"
        $body = @{
            FlightId = $flightId
            SeatNumber = $seatNum
            Class = "Business"
            IsAvailable = 1
            TicketId = $null
        } | ConvertTo-Json
        Invoke-RestMethod -Uri "$baseUrl/seatAssignments" -Method Post -Body $body -ContentType "application/json" | Out-Null
    }

    # Create First Class Seats (5)
    1..5 | ForEach-Object {
        $seatNum = "F$_"
        $body = @{
            FlightId = $flightId
            SeatNumber = $seatNum
            Class = "FirstClass"
            IsAvailable = 1
            TicketId = $null
        } | ConvertTo-Json
        Invoke-RestMethod -Uri "$baseUrl/seatAssignments" -Method Post -Body $body -ContentType "application/json" | Out-Null
    }
    Write-Host "Seats created for Flight ID $flightId"
}

$cities = @("New York", "London", "Paris", "Tokyo", "Dubai", "Sydney", "Los Angeles", "Toronto", "Berlin", "Singapore", "Hong Kong", "Mumbai", "Cairo", "Rio de Janeiro", "Moscow", "Rome", "Barcelona", "Amsterdam", "Istanbul", "Bangkok")

# Generate 30 Random International Flights
1..30 | ForEach-Object {
    $src = $cities | Get-Random
    $dest = $cities | Get-Random
    while ($src -eq $dest) { $dest = $cities | Get-Random }

    $flightNum = "FL" + (Get-Random -Minimum 300 -Maximum 999)
    # Random date in next 3 months
    $daysToAdd = Get-Random -Minimum 1 -Maximum 90
    $depDate = (Get-Date).AddDays($daysToAdd)
    $arrDate = $depDate.AddHours((Get-Random -Minimum 2 -Maximum 14))

    $depTimeStr = $depDate.ToString("yyyy-MM-ddTHH:mm:ss")
    $arrTimeStr = $arrDate.ToString("yyyy-MM-ddTHH:mm:ss")

    $id = New-Flight $flightNum $src $dest $depTimeStr $arrTimeStr
    if ($id) {
        New-Seats $id
    }
}

Write-Host "Mass seeding complete!"
