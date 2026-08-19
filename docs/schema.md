# Schema

- **[families](#family)**
  - [parents](#parents)
  - [children](#children)
  - [parents2](#parents2)
  - [children2](#children2)
  - [married](#married)
  - [divorced](#divorced)
  - [house](#house)
  - [families](#families)
- **[people](#person)**
  - [name](#name)
  - [fullname](#fullname)
  - [born](#born)
  - [died](#died)
  - [birthplace](#birthplace)
  - [deathplace](#deathplace)
  - [links](#links)
  - [class](#class)
- **[properties](#property)**
  - [name](#property-name)
  - [transfers](#transfers)
  - [class](#property-class)
- **[styles](#styles)**

## Family

> `families` (Family[])<br>
> `families[].families` (Family[])

A list of families. All properties in a Family are optional, but you have to define at least one.

```yaml
families:
  - parents: [Homer, Marge]
    children: [Bart, Lisa, Maggie]
  - parents: [Lisa, Milhouse]
    children: [Zia]
```

A typical family has `parents` and `children`, but only one is required. Every family must have at least one or more of the required properties defined (`parents`, `parents2`, `children`, `children2`).

```yaml
families:
  # Example: no children
  - parents: [Cam, Mitchell]

  # Example: siblings with unknown parents
  - children: [Haley, Luke, Alex]
```

### parents

> `families[].parents` (String[])

A list of parents. This is a list of person ID's. See [Family](#family) for an example.

### children

> `families[].children` (String[])

A list of children. See [Family](#family) for an example.

### parents2

> `families[].parents2` (String[])

A list of parents. Use this to express atypical lineage, such as step-parents or adoptive parents. See [Family](#family) for an example.

```yaml
# Cersei and Jaime are the biological parents.
# Robert is married to Cersei, and acts as the children's father.
- parents: [Cersei, Jaime]
  parents2: [Robert]
  children: [Myrcella, Joffrey]
```

### children2

> `families[].children2` (String[])

A list of children. Use this to express atypical offspring lineage, such as adoptions, illegitimate children or foster siblings. See [parents2](#parents2) for an example.


```yaml
# Jon is the adopted son of Ned and Catelyn.
- parents: [Ned, Catelyn]
  children: [Rob, Rickon, Arya, Sansa]
  children2: [Jon]
```

### married

> `families[].married` (Date)

The date the parents were married, in ISO 8601 format (`YYYY-MM-DD`). Displayed as a small `⚭` label on the family's union point. This is independent of `children` — it can be set on a family with or without children.

```yaml
families:
  - parents: [Ned, Catelyn]
    married: 1979-05-20
    divorced: 1985-11-02
    children: [Rob, Rickon, Arya, Sansa]
```

### divorced

> `families[].divorced` (Date)

The date the parents were divorced, in ISO 8601 format (`YYYY-MM-DD`). Displayed as a small `⚮` label on the family's union point, alongside `married` if given. If both are set, `divorced` must not be before `married`. See [married](#married) for an example.

There is no `widowed` field — widowhood is inferred automatically. Whenever a family has two or more `parents`/`parents2` and isn't `divorced`, kingraph checks their [`died`](#died) dates and, if one of them has died, labels the union point with `† Widowed <date>` (the earliest death date, i.e. when the survivor was widowed). A `divorced` family is never shown as widowed, even if a former spouse later died.

```yaml
families:
  - parents: [Ned, Catelyn]
    married: 1979-05-20
    children: [Rob, Rickon, Arya, Sansa]

people:
  Ned: {}
  # Catelyn's death is enough to show "† Widowed 1998-11-12" on the union point.
  Catelyn:
    died: 1998-11-12
```

### house

> `families[].house` (String)

The name of the house. If given, then a box will be drawn around the family and the sub-families inside it.

```yaml
# The [Rob, Talisa] family will be placed inside House Stark.
- house: Stark
  parents: [Ned, Catelyn]
  children: [Rob, Rickon, Arya, Sansa]
  families:
    - parents: [Rob, Talisa]
```

### families

> `families[].families` (Family[])

You can nest families inside other families. See [house](#house) for an example.

## Person

> `people{}`

Defines metadata for a person. All parameters are optional.

```yaml
people:
  Ned:
    name: Ned
    fullname: Eddard Stark
    born: 1961-05-04
    birthplace: Winterfell
    died: 1998-11-12
    deathplace: King's Landing
    class: [deceased]
```

### name

A person's name. If not present, then the person's ID will be used by default.

### fullname

A person's full name. Will be displayed in gray text.

### born

A birth date in ISO 8601 format (`YYYY-MM-DD`). Displayed in gray text prefixed with `*`.

### died

A death date in ISO 8601 format (`YYYY-MM-DD`). Displayed in gray text prefixed with `†`.

### birthplace

A place of birth. Displayed in gray text next to the birth date (or alone if `born` is not set).

### deathplace

A place of death. Displayed in gray text next to the death date (or alone if `died` is not set).

### links

An array of links. Use this to link to a person's Facebook account. If given, their names will be clickable.

### class

A list of classes for styles. These will be applied to nodes. See [styles](#styles) for more information.

## Property

> `properties` (Property[])

A list of properties (eg, a farm, house or other estate) whose ownership is passed down through the family. Each property is drawn as a small labeled node with dashed, dated arrows connecting each owner to the next.

```yaml
properties:
  - name: Simpson Family Farm
    transfers:
      - to: Abe
        date: 1955-03-01
        note: Purchased
      - from: Abe
        to: Homer
        date: 1990-07-04
        note: Inherited
      - from: Homer
        to: Bart
        date: 2025-01-01
```

### Property name

> `properties[].name` (String)

The name of the property. Displayed on its origin node, and used to identify it in error messages.

### transfers

> `properties[].transfers` (Transfer[])

An ordered list of ownership transfers, each with `to` (required), `from` (optional) and `date` (optional).

- `to` — the person ID receiving the property.
- `from` — the person ID the property is transferred from. If omitted, it defaults to the previous transfer's `to` (i.e. the chain continues automatically); on the very first transfer, omitting it draws the arrow from the property's own origin node instead of another person, representing how it was first acquired.
- `date` — the date of the transfer, in ISO 8601 format (`YYYY-MM-DD`). Shown as the edge's label. Transfers within a chain must be in chronological order; kingraph will throw an error otherwise.
- `note` — an optional short note (eg `Purchased`, `Inherited`, `Sold`) shown underneath the date.

```yaml
properties:
  - name: Lake House
    transfers:
      - to: Ned
        date: 1980-01-01
      # `from` is inferred as "Ned" since it continues the chain
      - to: Catelyn
        date: 2005-04-10
```

### Property class

> `properties[].class` (String[])

A list of classes for styles, applied to both the property's origin node and its transfer edges. See [styles](#styles). The default styles for these are the `:property` and `:property-link` classes.

## Styles

> `styles{}`

A key-value object with `class` names as keys, and their GraphViz attributes as values. Refer to Graphviz's [attributes documentation](http://graphviz.org/doc/info/attrs.html) for attributes.

```yml
people:
  Ned:
    class: [deceased]
styles:
  deceased:
    color: red
    penwidth: 0.25
```
