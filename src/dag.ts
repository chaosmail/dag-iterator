export interface INode<T> {
  name: string;
  data: T;
}

export interface IEdge {
  src: string;
  dst: string;
}

interface IEdgeMap {
  [nodeName: string]: string[];
}

export enum TraversalMode {
  DFS,
  BFS,
}

export interface IIteratorOptions {
  untilNode?: string;
  traversalMode: TraversalMode;
}

type tuple = [string, string];

const tuplesToObj = (d: tuple[]) => d.reduce((r: any, c: tuple) => {
  // load tuple [key,val] pair
  let key = c[0], val = c[1];
  // combine old and new value to an array
  r[key] = r.hasOwnProperty(key) ? [].concat(r[key], val) : [val];
  // return the object
  return r;
}, {});

const arrToObj = (d: any[], attr: string) => d.reduce((r: any, c: any) => {
  // load [key,val] pair
  let key = c[attr], val = c;
  // combine old and new value to an array
  r[key] = r.hasOwnProperty(key) ? [].concat(r[key], val) : val;
  // return the object
  return r;
}, {});

export type IteratorFn<T> = (node: T, prev: T[], i: number, d: number) => void;

/**
 * Traverse a Directed Acyclic Graph via Depth-first search
 * @arg nodes array of nodes describing the graph
 * @arg edges array of edges describing the graph
 * @arg func iterator callback
 * @arg untilNode iterate until specific node
 */
export function iterateDfs<T>(nodes: INode<T>[], edges: IEdge[], func: IteratorFn<T>, untilNode?: string) {
  const options: IIteratorOptions = {
    traversalMode: TraversalMode.DFS,
    untilNode: untilNode,
  };
  return _iterate(nodes, edges, func, options);
}

/**
 * Traverse a Directed Acyclic Graph via Breadth-first search
 * @arg nodes array of nodes describing the graph
 * @arg edges array of edges describing the graph
 * @arg func iterator callback
 * @arg untilNode iterate until specific node
 */
export function iterateBfs<T>(nodes: INode<T>[], edges: IEdge[], func: IteratorFn<T>, untilNode?: string) {
  const options: IIteratorOptions = {
    traversalMode: TraversalMode.BFS,
    untilNode: untilNode,
  };
  return _iterate(nodes, edges, func, options);
}

/**
 * Compatibility for old API 0.2.3, defaults to DFS
 */
export function iterate<T>(nodes: INode<T>[], edges: IEdge[], func: IteratorFn<T>, untilNode?: string) {
  return iterateDfs(nodes, edges, func, untilNode);
}

function _iterate<T>(nodes: INode<T>[], edges: IEdge[], func: IteratorFn<T>, options: IIteratorOptions) {
  
  if (nodes.length === 0 || edges.length === 0) {
    return;
  }

  // depending on TraversalMode, this acts as stack or queue
  const nodeStorage: string[] = [];

  // Stores the layer number for each node
  const nodeVisited: {[nodeName: string]: number} = {};
  const nodeMap = arrToObj(nodes, 'name');
  const edgeSrcMap = tuplesToObj(edges.map((d) => [d.src, d.dst] as [string, string])) as IEdgeMap;
  const edgeDstMap = tuplesToObj(edges.map((d) => [d.dst, d.src] as [string, string])) as IEdgeMap;
  
  const filterNotVisited = (d: string) => !nodeVisited.hasOwnProperty(d);
  const getLayerFromNode = (d: string) => nodeMap[d].data;

  const getNextNode = (arr: string[]) => {
    return options.traversalMode === TraversalMode.DFS ? arr.pop() : arr.shift();
  }

  // Find the nodes that is the only the src of any edges.
  const getFirstNodes = () => {
    return nodes.filter((node) => {
      return edgeSrcMap.hasOwnProperty(node.name) && !edgeDstMap.hasOwnProperty(node.name);
    })
    .map(node => node.name);
  }

  const getParentNodes = (d: string, unvisited: boolean = false) => {
    let parentKeys = edgeDstMap[d] as string[];
    let parentNodes = parentKeys === undefined ? [] : parentKeys;
    return unvisited === false ? parentNodes : parentNodes.filter(filterNotVisited);
  }
  const getChildNodes = (d: string, unvisited: boolean = false) => {
    let childKeys = edgeSrcMap[d] as string[];
    let childNodes =  childKeys === undefined ? [] : childKeys;
    return unvisited === false ? childNodes : childNodes.filter(filterNotVisited);
  }

  // Initialize the storage with all starting nodes
  Array.prototype.push.apply(nodeStorage, getFirstNodes());

  let i = 0;

  while (nodeStorage.length) {
    // Take the next element from the stack/queue
    const node = getNextNode(nodeStorage);

    // Collect the previous Layers
    const parentNodes = getParentNodes(node);

    // Mark this node as visited and record its layer count as
    // max(parents) + 1
    nodeVisited[node] = parentNodes.reduce((prev, curr) => {
      return Math.max(prev, nodeVisited[curr] + 1);
    }, 0);

    // Get the layer and previous layers
    const layer = getLayerFromNode(node);
    const parentLayers = parentNodes.map(getLayerFromNode);
    
    // Call the iterator callback
    func.call(null, layer, parentLayers, i++, nodeVisited[node]);

    // Check if we reached the end layer
    if (options.untilNode && node == options.untilNode) {
      break;
    }
    
    // Only check adjacent nodes that have
    // not been visited yet
    getChildNodes(node, true).forEach((childNode) => {
      // Check if there are still any unvisited parents
      // of the next child which need to be visited first
      const unvisitedParents = getParentNodes(childNode, true);

      // All previous parents have been visited
      if (unvisitedParents.length === 0) {
        // Add the layer to the stack
        nodeStorage.push(childNode);
      }
    });
  }
}
