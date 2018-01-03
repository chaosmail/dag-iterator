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

export function iterate<T>(nodes: INode<T>[], edges: IEdge[],
                        iteratorFn: (node: T, prev: T[], i: number) => void, untilNode?: string) {
  
  if (nodes.length === 0 || edges.length === 0) {
    return;
  }

  const nodeStack: string[] = [];
  // Stores the layer number for each node
  const nodeVisited: {[nodeName: string]: number} = {};
  const nodeMap = arrToObj(nodes, 'name');
  const edgeSrcMap = tuplesToObj(edges.map((d) => [d.src, d.dst] as [string, string])) as IEdgeMap;
  const edgeDstMap = tuplesToObj(edges.map((d) => [d.dst, d.src] as [string, string])) as IEdgeMap;
  
  const filterNotVisited = (d: string) => !nodeVisited.hasOwnProperty(d);
  const getLayerFromNode = (d: string) => nodeMap[d].data;


/**
 * Find the nodes that is the only the src of any edges.
 */
  const getFirstNodes = () => {
    return nodes.filter((node) => {
        return edgeSrcMap.hasOwnProperty(node.name) &&
        !edgeDstMap.hasOwnProperty(node.name);
    }).map(node => node.name);
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

  // Initialize the stacks with all the nodes that have no parents.
  Array.prototype.push.apply(nodeStack, getFirstNodes());

  while (nodeStack.length) {
    // Take the latest layer from the stack
    const node = nodeStack.pop();

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
    iteratorFn.call(null, layer, parentLayers, nodeVisited[node]);

    // Check if we reached the end layer
    if (untilNode && node == untilNode) {
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
        nodeStack.push(childNode);
      }
    });
  }
}
