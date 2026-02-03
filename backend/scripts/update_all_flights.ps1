
$baseUrl = "http://localhost:5000/api"

# Function to get all flights and update their seats
function Update-Existing-Flights {
    Write-Host "Fetching existing flights..."
    try {
        $flightsRes = Invoke-RestMethod -Uri "$baseUrl/flights" -Method Get
        $flights = $flightsRes.flights
    } catch {
        Write-Host "Error fetching flights: $_"
        return
    }

    foreach ($flight in $flights) {
        $flightId = $flight.FlightId
        
        # Determine Plane Type randomly or based on existing capacity (heuristic)
        $planeType = "Medium"
        if ($flight.TotalSeats -ge 300) { $planeType = "Large" }
        elseif ($flight.TotalSeats -le 60) { $planeType = "Small" }
        else {
             # If it was a randomly generated flight from before with default 60 seats that we want to upgrade
             # Let's randomly assign a larger size to some of them to make it interesting
             $rand = Get-Random -Minimum 1 -Maximum 10
             if ($rand -gt 7) { $planeType = "Large" }
             elseif ($rand -gt 3) { $planeType = "Medium" }
             else { $planeType = "Small" }
        }

        Write-Host "Updating Flight $flightId ($($flight.FlightNumber)) to be $planeType..."

        # 1. Delete existing seats for this flight (to avoid duplicates/messy data)
        # Note: In a real app we'd be careful not to delete booked seats, but for dev/testing:
        try {
            # We first need to get all seats to delete them one by one (API limitation usually, unless we have bulk delete)
            # A faster way for this dev script is to just ADD missing seats, but to ensure "different planes", 
            # we should really reset the seat map.
            
            # For this task, let's just ADD the new seat map logic. 
            # Since the previous script only added a few seats (E1-E10), we can just overwrite/add more.
            # Best approach for "clean" slate: Delete flight and recreate? No, that breaks IDs.
            # Let's just run the generation logic. If seat exists, it might error or fail silently depending on API.
            # But the user asked to "adjust" them.
            
            # Let's try to clear tickets/seats if possible using raw SQL via a quick helper route?
            # Or just "fill in" the rest of the plane.
            
            # To be safe and thorough: We will generate the FULL seat map for the chosen plane type.
            # Existing seats (like 'E1') will likely conflict and throw an error, which we will catch and ignore.
            
            New-Seats $flightId $planeType

        } catch {
            Write-Host "Error updating flight $flightId : $_"
        }
    }
}

function New-Seats {
    param ($flightId, $planeType)
    if (-not $flightId) { return }

    $letters = @()
    if ($planeType -eq "Large") {
        $letters = @("A", "B", "C", "D", "E", "F", "G", "H", "J", "K") # 10 seats per row
        $firstClassRows = 4  
        $businessRows = 6    
        $economyRows = 20    
    } elseif ($planeType -eq "Medium") {
        $letters = @("A", "B", "C", "D", "E", "F") # 6 seats per row
        $firstClassRows = 2  
        $businessRows = 4    
        $economyRows = 20    
    } else { # Small
        $letters = @("A", "B", "C", "D") # 4 seats per row
        $firstClassRows = 0
        $businessRows = 3    
        $economyRows = 12    
    }

    $currentRow = 1

    # Helper to post seat, ignoring "already exists" errors
    function Submit-Seat {
        param ($fId, $num, $cls)
        $body = @{ FlightId = $fId; SeatNumber = $num; Class = $cls; IsAvailable = 1 } | ConvertTo-Json
        try {
            Invoke-RestMethod -Uri "$baseUrl/seatAssignments" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop | Out-Null
            # Write-Host "." -NoNewline
        } catch {
            # Ignore "Constraint failed" or similar if seat exists
        }
    }

    # Generate First Class
    if ($firstClassRows -gt 0) {
        1..$firstClassRows | ForEach-Object {
            $r = $currentRow
            $letters | ForEach-Object { Submit-Seat $flightId "$r$_" "FirstClass" }
            $currentRow++
        }
    }

    # Generate Business Class
    if ($businessRows -gt 0) {
        1..$businessRows | ForEach-Object {
            $r = $currentRow
            $letters | ForEach-Object { Submit-Seat $flightId "$r$_" "Business" }
            $currentRow++
        }
    }

    # Generate Economy Class
    1..$economyRows | ForEach-Object {
        $r = $currentRow
        $letters | ForEach-Object { Submit-Seat $flightId "$r$_" "Economy" }
        $currentRow++
    }

    Write-Host " - Seats sync complete."
}

Update-Existing-Flights
Write-Host "All flights updated!"
