import { buildFederatedSchema } from '@apollo/federation'
import { gql } from 'apollo-server'

const exampleProduct = {
  name: 'Some Pants',
  price: {
    currencyCode: 'USD',
    listPrice: {
      high: '$98.64'
    }
  }
}

const schema = buildFederatedSchema([{
  typeDefs: gql`
    type ProductPriceRange {
      high: String!
      low: String
    }

    type ProductPrice {
      currencyCode: String!
      listPrice: ProductPriceRange!
      salePrice: ProductPriceRange
    }

    type Product @key(fields: "sku") {
      sku: ID!
      name: String!
      price: ProductPrice!
    }

    extend type Query {
      product(sku: ID!): Product
    }
  `,
  resolvers: {
    Query: {
      product: (_, { sku }) => ({ ...exampleProduct, sku })
    },
    Product: {
      __resolveReference: ({ sku }) => ({ ...exampleProduct, sku })
    }
  }
}])

export default schema
