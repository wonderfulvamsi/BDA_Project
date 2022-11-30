const { Kafka } = require('kafkajs')
const config = require('./config')

var sentiment = require('node-sentiment');

const kafka = new Kafka({
  clientId: config.kafka.CLIENTID,
  brokers: config.kafka.BROKERS
})

const topic = config.kafka.TOPIC
const consumer = kafka.consumer({
  groupId: config.kafka.GROUPID
})

const run = async () => {
  await consumer.connect()
  await consumer.subscribe({ topic, fromBeginning: true })
  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const jsonObj = JSON.parse(message.value.toString())
        let result = sentiment(jsonObj.tweet)
        let whyWords = []
        if(result.vote == "positive"){
          whyWords = result.positive
        }
        else{
          whyWords = result.negative
        }
        console.log(
            '******* Analysis on the tweet Id ' + jsonObj.tweetId + ' *********\n'+jsonObj.tweet)
            if(whyWords.length){
              console.log("Due to the words = "+whyWords)
            }
            console.log(result.vote)
      } catch (error) {
        console.log('err=', error)
      }
    }
  })
}


run().catch(e => console.error(`[example/consumer] ${e.message}`, e))

const errorTypes = ['unhandledRejection', 'uncaughtException']
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2']

errorTypes.map(type => {
  process.on(type, async e => {
    try {
      console.log(`process.on ${type}`)
      console.error(e)
      await consumer.disconnect()
      process.exit(0)
    } catch (_) {
      process.exit(1)
    }
  })
})

signalTraps.map(type => {
  process.once(type, async () => {
    try {
      await consumer.disconnect()
    } finally {
      process.kill(process.pid, type)
    }
  })
})

