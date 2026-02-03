const knowledgeBaseService = require('../knowledge-base/knowledge-base.service');

/**
 * Fallback Chatbot Service - Works without any API keys!
 * Uses pattern matching and knowledge base directly
 */
class FallbackChatbotService {
  constructor() {
    this.conversationHistory = new Map();
  }

  /**
   * Process user message using pattern matching and knowledge base
   */
  async processMessage(userId, message, context = {}) {
    try {
      // Get or create conversation history
      if (!this.conversationHistory.has(userId)) {
        this.conversationHistory.set(userId, []);
      }

      const history = this.conversationHistory.get(userId);

      // Search knowledge base for relevant information
      const kbResults = knowledgeBaseService.search(message);
      
      // Generate response based on knowledge base results
      let response;
      
      if (kbResults.length > 0) {
        // Found relevant information in knowledge base
        const topResult = kbResults[0];
        response = this.formatKnowledgeBaseResponse(topResult, message);
      } else {
        // No specific match, provide general help
        response = this.generateGeneralResponse(message);
      }

      // Update conversation history
      history.push({
        role: 'user',
        content: message,
        timestamp: new Date(),
      });

      history.push({
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      });

      // Keep only last 20 messages
      if (history.length > 20) {
        history.splice(0, history.length - 20);
      }

      return {
        success: true,
        response,
        suggestions: this.generateSuggestions(message, response),
      };
    } catch (error) {
      console.error('Fallback chatbot error:', error);
      return {
        success: false,
        error: 'I apologize, but I encountered an error. Please try again.',
      };
    }
  }

  /**
   * Format knowledge base result into a friendly response
   */
  formatKnowledgeBaseResponse(result, userMessage) {
    const { category, data, relevance } = result;

    switch (category) {
      case 'baggage':
        return this.formatBaggageResponse(data, userMessage);
      case 'checkin':
        return this.formatCheckinResponse(data, userMessage);
      case 'cancellation':
        return this.formatCancellationResponse(data, userMessage);
      case 'loyalty':
        return this.formatLoyaltyResponse(data, userMessage);
      case 'faq':
        return `${data.answer}\n\nIs there anything else I can help you with?`;
      case 'travel_documents':
        return this.formatTravelDocumentsResponse(data, userMessage);
      case 'contact':
        return this.formatContactResponse(data, userMessage);
      default:
        return this.formatGeneralResponse(data, userMessage);
    }
  }

  formatBaggageResponse(data, message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('carry') || lowerMessage.includes('cabin')) {
      return `**Carry-On Baggage Policy:**\n\n${data.carryOn.rules}\n\n**Dimensions:** ${data.carryOn.dimensions}\n**Weight:** ${data.carryOn.weight}\n\n**Allowed Items:** ${data.carryOn.allowedItems.join(', ')}\n\nNeed help with anything else?`;
    }
    
    if (lowerMessage.includes('checked') || lowerMessage.includes('luggage')) {
      return `**Checked Baggage Policy:**\n\n**Free Allowance:** ${data.checked.freeAllowance}\n**Additional Bags:** $${data.checked.additionalBagFee} per bag\n**Weight Limit:** ${data.checked.maxWeight}\n**Overweight Fee:** $${data.checked.overweightFee}\n\nWould you like to know more about carry-on baggage or special items?`;
    }
    
    // General baggage info
    return `**Baggage Policies:**\n\n**Carry-On:** ${data.carryOn.rules}\n**Checked:** ${data.checked.freeAllowance}\n\nWhat specific baggage information do you need?`;
  }

  formatCheckinResponse(data, message) {
    return `**Check-In Information:**\n\n**Online Check-In:**\n${data.online.availability}\nStart: ${data.online.openingTime}\n\n**Airport Check-In:**\n${data.airport.availability}\nRecommended arrival: ${data.airport.recommendedArrival}\n\n**Mobile Boarding Pass:** ${data.mobile.availability ? 'Available via our mobile app!' : 'Not available'}\n\nHow else can I assist you?`;
  }

  formatCancellationResponse(data, message) {
    return `**Cancellation & Refund Policy:**\n\n**Cancellation:** ${data.cancellationPolicy}\n**Refund:** ${data.refundPolicy}\n**Change Fee:** $${data.changeFee}\n\n**How to Cancel:** ${data.howToCancel}\n\nNeed more information?`;
  }

  formatLoyaltyResponse(data, message) {
    const tiers = data.tiers.map(t => `• **${t.name}**: ${t.benefits}`).join('\n');
    return `**${data.programName}**\n\n${data.description}\n\n**Membership Tiers:**\n${tiers}\n\n**How to Earn Points:**\n${data.howToEarn.join('\n')}\n\nInterested in joining?`;
  }

  formatTravelDocumentsResponse(data, message) {
    return `**Travel Documents Required:**\n\n${data.required.join('\n')}\n\n**Important Notes:**\n${data.notes.join('\n')}\n\nAnything else you'd like to know?`;
  }

  formatContactResponse(data, message) {
    return `**Contact AirGo:**\n\n📞 ${data.phone}\n📧 ${data.email}\n💬 ${data.chat}\n\n**Hours:** ${data.hours}\n\nHow can I help you today?`;
  }

  formatGeneralResponse(data, message) {
    if (typeof data === 'string') {
      return data;
    }
    return JSON.stringify(data, null, 2);
  }

  /**
   * Generate response when no knowledge base match is found
   */
  generateGeneralResponse(message) {
    const lowerMessage = message.toLowerCase();

    // Greetings
    if (/hello|hi|hey|good (morning|afternoon|evening)/i.test(message)) {
      return '👋 Welcome to AirGo! I\'m here to help you with:\n\n• Flight booking\n• Baggage policies\n• Check-in procedures\n• Cancellations & refunds\n• Loyalty program\n• And much more!\n\nWhat can I help you with today?';
    }

    // Thanks
    if (/thank|thanks|appreciate/i.test(message)) {
      return 'You\'re welcome! Is there anything else I can help you with?';
    }

    // Booking keywords
    if (lowerMessage.includes('book') || lowerMessage.includes('reservation') || lowerMessage.includes('flight')) {
      return 'I can help you with flight bookings! Our booking system allows you to:\n\n• Search for flights\n• Compare prices\n• Select seats\n• Add baggage\n• Complete payment\n\nWould you like to search for flights now?';
    }

    // Default response
    return 'I\'m here to help! You can ask me about:\n\n• Baggage policies\n• Check-in procedures\n• Flight cancellations\n• Loyalty rewards\n• Travel requirements\n• Contact information\n\nWhat would you like to know?';
  }

  /**
   * Generate contextual suggestions
   */
  generateSuggestions(userMessage, response) {
    const suggestions = [];
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('baggage') || lowerMessage.includes('luggage')) {
      suggestions.push('What can I bring in my carry-on?', 'Checked baggage fees', 'Special items policy');
    } else if (lowerMessage.includes('check-in') || lowerMessage.includes('check in')) {
      suggestions.push('Mobile boarding pass', 'Airport check-in times', 'Online check-in help');
    } else if (lowerMessage.includes('cancel') || lowerMessage.includes('refund')) {
      suggestions.push('How to cancel my flight', 'Refund policy', 'Change flight fee');
    } else if (lowerMessage.includes('loyalty') || lowerMessage.includes('rewards') || lowerMessage.includes('points')) {
      suggestions.push('How to earn points', 'Membership tiers', 'Redeem rewards');
    } else {
      suggestions.push('Baggage policies', 'Check-in help', 'Flight cancellation');
    }

    return suggestions.slice(0, 3);
  }

  /**
   * Analyze sentiment
   */
  async analyzeSentiment(message) {
    const negativeKeywords = ['angry', 'frustrated', 'terrible', 'worst', 'hate', 'refund', 'complaint', 'disappointed'];
    const urgentKeywords = ['urgent', 'emergency', 'asap', 'immediately', 'now'];

    const lowerMessage = message.toLowerCase();
    const isNegative = negativeKeywords.some((keyword) => lowerMessage.includes(keyword));
    const isUrgent = urgentKeywords.some((keyword) => lowerMessage.includes(keyword));

    return {
      isNegative,
      isUrgent,
      shouldEscalate: isNegative || isUrgent,
      score: isNegative ? -0.7 : isUrgent ? 0 : 0.5,
    };
  }

  /**
   * Clear conversation history for a user
   */
  clearHistory(userId) {
    this.conversationHistory.delete(userId);
    return true;
  }

  /**
   * Get conversation history for a user
   */
  getHistory(userId) {
    return this.conversationHistory.get(userId) || [];
  }
}

module.exports = new FallbackChatbotService();
