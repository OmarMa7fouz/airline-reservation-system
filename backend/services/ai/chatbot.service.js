const { ChatOpenAI } = require('@langchain/openai');
const { PromptTemplate } = require('@langchain/core/prompts');
const { StringOutputParser } = require('@langchain/core/output_parsers');
const { RunnableSequence } = require('@langchain/core/runnables');
const knowledgeBaseService = require('../knowledge-base/knowledge-base.service');

class ChatbotService {
  constructor() {
    this.model = new ChatOpenAI({
      modelName: 'llama-3.3-70b-versatile', // Fast, free Groq model
      temperature: 0.7,
      apiKey: process.env.GROQ_API_KEY,
      configuration: {
        baseURL: 'https://api.groq.com/openai/v1',
      },
      // Explicitly map baseURL for some versions of the library
      baseURL: 'https://api.groq.com/openai/v1', 
    });

    this.conversationHistory = new Map();
  }

  /**
   * Initialize chatbot with airline-specific knowledge
   */
  async initialize() {
    console.log('Initializing AI Chatbot Service...');
    console.log('Knowledge base loaded successfully');
    return true;
  }

  /**
   * Process user message and generate response
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
      const knowledgeContext = kbResults.length > 0 
        ? JSON.stringify(kbResults[0].data, null, 2)
        : 'No specific policy information found';

      // Create context-aware prompt
      const prompt = PromptTemplate.fromTemplate(`
You are AirGo AI Assistant, a helpful and friendly airline booking assistant.

Context:
- User ID: {userId}
- Current Page: {currentPage}
- User Preferences: {userPreferences}

Relevant Airline Information:
{knowledgeContext}

Conversation History:
{conversationHistory}

User Message: {userMessage}

Instructions:
1. Help users find and book flights
2. Answer questions about baggage, check-in, and policies using the provided airline information
3. Provide flight status updates
4. Assist with cancellations and refunds
5. Be concise, friendly, and helpful
6. If you need to search for flights, use natural language to describe what you'll do
7. Always prioritize user safety and satisfaction
8. Use the Relevant Airline Information above to answer policy questions accurately
9. If information isn't in the knowledge base, direct users to customer service: 1-800-AIRGO-FLY

Response:`);

      // Build the chain
      const chain = RunnableSequence.from([
        prompt,
        this.model,
        new StringOutputParser(),
      ]);

      // Generate response
      const response = await chain.invoke({
        userId,
        currentPage: context.currentPage || 'home',
        userPreferences: JSON.stringify(context.userPreferences || {}),
        conversationHistory: this.formatHistory(history),
        userMessage: message,
        knowledgeContext,
      });

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

      // Keep only last 10 messages to manage context window
      if (history.length > 20) {
        history.splice(0, history.length - 20);
      }

      return {
        success: true,
        response,
        suggestions: this.generateSuggestions(message, response),
      };
    } catch (error) {
      console.error('Chatbot error:', error);
      
      // Fallback Logic for Demo/Offline/API Error
      console.log('Switching to Fallback Rule-Based Chatbot');
      const fallbackResponse = this.generateFallbackResponse(message);
      
      // Update history with fallback
      const history = this.conversationHistory.get(userId) || [];
      if (!this.conversationHistory.has(userId)) this.conversationHistory.set(userId, history);

      history.push({ role: 'user', content: message, timestamp: new Date() });
      history.push({ role: 'assistant', content: fallbackResponse, timestamp: new Date() });
       
      return {
        success: true,
        response: fallbackResponse,
        suggestions: this.generateSuggestions(message, fallbackResponse),
        isFallback: true
      };
    }
  }

  /**
   * Generate rule-based fallback response
   */
  generateFallbackResponse(message) {
    const lower = message.toLowerCase();
    
    if (lower.includes('hello') || lower.includes('hi')) 
        return "👋 Welcome to AirGo! How can I help you find your perfect flight today?";
    
    if (lower.includes('book') || lower.includes('flight'))
        return "I can help you book a flight! Just tell me your departure city, destination, and travel dates ✈️";
    
    if (lower.includes('price') || lower.includes('cost'))
        return "We offer the best prices! You can check our 'Price Alerts' feature to track deals for your favorite routes.";
        
    if (lower.includes('baggage') || lower.includes('luggage'))
        return "Standard Economy includes 1 carry-on (7kg) and 1 checked bag (23kg). Business Class gets 2 checked bags (32kg each).";
        
    if (lower.includes('refund') || lower.includes('cancel'))
        return "Refunds depend on your ticket type. 'Flex' tickets are fully refundable, while 'Saver' tickets may have a fee. Check 'My Reservations' for options.";
        
    if (lower.includes('status'))
        return "You can check your flight status in the 'My Trips' section of the dashboard.";

    if (lower.includes('hotel') || lower.includes('car'))
        return "We assume you want to add extras! You can bundle Hotels and Cars during the booking process for a discount.";

    return "I'm currently in offline mode, but I can help you navigate the site. Try asking about 'booking', 'baggage', or 'refunds'.";
  }

  /**
   * Format conversation history for prompt
   */
  formatHistory(history) {
    if (history.length === 0) return 'No previous conversation';

    return history
      .slice(-10) // Last 10 messages
      .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');
  }

  /**
   * Generate contextual suggestions
   */
  generateSuggestions(userMessage, response) {
    const suggestions = [];

    // Flight search suggestions
    if (userMessage.toLowerCase().includes('flight') || userMessage.toLowerCase().includes('book')) {
      suggestions.push('Show me cheap flights', 'What are the baggage rules?', 'How do I check in?');
    }

    // Booking assistance
    if (response.toLowerCase().includes('book') || response.toLowerCase().includes('reservation')) {
      suggestions.push('What payment methods do you accept?', 'Can I change my booking?', 'What is your cancellation policy?');
    }

    // Default suggestions
    if (suggestions.length === 0) {
      suggestions.push('Find flights', 'Check flight status', 'My bookings', 'Help');
    }

    return suggestions.slice(0, 3);
  }

  /**
   * Analyze sentiment for escalation
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

module.exports = new ChatbotService();
