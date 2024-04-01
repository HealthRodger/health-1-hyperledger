# Example Ledger Queries
Some example ledger queries to get you started.
## Timestamps
1. List all devices not updated since given timestamp

```js
const timestamp;

{
  "selector": {
    "LastUpdate": {
      "$lt": timestamp
    }
  },
  "fields": [
    "ID",
    "Name",
    "LastUpdate"
  ]
}
```

2. List all devices updated since given timestamp

```js
const timestamp;

{
  "selector": {
    "LastUpdate": {
      "$gt": timestamp
    }
  },
  "fields": [
    "ID",
    "Name",
    "LastUpdate"
  ]
}
```

3. List all available devices not updated since given timestamp

```js
const timestamp;

{
  "selector": {
    "LastUpdate": {
      "$lt": timestamp
    },
    "Available": true
  },
  "fields": [
    "ID",
    "Name",
    "LastUpdate"
  ]
}
```

4. List all non-available devices not updated since given timestamp

```js
const timestamp;

{
  "selector": {
    "LastUpdate": {
      "$lt": timestamp
    },
    "Available": false
  },
  "fields": [
    "ID",
    "Name",
    "LastUpdate"
  ]
}
```

## Departments

5. List all available devices from a given department

```js
const department;

{
  "selector": {
    "Department": department,
    "Available": true
  },
  "fields": [
    "ID",
    "Name",
    "Department"
  ]
}
```


6. List all non-available devices from a given department

```js
const department;

{
  "selector": {
    "Department": department,
    "Available": false
  },
  "fields": [
    "ID",
    "Name",
    "Department"
  ]
}
```

## Device Types

7. List all devices of a given type

```js
const type;

{
  "selector": {
    "Type": type,
  },
  "fields": [
    "ID",
    "Name",
    "Type"
  ]
}
```
<!-- 
8. List the departments with the most devices of a given type

```js
const type;

{
  "selector": {
    "Type": type,
  },
  "fields": [
    "Department",
    "Type"
  ],
  "sort": [
    {
      "Department": "asc"
    }
  ]
}
``` -->

## Other

9. List the types of devices that are most commonly available
<!--     
```js
{
    "selector": {
        "Available": true
    },
    "fields": [
        "Type",
        "Available"
    ],
    "sort": [
        {
        "Type": "asc"
        }
    ]
}
``` -->

10. List the devices that have been unavailable the longest
```js
{
    "selector": {
        "Available": false
    },
    "fields": [
        "ID",
        "Name",
        "LastUpdate"
    ],
    "sort": [
        {
        "LastUpdate": "asc"
        }
    ]
}
```