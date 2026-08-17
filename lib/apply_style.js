const DEFAULT_STYLES = require('./defaults/styles')

/**
 * Returns attributes for a given class
 *
 *     data = { styles: { ':root': { color: 'gold', dir: 'none' } } }
 *     applyStyle(data, [':root'])
 *     => ['color="gold"', 'dir="none"']
 */

function applyStyle (data, classes, options) {
  if (!options) options = {}

  const styles = data.styles || {}

  function applyStyles (acc, stylesheet) {
    return Object.keys(stylesheet).reduce((styles, key) => {
      if (classes.indexOf(key) === -1) return styles
      return Object.assign({}, styles, stylesheet[key])
    }, acc)
  }

  let result = {}
  result = Object.assign({}, result, options.before || {})
  result = applyStyles(result, DEFAULT_STYLES)
  result = applyStyles(result, data.styles || {})
  result = Object.assign({}, result, options.after || {})
  return renderStyle(result, options)
}

/**
 * Renders key/value into an attribute string
 *
 *     renderStyle({ color: 'gold', dir: 'none' ])
 *     => ['color="gold"', 'dir="none"']
 */

function renderStyle (properties, options) {
  return Object.keys(properties).map(key => {
    const val = properties[key]
    if (val == null) return
    return `${key}=${stringify(val)}`
  }).filter(s => s != null)
}

function stringify (val) {
  if (typeof val === 'string' && /^<.*>$/.test(val)) {
    return val
  } else {
    return JSON.stringify(val)
  }
}

/*
 * Export
 */

module.exports = applyStyle
