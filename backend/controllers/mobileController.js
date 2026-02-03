const db = require('../config/db');

/**
 * Mobile Controller
 * Handles Wallet Passes, Push Notifications, and Mobile Deals
 */

// Generate Apple Wallet Pass (.pkpass) data
exports.getApplePass = async (req, res) => {
  try {
    const { ticketId } = req.params;

    // Get ticket details
    const ticket = await new Promise((resolve, reject) => {
      db.get(
        `SELECT t.*, f.*, p.FirstName, p.LastName 
         FROM tickets t 
         JOIN flights f ON t.flight_id = f.id 
         JOIN passengers p ON t.passenger_id = p.id
         WHERE t.ticket_number = ?`,
        [ticketId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Determine gate info
    const gate = `G${Math.floor(Math.random() * 20) + 1}`;
    
    // Construct Passbook JSON structure (pass.json)
    const passData = {
      formatVersion: 1,
      passTypeIdentifier: "pass.com.airgo.boarding",
      serialNumber: ticket.ticket_number,
      teamIdentifier: "ABC123DEF", // Mock Team ID
      organizationName: "AirGo Airlines",
      description: "Boarding Pass",
      logoText: "AirGo",
      foregroundColor: "rgb(255, 255, 255)",
      backgroundColor: "rgb(15, 23, 42)", // Navy blue
      labelColor: "rgb(217, 119, 6)", // Amber
      boardingPass: {
        transitType: "PKTransitTypeAir",
        primaryFields: [
          {
            key: "origin",
            label: ticket.origin,
            value: ticket.origin,
            changeMessage: "Origin changed to %@"
          },
          {
            key: "destination",
            label: ticket.destination,
            value: ticket.destination,
            changeMessage: "Destination changed to %@"
          }
        ],
        secondaryFields: [
          {
            key: "passenger",
            label: "Passenger",
            value: `${ticket.FirstName} ${ticket.LastName}`
          },
          {
            key: "flight",
            label: "Flight",
            value: ticket.flight_number
          }
        ],
        auxiliaryFields: [
          {
            key: "date",
            label: "Date",
            value: ticket.departure_time,
            dateStyle: "PKDateStyleMedium",
            timeStyle: "PKDateStyleShort"
          },
          {
            key: "gate",
            label: "Gate",
            value: gate,
            changeMessage: "Gate changed to %@"
          }
        ],
        backFields: [
          {
            key: "terms",
            label: "Terms & Conditions",
            value: "This ticket is non-transferable..."
          }
        ],
        barcode: {
          format: "PKBarcodeFormatQR",
          message: ticket.ticket_number,
          messageEncoding: "iso-8859-1",
          altText: ticket.ticket_number
        }
      }
    };

    // In a real app, we would bundle this with icons/images, sign it with certs, and zip it.
    // Here we return the JSON data that would go into pass.json
    res.json({
      success: true,
      message: 'Apple Wallet Pass Data Generated',
      note: 'In production, this JSON is zipped into a .pkpass file signed with Apple Developer Certs.',
      passData
    });

  } catch (error) {
    console.error('Error generating Apple pass:', error);
    res.status(500).json({ error: 'Failed to generate pass' });
  }
};

// Generate Google Wallet Link
exports.getGooglePass = async (req, res) => {
  try {
    const { ticketId } = req.params;

    // Simulate generating a JWT signed link
    const googlePayLink = `https://pay.google.com/gp/v/save/${ticketId}?sig=mock_signature_jwt_token`;

    res.json({
      success: true,
      url: googlePayLink,
      message: 'Google Wallet Link Generated'
    });
  } catch (error) {
    console.error('Error generating Google pass:', error);
    res.status(500).json({ error: 'Failed to generate pass' });
  }
};

// Subscribe to Push Notifications
exports.subscribeToPush = async (req, res) => {
  try {
    const { subscription, type } = req.body; // subscription object from Push API
    const userAgent = req.headers['user-agent'];
    
    // In a real app with auth, we'd get userId from req.user
    // For demo, we'll assume a dummy userId if not provided, or passed in body
    const userId = req.body.userId || 1; 

    await new Promise((resolve, reject) => {
      db.run(
        `INSERT OR REPLACE INTO push_subscriptions (user_id, endpoint, p256dh, auth, user_agent)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth, userAgent],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.status(201).json({ success: true, message: 'Subscribed to notifications' });
  } catch (error) {
    console.error('Push subscription error:', error);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
};

// Get Mobile Exclusive Deals
exports.getMobileDeals = async (req, res) => {
  try {
    const deals = await new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM mobile_deals WHERE is_active = 1`,
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    res.json({ success: true, deals });
  } catch (error) {
    console.error('Error fetching mobile deals:', error);
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
};
