import { buildFederatedSchema } from '@apollo/federation'
import { gql } from 'apollo-server'

const exampleProductRecommendations = [
  {
    __typename: 'Product',
    sku: 'r1'
  },
  {
    __typename: 'Product',
    sku: 'r2'
  }
]

const schema = buildFederatedSchema([{
  typeDefs: gql`
    extend type Product @key(fields: "sku") {
      sku: ID! @external
      recommendations: [Product]
    }
  `,
  resolvers: {
    Product: {
      recommendations: (_, { sku }) => exampleProductRecommendations,
      __resolveReference: ({ sku }) => ({ recommendations: exampleProductRecommendations, sku })
    }
  }
}])

export default schema
