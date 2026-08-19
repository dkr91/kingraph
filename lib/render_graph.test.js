const test = require('tape')
const renderGraph = require('./render_graph')

test('renderGraph() property transfers', t => {
  const data = {
    people: { A: {}, B: {}, C: {} },
    properties: [
      {
        name: 'Old Farm',
        transfers: [
          { to: 'A', date: '1955-03-01', note: 'Purchased' },
          { from: 'A', to: 'B', date: '1990-07-04' },
          { to: 'C', date: '2020-01-01' } // `from` inferred as B
        ]
      }
    ]
  }

  const dot = renderGraph(data)

  t.ok(dot.includes('# Property: Old Farm'), 'includes a comment for the property')
  t.ok(dot.includes('label=<<b>Old Farm</b>>'), 'renders the origin node label')
  t.ok(/property_0_old_farm -> A \[/.test(dot), 'draws an edge from the origin to the first owner')
  t.ok(/A -> B \[/.test(dot), 'draws an edge between owners')
  t.ok(/B -> C \[/.test(dot), 'infers "from" as the previous owner when omitted')
  t.ok(dot.includes('1955-03-01<br/>Purchased'), 'labels the edge with the date and note')
  t.ok(dot.includes('1990-07-04'), 'labels the edge with the date only when there is no note')

  t.end()
})

test('renderGraph() property transfers: missing "to"', t => {
  const data = {
    people: { A: {} },
    properties: [
      { name: 'Old Farm', transfers: [{ date: '1955-03-01' }] }
    ]
  }

  t.throws(() => renderGraph(data), /missing a "to" person/, 'throws when a transfer has no "to"')
  t.end()
})

test('renderGraph() property transfers: out-of-order dates', t => {
  const data = {
    people: { A: {}, B: {} },
    properties: [
      {
        name: 'Old Farm',
        transfers: [
          { to: 'A', date: '2000-01-01' },
          { from: 'A', to: 'B', date: '1990-01-01' }
        ]
      }
    ]
  }

  t.throws(() => renderGraph(data), /happens before the previous transfer/, 'throws when transfers are out of chronological order')
  t.end()
})

test('renderGraph() with no properties', t => {
  const data = { people: { A: {} } }
  t.doesNotThrow(() => renderGraph(data), 'does not throw when "properties" is absent')
  t.end()
})

test('renderGraph() family married/divorced', t => {
  const data = {
    people: { A: {}, B: {}, C: {} },
    families: [
      { parents: ['A', 'B'], married: '1980-06-15', divorced: '1995-03-02', children: ['C'] }
    ]
  }

  const dot = renderGraph(data)

  t.ok(dot.includes('⚭ 1980-06-15'), 'labels the union node with the marriage date')
  t.ok(dot.includes('⚮ 1995-03-02'), 'labels the union node with the divorce date')
  t.end()
})

test('renderGraph() family married without children', t => {
  const data = {
    people: { A: {}, B: {} },
    families: [
      { parents: ['A', 'B'], married: '2001-09-09' }
    ]
  }

  const dot = renderGraph(data)

  t.ok(dot.includes('⚭ 2001-09-09'), 'labels the union node with the marriage date even without children')
  t.notOk(dot.includes('⚮'), 'does not render a divorce marker when "divorced" is absent')
  t.end()
})

test('renderGraph() family divorced before married', t => {
  const data = {
    people: { A: {}, B: {} },
    families: [
      { parents: ['A', 'B'], married: '2000-01-01', divorced: '1999-01-01' }
    ]
  }

  t.throws(() => renderGraph(data), /divorced date .* is before married date/, 'throws when divorced predates married')
  t.end()
})

test('renderGraph() automatic widowed marker from a spouse\'s death date', t => {
  const data = {
    people: { A: { died: '2010-04-01' }, B: {} },
    families: [
      { parents: ['A', 'B'], married: '1980-06-15' }
    ]
  }

  const dot = renderGraph(data)

  t.ok(dot.includes('† Widowed 2010-04-01'), 'labels the union node with the widowed date, inferred from the death date')
  t.end()
})

test('renderGraph() widowed picks the earliest of two deaths', t => {
  const data = {
    people: { A: { died: '2015-01-01' }, B: { died: '2005-06-01' } },
    families: [
      { parents: ['A', 'B'] }
    ]
  }

  const dot = renderGraph(data)

  t.ok(dot.includes('† Widowed 2005-06-01'), 'uses the earlier death date as the widowed date')
  t.notOk(dot.includes('Widowed 2015-01-01'), 'does not use the later death date as the widowed date')
  t.end()
})

test('renderGraph() no widowed marker when divorced', t => {
  const data = {
    people: { A: { died: '2010-04-01' }, B: {} },
    families: [
      { parents: ['A', 'B'], married: '1980-06-15', divorced: '1995-03-02' }
    ]
  }

  const dot = renderGraph(data)

  t.notOk(dot.includes('Widowed'), 'does not label a divorced family as widowed even if a former spouse died')
  t.end()
})

test('renderGraph() no widowed marker for a single parent', t => {
  const data = {
    people: { A: { died: '2010-04-01' } },
    families: [
      { parents: ['A'], children: ['B'] }
    ]
  }

  const dot = renderGraph(data)

  t.notOk(dot.includes('Widowed'), 'does not label a single-parent family as widowed (no surviving spouse)')
  t.end()
})

test('renderGraph() widowed date before married date', t => {
  const data = {
    people: { A: { died: '1970-01-01' }, B: {} },
    families: [
      { parents: ['A', 'B'], married: '1980-06-15' }
    ]
  }

  t.throws(() => renderGraph(data), /widowed date .* is before married date/, 'throws when the death predates the marriage')
  t.end()
})
