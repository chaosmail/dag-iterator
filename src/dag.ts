export type NodeName = string;
export type Tuple<T, K> = [T, K];

export interface INode<T> {
  name: NodeName;
  data: T;
}

export interface IEdge {
  src: NodeName;
  dst: NodeName;
}

export enum TraversalMode {
  DFS,
  BFS,
}

export interface IIteratorOptions {
  untilNode?: NodeName;
  traversalMode: TraversalMode;
}

export type IteratorFn<T> = (node: T, prev: T[], i: number, d: number) => void;

/**
 * Traverse a Directed Acyclic Graph via Depth-first search
 * @param nodes - array of nodes defining the graph
 * @param edges - array of edges defining the graph
 * @param func - iterator callback
 * @param untilNode - iterate until specific node
 */
export function iterateDfs<T>(nodes: INode<T>[], edges: IEdge[], func: IteratorFn<T>, untilNode?: NodeName) {
  const options: IIteratorOptions = {
    traversalMode: TraversalMode.DFS,
    untilNode: untilNode,
  };
  return _iterate(nodes, edges, func, options);
}

/**
 * Traverse a Directed Acyclic Graph via Breadth-first search
 * @param nodes - array of nodes defining the graph
 * @param edges - array of edges defining the graph
 * @param func - iterator callback
 * @param untilNode - iterate until specific node
 */
export function iterateBfs<T>(nodes: INode<T>[], edges: IEdge[], func: IteratorFn<T>, untilNode?: NodeName) {
  const options: IIteratorOptions = {
    traversalMode: TraversalMode.BFS,
    untilNode: untilNode,
  };
  return _iterate(nodes, edges, func, options);
}

/**
 * Compatibility for old API 0.2.3, defaults to iterateDfs
 */
export function iterate<T>(nodes: INode<T>[], edges: IEdge[], func: IteratorFn<T>, untilNode?: NodeName) {
  return iterateDfs(nodes, edges, func, untilNode);
}

interface INodeMap<T> {
  [nodeName: string]: INode<T>;
}

interface INodeVisited {
  [nodeName: string]: number;
}

interface IEdgeMap {
  [nodeName: string]: NodeName[];
}

interface IChildCountMap {
  [nodeName: string]: number;
}

/**
 * Traverse a graph defined by nodes and edges
 * @param {INode<T>[]} nodes - array of nodes
 * @param {IEdge[]} edges - array of edges
 * @param {IteratorFn<T>} func - iterator callback
 * @param {IIteratorOptions} options - iterator options
 */
function _iterate<T>(nodes: INode<T>[], edges: IEdge[], func: IteratorFn<T>, options: IIteratorOptions) {
  
  if (nodes.length === 0 || edges.length === 0) {
    return;
  }

  // depending on TraversalMode, this acts as stack or queue
  const nodeStorage: NodeName[] = [];

  // Stores the layer number for each node
  const nodeVisited: INodeVisited = {};
  const nodeMap: INodeMap<T> = arrToObj(nodes, 'name');

  // map containing all outgoing edges per node
  const edgeSrcMap = tuplesToObj<NodeName, NodeName>(edges.map((edge) =>
    [edge.src, edge.dst] as Tuple<NodeName, NodeName>)) as IEdgeMap;
  
  // map containing all incoming edges per node
  const edgeDstMap = tuplesToObj<NodeName, NodeName>(edges.map((edge) =>
    [edge.dst, edge.src] as Tuple<NodeName, NodeName>)) as IEdgeMap;
  
    // map containing the node and its children count first
  const childNodeCountMap = tuplesToObj<NodeName, number>(
    nodes.map((n) => 
        [n.name, getChildNodes(n.name).length] as Tuple<NodeName, number>)) as IChildCountMap;

  // Initialize the storage with all starting nodes
  Array.prototype.push.apply(nodeStorage, getFirstNodes(options.traversalMode));

  let i = 0;

  while (nodeStorage.length) {
    // Take the next element from the stack/queue
    const node = getNextNode(nodeStorage, options.traversalMode);

    // Collect the previous Layers
    const parentNodes = getParentNodes(node);

    // Mark this node as visited and record its layer count as
    // max(parents) + 1
    nodeVisited[node] = parentNodes.reduce((prev, curr) => {
      return Math.max(prev, nodeVisited[curr] + 1);
    }, 0);

    // Get the layer and previous layers
    const nodeData = getDataFromNode(node);
    const parentNodesData = parentNodes.map(getDataFromNode);
    
    // Call the iterator callback
    func.call(null, nodeData, parentNodesData, i++, nodeVisited[node]);

    // Check if we reached the end layer
    if (options.untilNode && node == options.untilNode) {
      break;
    }
    
    // Only check adjacent nodes that have
    // not been visited yet
    getChildNodes(node, true)
        // Iterate the child node with more dependencies
        .sort((nodeA, nodeB) => sortByChildCount(nodeA, nodeB, options.traversalMode))
        .forEach((childNode) => {
      // Check if there are still any unvisited parents
      // of the next child which need to be visited first
      const unvisitedParents = getParentNodes(childNode, true);

      // All previous parents have been visited
      if (unvisitedParents.length === 0) {
        // Add the layer to the stack/queue
        nodeStorage.push(childNode);
      }
    });
  }

  /**
   * Find the starting nodes
   * Starting nodes have outgoing edges but no incoming edge
   * @return {NodeName[]} array of starting nodes
   */
  function getFirstNodes(mode: TraversalMode): NodeName[] {
    return nodes.filter((node) => {
      return edgeSrcMap.hasOwnProperty(node.name) && !edgeDstMap.hasOwnProperty(node.name);
    })
    .map(node => node.name)
    // Iterate the first node with more dependencies first
    .sort((nodeA, nodeB) => sortByChildCount(nodeA, nodeB, mode));
  }

  function sortByChildCount(nodeA: NodeName, nodeB: NodeName, mode: TraversalMode): number {
    return mode === TraversalMode.BFS ? 
        childNodeCountMap[nodeB] - childNodeCountMap[nodeA] :
        childNodeCountMap[nodeA] - childNodeCountMap[nodeB];
  } 
  /**
   * Returns the next node from the array arr
   * depending on TraversalMode set in the options
   * @param  {NodeName[]} arr - array of nodes
   * @param  {TraversalMode} traversalMode - DFS or BFS
   * @return {NodeName} next node
   */
  function getNextNode(arr: NodeName[], traversalMode: TraversalMode): NodeName {
    return traversalMode === TraversalMode.DFS ? arr.pop() : arr.shift();
  }

  /**
   * Returns all parent nodes of a current node
   * @param {NodeName} nodeName - current node
   * @param {boolean=false} onlyUnvisited - flag to return only unvisited nodes
   * @return {NodeName[]} array of parent nodes
   */
  function getParentNodes(nodeName: NodeName, onlyUnvisited: boolean = false): NodeName[] {
    let parentNodes = edgeDstMap[nodeName] || [] as NodeName[];
    return onlyUnvisited === false ? parentNodes : parentNodes.filter(filterNotVisited);
  }

  /**
   * Returns all child nodes of a current node
   * @param {NodeName} nodeName - current node
   * @param {boolean=false} onlyUnvisited - flag to return only unvisited nodes
   * @return {NodeName[]} array of child nodes
   */
  function getChildNodes (nodeName: NodeName, onlyUnvisited: boolean = false): NodeName[] {
    let childNodes = edgeSrcMap[nodeName] || [] as NodeName[];
    return onlyUnvisited === false ? childNodes : childNodes.filter(filterNotVisited);
  }

  /**
   * Filter function to filter unvisited nodes
   * @param  {NodeName} nodeName
   * @return {boolean}
   */
  function filterNotVisited(nodeName: NodeName): boolean {
    return !nodeVisited.hasOwnProperty(nodeName);
  }

  /**
   * Return the data from a node
   * @param  {NodeName} nodeName
   * @return {T} node data
   */
  function getDataFromNode(nodeName: NodeName): T {
    return nodeMap[nodeName].data as T;
  }
}

/**
 *  Converts an array of tuples to an object. All properties are arrays.
 *  [[a,b], [a,c], [c,d]] => {a: [b,c], c: [d]}
 */
function tuplesToObj<T, K> (tuples: Tuple<T, K>[]): Object {
  return tuples.reduce((prev: any, curr: Tuple<T, K>) => {
    // load tuple [key,val] pair
    let key = curr[0], val = curr[1];
    // combine old and new value to an array
    prev[key] = prev.hasOwnProperty(key) ? [].concat(prev[key], val) : [val];
    // return the object
    return prev;
  }, {});
}

/**
 *  Converts an array of objects to an object using the property attr.
 *  Only properties with multiple elements are arrays.
 *  [{t:a,d:b}, {t:a,d:c}, {t:c,d:d} => {a: [b,c], c: d}
 */
function arrToObj (arr: any[], attr: string): any {
  return arr.reduce((prev: any, curr: any) => {
    // load [key,val] pair
    let key = curr[attr], val = curr;
    // combine old and new value to an array
    prev[key] = prev.hasOwnProperty(key) ? [].concat(prev[key], val) : val;
    // return the object
    return prev;
  }, {});
}
