const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const bodyParser = require('body-parser')
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express')
const { makeExecutableSchema } = require('graphql-tools')
const typeDefs = require('./typeDefs/todo')
const resolvers = require('./resolvers/todo')
const schema = makeExecutableSchema({ typeDefs, resolvers })
const keys = require('./config')
require('./models/todo')
const Todo = mongoose.model('todo')
const models = { Todo }
const app = express()

if (process.env.NODE_ENV !== 'production') {
  app.use('*', cors({ origin: 'http://localhost:3000' }))
}

app.use(
  '/graphql',
  bodyParser.json(),
  graphqlExpress(req => ({
    schema,
    context: {
      models
    }
  }))
)

app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }))

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'))
  app.get('*', (req, res) => {
    res.sendFile(path.resolve('client', 'build', 'index.html'))
  })
}

app.listen(keys.PORT, () => {
  console.log('Server running on port 3001')
})
