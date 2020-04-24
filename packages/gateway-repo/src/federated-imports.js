import Module from 'module'
import path from 'path'

const AWS = require('aws-sdk')

function nameResolution (resolutor) {
  let enabled = true

  const originalResolveFilename = Module._resolveFilename

  Module._resolveFilename = function (request, _parent) {
    const match = enabled && resolutor(request, _parent)
    if (match) {
      return match
    }

    return originalResolveFilename.apply(this, arguments)
  }

  return () => {
    enabled = false
  }
}

nameResolution((requireName, parent) => {
  const whatDidIRequire = path.resolve(path.dirname(parent.id), requireName)

  const toCheck = typeof __non_webpack_require__ !== 'undefined' ? __non_webpack_require__.cache : require.cache

  if (toCheck[whatDidIRequire]) {
    return whatDidIRequire
  }
  const andWithJS = whatDidIRequire + '.js'
  if (toCheck[andWithJS]) {
    return andWithJS
  }
})

function requireFromString (code, filename, opts) {
  if (typeof filename === 'object') {
    opts = filename
    filename = undefined
  }

  opts = opts || {}
  filename = filename || ''

  opts.appendPaths = opts.appendPaths || []
  opts.prependPaths = opts.prependPaths || []

  if (typeof code !== 'string') {
    throw new Error(`code must be a string, not ${typeof code}`)
  }
  const paths = Module._nodeModulePaths(path.dirname(filename))

  const { parent } = module

  const m = new Module(filename, parent)

  const toSet = typeof __non_webpack_require__ !== 'undefined' ? __non_webpack_require__.cache : require.cache

  m.filename = filename
  m.paths = [].concat(opts.prependPaths).concat(paths).concat(opts.appendPaths)
  require.cache[m.id] = m
  toSet[m.id] = m
  m._compile(code, filename)

  parent &&
    parent.children &&
    parent.children.splice(parent.children.indexOf(m), 1)
  m.loaded = true // added this, don't know if i need it

  return m.exports
}

/** @typedef {{
 *    name: string
 *    bucketName: string
 *  }} FederatedModuleConfig */

/**
 * @param {FederatedModuleConfig} federatedModules
 */
export async function initializeFederatedImports ({ federatedModules }) {
  const s3Client = new AWS.S3({
    endpoint: 'http://localhost:4572',
    sslEnabled: false,
    s3ForcePathStyle: true
  })

  for (const federatedModule of federatedModules) {
    const remoteEntryObject = await s3Client
      .getObject({ Bucket: federatedModule.bucketName, Key: 'remoteEntry.js' })
      .promise()
    const streamedRemoteEntry = remoteEntryObject.Body.toString()
    const remoteEntryFilePath = path.join(process.cwd(), federatedModule.name, 'remoteEntry.js')
    const remoteEntry = requireFromString(streamedRemoteEntry, remoteEntryFilePath, {
      appendPaths: ['/']
    })

    for (const toOverride in remoteEntry.exposedModules) {
      const [eID, rID] = remoteEntry.exposedModules[toOverride]
      console.log(toOverride, eID, rID)

      const streamedObject = await s3Client
        .getObject({ Bucket: federatedModule.bucketName, Key: `${eID}.js` })
        .promise()
      const streamed = streamedObject.Body.toString()
      const streamedFilePath = path.join(process.cwd(), federatedModule.name, `${eID}.js`)
      const streamedModule = requireFromString(streamed, streamedFilePath, {
        appendPaths: ['/']
      })

      // TODO: Add to webpack runtime
    }
  }
}
