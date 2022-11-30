module.exports = {
  kafka: {
    TOPIC: 'SentimentAnalysis',
    BROKERS: ['localhost:9092'],
    GROUPID: 'AI Consumers',
    CLIENTID: 'twitter-kafka-client'
  }
}
