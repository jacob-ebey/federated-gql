import { buildFederatedSchema } from '@apollo/federation'
import { gql } from 'apollo-server'

const examplePdpPage = {}

const schema = buildFederatedSchema([{
  typeDefs: gql`
    extend type Product @key(fields: "sku") {
      sku: ID! @external
    }

    type PdpPage {
      product: Product
    }

    extend type Query {
      pdp(sku: ID!): PdpPage
    }
  `,
  resolvers: {
    Query: {
      pdp: (_, { sku }) => ({
        ...examplePdpPage,
        product: {
          __typename: 'Product',
          sku
        }
      })
    }
  }
}])

export default schema
