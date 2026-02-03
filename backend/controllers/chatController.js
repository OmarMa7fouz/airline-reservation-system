// Using DeepSeek AI for chatbot responses
const chatbotService = require('../services/ai/chatbot.service');

/**
 * Send message to chatbot
 */
exports.sendMessage = async (req, res) => {
  try {
    const { message, context } = req.body;
    const userId = req.user?.id || req.sessionID;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
      });
    }

    // Analyze sentiment
    const sentiment = await chatbotService.analyzeSentiment(message);

    // Process message
    const result = await chatbotService.processMessage(userId, message, context);

    // Include sentiment in response
    res.json({
      ...result,
      sentiment,
      userId,
    });
  } catch (error) {
    console.error('Chat controller error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process message',
    });
  }
};

/**
 * Get chat history
 */
exports.getHistory = async (req, res) => {
  try {
    const userId = req.user?.id || req.params.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required',
      });
    }

    const history = chatbotService.getHistory(userId);

    res.json({
      success: true,
      history,
      count: history.length,
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve chat history',
    });
  }
};

/**
 * Clear chat history
 */
exports.clearHistory = async (req, res) => {
  try {
    const userId = req.user?.id || req.sessionID;

    chatbotService.clearHistory(userId);

    res.json({
      success: true,
      message: 'Chat history cleared',
    });
  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear chat history',
    });
  }
};

/**
 * Get contextual suggestions
 */
exports.getSuggestions = async (req, res) => {
  try {
    const { context } = req.query;

    const suggestions = [
      'Find flights to New York',
      'Check my booking status',
      'What are your baggage policies?',
      'How do I check in online?',
      'I need to change my flight',
    ];

    res.json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get suggestions',
    });
  }
};

/**
 * Submit feedback on chat experience
 */
exports.submitFeedback = async (req, res) => {
  try {
    const { rating, comment, conversationId } = req.body;
    const userId = req.user?.id || req.sessionID;

    // TODO: Store feedback in database
    console.log('Chat feedback received:', {
      userId,
      rating,
      comment,
      conversationId,
    });

    res.json({
      success: true,
      message: 'Thank you for your feedback!',
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit feedback',
    });
  }
};
