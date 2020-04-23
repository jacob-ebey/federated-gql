import { ApolloGateway, RemoteGraphQLDataSource } from '@apollo/gateway'
import { ApolloServer } from 'apollo-server'
import { parse } from 'graphql/language/parser'

/** @typedef {import("apollo-server").GraphQLSchema} GraphQLSchema */
/** @typedef {import("@apollo/gateway").GatewayConfig} GatewayConfig */

/**
 * @typedef {GatewayConfig & {
 *   federatedServiceList: {
 *     name: string
 *     schema: GraphQLSchema
 *   }[]
 * }} FederatedGatewayConfig
 */

/**
 * Create a new federated gateway.
 * @param {FederatedGatewayConfig} config
 */
export async function createFederatedGateway ({
  federatedServiceList,
  ...rest
}) {
  const localServices = []
  const dataSources = {}
  for (const federatedService of federatedServiceList) {
    const federatedServer = new ApolloServer({
      schema: federatedService.schema,
      introspection: true,
      subscriptions: false
    })

    const introspectionResult = await federatedServer.executeOperation({
      query: 'query __ApolloGetServiceDefinition__ { _service { sdl } }'
    })
    const federatedSchema = introspectionResult.data._service.sdl
    const typeDefs = parse(federatedSchema)

    localServices.push({
      name: federatedService.name,
      typeDefs
    })

    dataSources[federatedService.name] = new RemoteGraphQLDataSource({
      process ({ request }) {
        return federatedServer.executeOperation(request)
      }
    })
  }

  return new ApolloGateway({
    ...rest,
    localServiceList: [
      ...(rest.localServiceList || []),
      ...localServices
    ],
    buildService ({ name, url }) {
      return dataSources[name] || new RemoteGraphQLDataSource({ url })
    }
  })
}
