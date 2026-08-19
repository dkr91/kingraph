const join = require('./join')
const slugify = require('./slugify')
const normalize = require('./normalize')
const applyStyle = require('./apply_style')
const idGenerator = require('./id_generator')

const COLORS = require('./defaults/colors')

const getId = idGenerator()

const LINE = Array(76).join('#')
const LINE2 = '# ' + Array(74).join('-')

function render (data) {
  data = normalize(data)

  return join([
    'digraph G {',
    { indent: [
      'edge [',
      { indent: applyStyle(data, [':edge']) },
      ']',
      '',
      'node [',
      { indent: applyStyle(data, [':node']) },
      ']',
      '',
      applyStyle(data, [':digraph']),
      renderHouse(data, data, []),
      renderProperties(data)
    ]},
    '}'
  ], { indent: '  ' })
}

function renderHouse (data, house, path) {
  const people = house.people || {}
  const families = house.families || []
  const houses = house.houses || {}

  const meat = [
    // People and families
    families.map((f, id) => renderFamily(data, house, f || {}, path.concat([id]))),
    Object.keys(people).map(id => renderPerson(data, house, people[id] || {}, path.concat([id])))
  ]

  if (path.length === 0) {
    return meat
  } else {
    const name = house.name || path[path.length -1 ]

    return [
      '',
      LINE,
      `# House ${path}`,
      LINE,
      '',
      `subgraph cluster_${slugify(path)} {`,
      { indent: [
        `label=<<b>${name}</b>>`,
        applyStyle(data, [':house', `:house-${path.length}`]),
        '',
        meat
      ] },
      '}'
    ]
  }
}

function subRow (text) {
  return `<tr><td align="center"><font point-size="10" color="#aaaaaa">${text}</font></td></tr>`
}

// js-yaml safeLoad parses YYYY-MM-DD as a Date object; convert it back to ISO string
function formatDate (val) {
  if (val instanceof Date) return val.toISOString().slice(0, 10)
  return val
}

function toDate (val) {
  return val instanceof Date ? val : new Date(String(val))
}

function formatAge (born, died) {
  const b = born instanceof Date ? born : new Date(String(born))
  const d = died instanceof Date ? died : new Date(String(died))

  let years = d.getUTCFullYear() - b.getUTCFullYear()
  let months = d.getUTCMonth() - b.getUTCMonth()
  let days = d.getUTCDate() - b.getUTCDate()

  if (days < 0) {
    months -= 1
    days += new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 0)).getUTCDate()
  }
  if (months < 0) {
    years -= 1
    months += 12
  }

  const parts = []
  if (years > 0) parts.push(`${years}y`)
  if (months > 0) parts.push(`${months}m`)
  if (days > 0) parts.push(`${days}d`)
  return 'Age: ' + (parts.length ? parts.join(' ') : '0d')
}

function renderPerson (data, house, person, path) {
  let id = path[path.length - 1]
  let href = person.links && person.links[0]
  let label

  const hasNameInfo = person.name || person.fullname
  const hasBirth = person.born || person.birthplace
  const hasDeath = person.died || person.deathplace

  if (person.born && person.died) {
    const bornDate = toDate(person.born)
    const diedDate = toDate(person.died)
    if (diedDate < bornDate) {
      throw new Error(`"${id}": death date (${formatDate(person.died)}) is before birth date (${formatDate(person.born)})`)
    }
  }

  if (hasNameInfo || hasBirth || hasDeath) {
    const nameRow = `<tr><td align="center">${person.name || id}</td></tr>`
    const fullnameRow = hasNameInfo ? subRow(person.fullname || person.name) : ''
    const birthRow = hasBirth ? subRow(['*', person.born && formatDate(person.born), person.birthplace].filter(Boolean).join(' ')) : ''
    const deathRow = hasDeath ? subRow(['†', person.died && formatDate(person.died), person.deathplace].filter(Boolean).join(' ')) : ''
    const ageRow = (person.born && person.died) ? subRow(formatAge(person.born, person.died)) : ''

    label = `<<table align="center" border="0" cellpadding="0" cellspacing="2" width="4">${nameRow}${fullnameRow}${birthRow}${deathRow}${ageRow}</table>>`
  } else {
    label = id
  }

  return [
    `"${id}" [`,
      { indent: [
        applyStyle(data, person.class || [], { before: { label, href } })
      ] },
    ']' ]
}

/*
 * Renders property/farm ownership transfers.
 *
 * Each property owns a chain of transfers (`from` -> `to`, on a `date`).
 * The chain is drawn as edges linking each owner directly to the next,
 * labeled with the transfer date (and an optional note). The very first
 * transfer (which has no `from`) is drawn from a small "origin" node
 * labeled with the property's name.
 */

function renderProperties (data) {
  const properties = data.properties || []
  return properties.map((property, idx) => renderProperty(data, property, idx))
}

function renderProperty (data, property, idx) {
  const name = property.name || `Property ${idx + 1}`
  const transfers = property.transfers || []
  const classes = property.class || []
  const origin = `property_${idx}_${slugify(property.name || String(idx))}`
  const color = COLORS[getId('property') % COLORS.length]

  if (transfers.length === 0) return []

  let prevOwner = null
  let prevDate = null
  let prevDateRaw = null

  return [
    '',
    LINE2,
    `# Property: ${name}`,
    LINE2,
    '',
    `${origin} [`,
    { indent: applyStyle(data, [':property'].concat(classes), {
      before: { label: `<<b>${escapeHtml(name)}</b>>` }
    }) },
    ']',
    transfers.map((transfer, tIdx) => renderTransfer(transfer, tIdx))
  ]

  function renderTransfer (transfer, tIdx) {
    const to = transfer.to
    if (!to) {
      throw new Error(`Property "${name}": transfer #${tIdx + 1} is missing a "to" person`)
    }

    const from = transfer.from || prevOwner
    const continuesChain = !transfer.from || transfer.from === prevOwner
    const date = transfer.date && (transfer.date instanceof Date ? transfer.date : new Date(String(transfer.date)))

    if (date && prevDate && continuesChain && date < prevDate) {
      throw new Error(`Property "${name}": transfer to "${to}" (${formatDate(transfer.date)}) happens before the previous transfer (${formatDate(prevDateRaw)})`)
    }

    const source = from ? escape(from) : origin
    const target = escape(to)
    const labelParts = [date && formatDate(transfer.date), transfer.note].filter(Boolean)
    const label = labelParts.length ? `<${labelParts.map(escapeHtml).join('<br/>')}>` : ''

    prevOwner = to
    if (continuesChain && date) {
      prevDate = date
      prevDateRaw = transfer.date
    }

    return [
      `${source} -> ${target} [`,
      { indent: applyStyle(data, [':property-link'].concat(classes), {
        before: { label, color }
      }) },
      ']'
    ]
  }
}

/*
 * Escapes a string for use inside an HTML-like label ("<...>").
 */

function escapeHtml (str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/*
 * For comments
 */

function summarizeFamily (family) {
  const parents = []
    .concat(family.parents || [])
    .concat(family.parents2 || [])
    .filter(Boolean)

  const children = []
    .concat(family.children || [])
    .concat(family.children2 || [])
    .filter(Boolean)

  return `[${parents.join(', ')}] -> [${children.join(', ')}]`
}

/*
 * Renders a family subgraph
 */

function renderFamily (data, house, family, path) {
  const slug = slugify(path)
  const color = COLORS[getId('family') % COLORS.length]
  const parents = family.parents || []
  const parents2 = family.parents2 || []
  const children = family.children || []
  const children2 = family.children2 || []
  const affinity = family.affinity || []
  const housename = family.house

  const hasParents = (parents.length + parents2.length) > 0
  const hasChildren = (children.length + children2.length) > 0
  const hasManyChildren = (children.length + children.length) > 1

  const union = `union_${slug}`
  const kids = `siblings_${slug}`

  return [
    '',
    `subgraph cluster_family_${slug} {`,
    style([':family']),
    { indent: [
      housename && renderHousePrelude(),
      // renderPeople(),
      renderSubFamilies(),
      '',
      `# Family ${summarizeFamily(family)}`,
      LINE2,
      '',
      hasParents && renderParents(),
      hasParents && hasChildren && renderLink(),
      hasChildren && renderKids(),
      (hasManyChildren > 1) && renderKidLinks()
    ] },
    '}'
  ]

  function style (classes, before, after) {
    return { indent: applyStyle(data, classes, { before: (before || {}), after: (after || {}) }) }
  }

  function renderPeople () {
    const list = []
      .concat(parents)
      .concat(children)

    return `{${list.map(escape).join('; ')}}`
  }

  function renderHousePrelude () {
    let label = `<<b>${housename}</b>>`
    let labelhref = family.links && family.links[0]

    return [
      applyStyle(data, [':house'], { before: { label, labelhref } })
    ]
  }

  function renderSubFamilies () {
    // Reverse the families, because we assume people put "deeper" families last.
    // You want to render the deeper families first so that their parents are placed
    // in those families, rather than the parent families.
    const families = [].concat(family.families || []).reverse()
    return families.map((f, idx) => renderFamily(data, house, f, path.concat(idx)))
  }

  function renderParents () {
    return [
      `${union} [`,
      style([':union'], { fillcolor: color }, renderMarriageInfo()),
      ']',
      '',
      parents.length > 0 && [
        `{${parents.map(escape).join(', ')}} -> ${union} [`,
        style([':parent-link'], { color }),
        ']'
      ],
      parents2.length > 0 && [
        `{${parents2.map(escape).join(', ')}} -> ${union} [`,
        style([':parent-link', ':parent2-link'], { color }),
        ']'
      ]
    ]
  }

  /*
   * Renders a family's `married`/`divorced` dates (independent of whether
   * the family has `parents`/`children`) as a small label on the union node.
   *
   * Widowhood needs no explicit field: it's inferred automatically from the
   * `died` dates already on `people`, whenever the couple wasn't divorced.
   */

  function renderMarriageInfo () {
    if (family.married && family.divorced) {
      const marriedDate = toDate(family.married)
      const divorcedDate = toDate(family.divorced)
      if (divorcedDate < marriedDate) {
        throw new Error(`Family "${summarizeFamily(family)}": divorced date (${formatDate(family.divorced)}) is before married date (${formatDate(family.married)})`)
      }
    }

    const widowedDate = family.divorced ? null : findWidowedDate()

    if (family.married && widowedDate && toDate(widowedDate) < toDate(family.married)) {
      throw new Error(`Family "${summarizeFamily(family)}": widowed date (${formatDate(widowedDate)}) is before married date (${formatDate(family.married)})`)
    }

    const rows = []
    if (family.married) rows.push(subRow('⚭ ' + escapeHtml(formatDate(family.married))))
    if (family.divorced) rows.push(subRow('⚮ ' + escapeHtml(formatDate(family.divorced))))
    if (widowedDate) rows.push(subRow('† Widowed ' + escapeHtml(formatDate(widowedDate))))

    if (rows.length === 0) return {}

    return {
      shape: 'box',
      label: `<<table align="center" border="0" cellpadding="0" cellspacing="0">${rows.join('')}</table>>`
    }
  }

  /*
   * A couple is widowed once one of them has died, as long as they weren't
   * divorced first. Returns the earliest `died` date among the family's
   * `parents`/`parents2` (the date the survivor became a widow/widower), or
   * null if there's no surviving spouse (fewer than 2 people) or no deaths.
   */

  function findWidowedDate () {
    const spouses = parents.concat(parents2)
    if (spouses.length < 2) return null

    const deaths = spouses
      .map(id => (data.people || {})[id])
      .filter(Boolean)
      .map(person => person.died)
      .filter(Boolean)

    if (deaths.length === 0) return null

    return deaths.reduce((earliest, died) => toDate(died) < toDate(earliest) ? died : earliest)
  }

  function renderLink () {
    return [
      `${union} -> ${kids} [`,
      style([':parent-link', ':parent-child-link'], { color: color }),
      ']' ]
  }

  function renderKids () {
    return [
      `${kids} [`,
      style([':children'], { fillcolor: color }),
      `]`,

      children.length > 0 && [
        `${kids} -> {${children.map(escape).join(', ')}} [`,
        style([':child-link'], { color }),
        ']'
      ],

      children2.length > 0 && [
        `${kids} -> {${children2.map(escape).join(', ')}} [`,
        style([':child-link', ':child2-link'], { color }),
        ']'
      ]

    ]
  }

  function renderKidLinks () {
    return [
      `{"${children.concat(children2).join('" -> "')}" [`,
      { indent: [
        applyStyle(data, [':child-links'], { before: {
          style: 'invis'
        }})
      ] },
      ']' ]
  }
}

/*
 * Escapes a name into a node name.
 */

function escape (str) {
  if (/^[A-Za-z]+$/.test(str)){
    return str
  } else {
    return JSON.stringify(str)
  }
}

/*
 * Export
 */

module.exports = render
