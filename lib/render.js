const renderGraph  = require('./render_graph')

/*
 * Renders data into various formats.
 *
 * @param String format Can be `dot`, `svg`, `png` or `png-image`.
 *
 * Always returns a Promise. Graphviz is loaded as WebAssembly, which can only
 * be instantiated asynchronously, so even `dot` is resolved via a Promise for
 * consistency. (`{ async: true }` is accepted but no longer needed.)
 */

function render (data, options) {
  const format = options && options.format || 'svg'

  const dot = renderGraph(data)
  if (format === 'dot') return Promise.resolve(dot)

  return toSvg(dot).then(svg => {
    if (format === 'svg') return svg

    if (format === 'png') return require('./to_png')(svg)
    if (format === 'png-image') return require('./to_png_image')(svg)
  })
}

/*
 * Runs Graphviz over a `dot` source.
 */

function toSvg (dot) {
  return require('@viz-js/viz').instance()
    .then(viz => viz.renderString(dot, { format: 'svg', engine: 'dot' }))
}

/*
 * Export
 */

module.exports = render
