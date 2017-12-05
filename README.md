# DAG Iterator

An utility tool to traverse DAG graphs in JavaScript by depth-first search. It automatically injects the previous nodes as arguments for the current node. This can be used in Deep Learning to traverse the model graph of a DNN such as GoogLeNet.

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

  // Iterate the graph
  dagIterator.iterate(nodes, edges, function(node, parents, i){
    console.log(node, parents, i)
  });

  /*
   * Outputs:
   * > Node A [] 0
   * > Node B ["Node A"] 1
   * > Node C (2) ["Node A", "Node B"] 2
   * > Node D ["Node C"] 3
   */
  
  // Iterate the graph until node C
  dagIterator.iterate(nodes, edges, function(node, parents, i){
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


## License

The software is provided under MIT license.