# Getting started

A family tree is a [YAML](http://yaml.org/) file. Start with a `families` collection. Every family can have `parents` and `children`.

```diff
+families:
+  - parents: [Marge, Homer]
+    children: [Bart, Lisa, Maggie]
```

## Generating

kingraph can give you `svg` (default), `png` or `dot` files.

```sh
kingraph family.yml > family.svg
kingraph family.yml -F png > family.png
kingraph family.yml -F dot > family.dot
```

## Defining names

To define their full names, add a `people` collection. This is optional—people will still be in the family tree even if they don't have a `people` record.

```diff
 families:
   - parents: [Marge, Homer]
     children: [Bart, Lisa, Maggie]
+people:
+  Marge:
+    fullname: Marjorie Bouvier Simpson
```

## Defining dates and places

You can add birth and death information to any person. Dates must be in ISO 8601 format (`YYYY-MM-DD`). An error is thrown if the death date is before the birth date.

```diff
 people:
   Marge:
     fullname: Marjorie Bouvier Simpson
+  Homer:
+    fullname: Homer Simpson
+    born: 1956-05-12
+    birthplace: Springfield
+    died: 2024-03-01
+    deathplace: Springfield Hospital
```

All four fields are optional and independent of each other.

## Second generations

To create second generations, you can simply add another record to `families`.

```diff
 families:
   - parents: [Marge, Homer]
     children: [Bart, Lisa, Maggie]
+  - parents: [Lisa, Milhouse]
+    children: [Zia]
```

## Houses

Turn a family into a house by adding a `house` name. They will show up grouped in a box.

```diff
 families:
+  - house: Stark
     parents: [Ned, Catelyn]
     children: [Arya, Rickon, Bran, Sansa, Rob]
+  - house: Lannister
     parents: [Tywin, Joanna]
     children: [Cersei, Jaime, Tyrion]
```

To add families into a house, nest the families.

```diff
 families:
   - house: Simpson
     parents: [Marge, Homer]
     children: [Bart, Lisa, Maggie]
+    families:
+      - parents: [Lisa, Milhouse]
+        children: [Zia]
```

<details>
<summary>*Why nest?*</summary>

Families can be placed as sub-families of another families. This is more of a visual designation rather than a semantic one. If the parent family is a "house", then the sub-families will show up in the same house.

It also helps to untangle your YAML file.
</details>

## Next

See [advanced usage](advanced.md) for more features.
