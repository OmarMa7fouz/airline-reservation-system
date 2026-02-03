// Airline Knowledge Base - Policies, FAQs, and Information

module.exports = {
  // Baggage Policies
  baggage: {
    carryOn: {
      weight: "7 kg (15 lbs)",
      dimensions: "55 x 40 x 23 cm (22 x 16 x 9 inches)",
      items: "1 carry-on bag + 1 personal item (purse, laptop bag)",
      restrictions: [
        "Liquids must be in containers of 100ml or less",
        "All liquids must fit in a single 1-liter clear plastic bag",
        "Sharp objects and tools are prohibited",
        "Power banks must be in carry-on luggage only"
      ]
    },
    checked: {
      economy: {
        allowance: "1 bag up to 23 kg (50 lbs)",
        dimensions: "158 cm (62 inches) total (length + width + height)",
        additionalBags: "$50 per bag"
      },
      business: {
        allowance: "2 bags up to 32 kg (70 lbs) each",
        dimensions: "158 cm (62 inches) total per bag",
        additionalBags: "$30 per bag"
      },
      firstClass: {
        allowance: "3 bags up to 32 kg (70 lbs) each",
        dimensions: "158 cm (62 inches) total per bag",
        additionalBags: "Free"
      }
    },
    specialItems: {
      sportingEquipment: "Golf clubs, skis, surfboards - $75 per item",
      musicalInstruments: "Small instruments free in cabin, large instruments require seat purchase",
      pets: "In-cabin: $125, Cargo: $200 (restrictions apply)"
    }
  },

  // Check-in Information
  checkIn: {
    online: {
      availability: "24 hours to 1 hour before departure",
      process: [
        "Visit airgo.com or use mobile app",
        "Enter booking reference and last name",
        "Select seats",
        "Download boarding pass"
      ],
      benefits: [
        "Skip check-in counter",
        "Choose preferred seats",
        "Save time at airport"
      ]
    },
    airport: {
      domestic: "Open 3 hours before departure, closes 45 minutes before",
      international: "Open 4 hours before departure, closes 60 minutes before"
    },
    mobile: {
      availability: "24 hours to 1 hour before departure",
      features: [
        "Digital boarding pass",
        "Apple Wallet / Google Pay integration",
        "Real-time flight updates"
      ]
    }
  },

  // Cancellation & Refund Policy
  cancellationPolicy: {
    refundable: {
      cancellation: "Free cancellation up to 24 hours before departure",
      refund: "Full refund to original payment method within 7-10 business days",
      changes: "Free changes, fare difference may apply"
    },
    nonRefundable: {
      cancellation: "Cancellation fee: $150",
      refund: "Remaining amount as travel credit valid for 1 year",
      changes: "Change fee: $75 + fare difference"
    },
    within24Hours: {
      policy: "Free cancellation within 24 hours of booking",
      condition: "Booking made at least 7 days before departure",
      refund: "Full refund, no questions asked"
    }
  },

  // Flight Change Policy
  changePolicy: {
    sameDayChange: {
      fee: "$75",
      availability: "Subject to seat availability",
      deadline: "Up to 24 hours before original departure"
    },
    dateChange: {
      refundable: "Free change, pay fare difference if applicable",
      nonRefundable: "$75 change fee + fare difference"
    },
    nameChange: {
      policy: "Name changes not allowed",
      exception: "Minor spelling corrections free (up to 3 characters)"
    }
  },

  // Seat Selection
  seatSelection: {
    free: [
      "Standard seats (middle seats, back of plane)",
      "Assigned automatically at check-in if not selected"
    ],
    premium: {
      extraLegroom: "$25-$75 depending on route",
      exitRow: "$35-$85 depending on route",
      frontRows: "$15-$40 depending on route"
    },
    business: "Included in business class ticket",
    families: "Free adjacent seat assignment for children under 12 with adult"
  },

  // Meals & Special Requests
  meals: {
    included: {
      domestic: "Complimentary snacks and beverages",
      international: "Full meal service on flights over 4 hours"
    },
    purchasable: {
      sandwiches: "$8-$12",
      snackBoxes: "$6-$10",
      alcoholicBeverages: "$7-$10"
    },
    specialMeals: [
      "Vegetarian",
      "Vegan",
      "Gluten-free",
      "Kosher",
      "Halal",
      "Diabetic",
      "Low sodium",
      "Request at least 48 hours before departure"
    ]
  },

  // Frequent Flyer Program
  loyaltyProgram: {
    name: "AirGo Rewards",
    tiers: {
      silver: {
        requirement: "0-10,000 points",
        benefits: [
          "Earn 1 point per $1 spent",
          "Priority boarding",
          "Free seat selection"
        ]
      },
      gold: {
        requirement: "10,001-50,000 points",
        benefits: [
          "Earn 1.5 points per $1 spent",
          "1 free checked bag",
          "Priority check-in",
          "2 lounge passes per year"
        ]
      },
      platinum: {
        requirement: "50,001+ points",
        benefits: [
          "Earn 2 points per $1 spent",
          "2 free checked bags",
          "Unlimited lounge access",
          "Complimentary upgrades (subject to availability)",
          "Dedicated customer service line"
        ]
      }
    },
    redemption: {
      flights: "Starting from 5,000 points for domestic flights",
      upgrades: "10,000 points for one-class upgrade",
      merchandise: "Various items in rewards catalog"
    }
  },

  // Travel Documents
  travelDocuments: {
    domestic: {
      required: [
        "Government-issued photo ID (driver's license, passport, state ID)",
        "Boarding pass"
      ]
    },
    international: {
      required: [
        "Valid passport (must be valid for at least 6 months after return date)",
        "Visa (if required for destination country)",
        "Boarding pass",
        "Proof of onward travel (for some countries)"
      ],
      recommendations: [
        "Make copies of all documents",
        "Check visa requirements for your destination",
        "Verify passport expiration date",
        "Register with your embassy if traveling to high-risk areas"
      ]
    }
  },

  // Contact Information
  contact: {
    customerService: {
      phone: "1-800-AIRGO-FLY (1-800-247-4635)",
      hours: "24/7",
      email: "support@airgo.com",
      chat: "Available on website and mobile app"
    },
    emergencies: {
      phone: "1-800-AIRGO-911",
      available: "24/7 for urgent travel issues"
    },
    social: {
      twitter: "@AirGoAirlines",
      facebook: "facebook.com/AirGoAirlines",
      instagram: "@AirGoAirlines"
    }
  },

  // Common FAQs
  faqs: [
    {
      question: "How early should I arrive at the airport?",
      answer: "We recommend arriving 2 hours before domestic flights and 3 hours before international flights."
    },
    {
      question: "Can I bring my pet on board?",
      answer: "Yes! Small pets (under 20 lbs including carrier) can travel in-cabin for $125. Larger pets must travel in cargo for $200. Service animals fly free."
    },
    {
      question: "What if my flight is delayed or cancelled?",
      answer: "We'll automatically rebook you on the next available flight at no charge. If the delay is over 3 hours, you may be eligible for meal vouchers or hotel accommodation."
    },
    {
      question: "Can I choose my seat?",
      answer: "Yes! You can select your seat during booking or anytime before check-in. Standard seats are free, premium seats (extra legroom, exit row) have an additional fee."
    },
    {
      question: "How do I add baggage to my booking?",
      answer: "You can add checked baggage during booking, online check-in, or at the airport. It's cheaper to add baggage online before your flight."
    },
    {
      question: "What items are prohibited in carry-on luggage?",
      answer: "Sharp objects, tools, liquids over 100ml, firearms, and flammable items are prohibited. Full list available on our website."
    },
    {
      question: "Can I get a refund if I cancel my flight?",
      answer: "Refundable tickets can be cancelled for a full refund up to 24 hours before departure. Non-refundable tickets incur a $150 cancellation fee and the remaining amount is issued as travel credit."
    },
    {
      question: "Do you offer Wi-Fi on flights?",
      answer: "Yes! Wi-Fi is available on most flights for $8 (1 hour), $15 (full flight), or free for Gold and Platinum members."
    }
  ]
};
