const knowledgeBase = require('../knowledge-base/airline-policies');

class KnowledgeBaseService {
  constructor() {
    this.policies = knowledgeBase;
  }

  /**
   * Search knowledge base for relevant information
   */
  search(query) {
    const lowerQuery = query.toLowerCase();
    const results = [];

    // Search baggage information
    if (this.matchesKeywords(lowerQuery, ['bag', 'baggage', 'luggage', 'carry', 'checked', 'weight', 'size'])) {
      results.push({
        category: 'Baggage',
        data: this.policies.baggage,
        relevance: 0.9
      });
    }

    // Search check-in information
    if (this.matchesKeywords(lowerQuery, ['check in', 'check-in', 'boarding pass', 'online check'])) {
      results.push({
        category: 'Check-in',
        data: this.policies.checkIn,
        relevance: 0.9
      });
    }

    // Search cancellation/refund
    if (this.matchesKeywords(lowerQuery, ['cancel', 'refund', 'cancellation', 'money back'])) {
      results.push({
        category: 'Cancellation & Refund',
        data: this.policies.cancellationPolicy,
        relevance: 0.95
      });
    }

    // Search flight changes
    if (this.matchesKeywords(lowerQuery, ['change', 'modify', 'reschedule', 'different date'])) {
      results.push({
        category: 'Flight Changes',
        data: this.policies.changePolicy,
        relevance: 0.9
      });
    }

    // Search seat selection
    if (this.matchesKeywords(lowerQuery, ['seat', 'seating', 'sit', 'window', 'aisle', 'legroom'])) {
      results.push({
        category: 'Seat Selection',
        data: this.policies.seatSelection,
        relevance: 0.85
      });
    }

    // Search meals
    if (this.matchesKeywords(lowerQuery, ['meal', 'food', 'eat', 'drink', 'vegetarian', 'vegan'])) {
      results.push({
        category: 'Meals & Special Requests',
        data: this.policies.meals,
        relevance: 0.8
      });
    }

    // Search loyalty program
    if (this.matchesKeywords(lowerQuery, ['points', 'rewards', 'loyalty', 'frequent flyer', 'miles'])) {
      results.push({
        category: 'Loyalty Program',
        data: this.policies.loyaltyProgram,
        relevance: 0.85
      });
    }

    // Search travel documents
    if (this.matchesKeywords(lowerQuery, ['passport', 'visa', 'id', 'document', 'identification'])) {
      results.push({
        category: 'Travel Documents',
        data: this.policies.travelDocuments,
        relevance: 0.9
      });
    }

    // Search contact info
    if (this.matchesKeywords(lowerQuery, ['contact', 'phone', 'email', 'call', 'support', 'help'])) {
      results.push({
        category: 'Contact Information',
        data: this.policies.contact,
        relevance: 0.8
      });
    }

    // Search FAQs
    const matchingFaqs = this.searchFAQs(lowerQuery);
    if (matchingFaqs.length > 0) {
      results.push({
        category: 'FAQs',
        data: matchingFaqs,
        relevance: 0.95
      });
    }

    // Sort by relevance
    return results.sort((a, b) => b.relevance - a.relevance);
  }

  /**
   * Search FAQs for matching questions
   */
  searchFAQs(query) {
    return this.policies.faqs.filter(faq => {
      const questionLower = faq.question.toLowerCase();
      const answerLower = faq.answer.toLowerCase();
      return questionLower.includes(query) || answerLower.includes(query);
    });
  }

  /**
   * Check if query matches any of the keywords
   */
  matchesKeywords(query, keywords) {
    return keywords.some(keyword => query.includes(keyword));
  }

  /**
   * Get specific policy information
   */
  getPolicy(category) {
    return this.policies[category] || null;
  }

  /**
   * Format knowledge base results for chatbot
   */
  formatForChatbot(results) {
    if (results.length === 0) {
      return "I don't have specific information about that. Please contact our customer service at 1-800-AIRGO-FLY for assistance.";
    }

    let response = "";
    
    // Use the most relevant result
    const topResult = results[0];

    if (topResult.category === 'FAQs') {
      const faq = topResult.data[0];
      response = `**${faq.question}**\n\n${faq.answer}`;
    } else {
      response = `Here's what I found about ${topResult.category}:\n\n`;
      response += JSON.stringify(topResult.data, null, 2);
    }

    return response;
  }
}

module.exports = new KnowledgeBaseService();
