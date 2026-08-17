/*
 * Converts to PNG.
 */

function toPng (svgXml) {
  const Resvg = require('@resvg/resvg-js').Resvg
  return new Resvg(svgXml).render().asPng()
}

module.exports = toPng
