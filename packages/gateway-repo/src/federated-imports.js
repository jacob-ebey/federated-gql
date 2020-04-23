import Module from 'module'
import fetch from 'node-fetch'
import path from 'path'

/** @typedef {{
 *    name: string
 *    baseUrl: string
 *  }} FederatedModuleConfig */

/**
 * @param {FederatedModuleConfig} federatedModules
 */
export async function initializeFederatedImports ({ federatedModules }) {
  // TODO: This does not work at the moment, support runtime imports from external servers
  for (const federatedModule of federatedModules) {
    const res = await fetch(`${federatedModule.baseUrl}/remoteEntry.js`)
    const code = await res.text()

    const m = new Module(federatedModule.name, module.parent)
    m.paths = Module._nodeModulePaths(path.dirname(federatedModule.name)).concat(['/'])
    m._compile(code, m.id)
    require.cache[m.id] = m

    module.parent &&
    module.parent.children &&
    module.parent.children.splice(module.parent.children.indexOf(m), 1)
    m.loaded = true
  }
}
