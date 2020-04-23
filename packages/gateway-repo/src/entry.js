import { ApolloServer } from 'apollo-server'

// import { initializeFederatedImports } from './federated-imports'
import { createFederatedGateway } from './FederatedGateway'

async function entry () {
  // await initializeFederatedImports({
  //   federatedModules: [
  //     {
  //       name: 'gql_accounts',
  //       baseUrl: 'http://localhost:5000'
  //     }
  //   ]
  // })

  const gateway = await createFederatedGateway({
    federatedServiceList: [
      {
        name: 'gql_pdp',
        schema: (await import('gql_pdp/schema')).default
      },
      {
        name: 'gql_products',
        schema: (await import('gql_products/schema')).default
      },
      {
        name: 'gql_recommendations',
        schema: (await import('gql_recommendations/schema')).default
      }
    ],
    __exposeQueryPlanExperimental: true
  })

  const server = new ApolloServer({
    gateway,
    playground: true,
    introspection: true,
    subscriptions: false,
    engine: false
  })

  server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`)
  })
}

export default entry
