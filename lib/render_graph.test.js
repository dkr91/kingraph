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
