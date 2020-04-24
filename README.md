# Federated GraphQL

An example of using Webpack 5 Module Federation to orchestrate an Apollo Federation Gateway.

## Getting started

```shell
> docker-compose up -d
> yarn
> yarn setup:aws
> yarn build
> yarn deploy
> yarn start
```

### Example query

```graphql
query Test {
  pdp(sku: "rofl") {
    product {
      ...Product
    }
  }
}

fragment Product on Product {
  sku
  name
  price {
    ...ProductPrice
  }
  recommendations {
    sku
    name
    price {
    	...ProductPrice
    }
  }
}

fragment ProductPrice on ProductPrice {
  currencyCode
  listPrice {
    ...PriceRange
  }
  salePrice {
    ...PriceRange
  }
}

fragment PriceRange on ProductPriceRange {
  high
  low
}
```
