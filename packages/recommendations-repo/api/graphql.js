import { ApolloServer } from 'apollo-server-micro'

import schema from '../src/schema'

const server = new ApolloServer({ schema })

module.exports = server.createHandler()
