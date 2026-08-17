function normalize (data) {
  data = Object.assign({}, data)
  return data
}

/**
 * Normalizes people options.
 */

function normalizePeople (people, options) {
  return map(people, p => normalizePerson(p, options))
}

/**
 * Normalizes person names and such.
 */

function normalizePerson (person, options) {
  return person
}

module.exports = normalize
