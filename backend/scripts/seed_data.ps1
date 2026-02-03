
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
        GateId = "G" + (Get-Random -Minimum 1 -Maximum 20)
        EconomyPrice = 150.00
        BusinessPrice = 300.00
        FirstClassPrice = 600.00
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

# Flight 1
$id1 = New-Flight "FL200" "New York" "Los Angeles" "2025-06-15T08:00:00" "2025-06-15T11:00:00"
New-Seats $id1

# Flight 2
$id2 = New-Flight "FL201" "London" "Paris" "2025-06-16T09:30:00" "2025-06-16T10:45:00"
New-Seats $id2

# Flight 3
$id3 = Create-Flight "FL202" "Tokyo" "San Francisco" "2025-06-17T14:00:00" "2025-06-17T08:00:00"
Create-Seats $id3

Write-Host "Seeding complete!"
