[![Build Status](https://travis-ci.org/chaosmail/dag-iterator.svg?branch=master)](https://travis-ci.org/chaosmail/dag-iterator)

# DAG Iterator

An utility tool to traverse DAG graphs in JavaScript by depth-first search. It automatically injects the previous nodes as arguments for the current node. This can be used in Deep Learning to traverse the model graph of a DNN such as GoogLeNet.

## Usage Typescript

```ts
import * as dag from 'dag-iterator';

const nodes: dag.INode<String>[] = [
  {name: "A", data: "Node A"},
  {name: "B", data: "Node B"},
  {name: "C", data: "Node C"},
  {name: "D", data: "Node D"}
];

const edges: dag.IEdge[] = [
  {src: "A", dst: "B"},
  {src: "A", dst: "C"},
  {src: "B", dst: "C"},
  {src: "C", dst: "D"}
];

//     ---► B
//   /      |
//  A       | 
//   \      ▼
//     ---► C ---► D

dag.iterateDfs<String>(nodes, edges, (node, parents, i, depth) => {
  console.log(node, parents, i, depth);
});

/*
 * Outputs:
 * > Node A [] 0 0
 * > Node B ["Node A"] 1 1
 * > Node C (2) ["Node A", "Node B"] 2 1
 * > Node D ["Node C"] 3 2
 */

```

## Usage Browser

```html
<script src="https://unpkg.com/dag-iterator"></script>
<script>
  
  var nodes = [
    {name: "A", data: "Node A"},
    {name: "B", data: "Node B"},
    {name: "C", data: "Node C"},
    {name: "D", data: "Node D"}
  ];
  
  var edges = [
    {src: "A", dst: "B"},
    {src: "A", dst: "C"},
    {src: "B", dst: "C"},
    {src: "C", dst: "D"}
  ];

  //     ---► B
  //   /      |
  //  A       | 
  //   \      ▼
  //     ---► C ---► D

  // Iterate the graph
  dagIterator.iterateDfs(nodes, edges, function(node, parents, i, depth){
    console.log(node, parents, i, depth);
  });

  /*
   * Outputs:
   * > Node A [] 0 0
   * > Node B ["Node A"] 1 1
   * > Node C (2) ["Node A", "Node B"] 2 1
   * > Node D ["Node C"] 3 2
   */
  
  // Iterate the graph until node C
  dagIterator.iterateDfs(nodes, edges, function(node, parents, i, depth){
    console.log(node, parents, i)
  }, "C");

  /*
   * Outputs:
   * > Node A [] 0
   * > Node B ["Node A"] 1
   * > Node C (2) ["Node A", "Node B"] 2
   */

</script>
```

## Development

```sh
# Install dependencies
npm install

# Build the JS file and TS declaration
npm run build

# Run the tests
npm run test
```

## Changelog

* 0.3.0
  * Add `iterateDfs` and `iterateBfs`, add `depth` parameter in iteratorFn
* 0.2.3
  * Start traversing from multiple nodes
* 0.2.2
  * Add check if first node exists in edges
* 0.2.1
  * Add generic type to INode and iterate
* 0.1.2
  * Add until node parameter
* 0.1.1
  * Initial release

## License

The software is provided under MIT license.