export interface INode {
  name: string;
  data: any;
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

export function iterate(nodes: INode[], edges: IEdge[],
                        iteratorFn: (node: INode, prev: INode[], i: number) => void) {

  const nodeStack: string[] = [];
  const nodeVisited: {[nodeName: string]: boolean} = {};
  const nodeMap = arrToObj(nodes, 'name');
  const edgeSrcMap = tuplesToObj(edges.map((d) => [d.src, d.dst] as [string, string])) as IEdgeMap;
  const edgeDstMap = tuplesToObj(edges.map((d) => [d.dst, d.src] as [string, string])) as IEdgeMap;
  
  const filterNotVisited = (d: string) => !nodeVisited.hasOwnProperty(d);
  const getLayerFromNode = (d: string) => nodeMap[d].data;

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

  let i = 0;
  nodeStack.push(nodes[0].name);

  while (nodeStack.length) {
    // Take a layer from the stack
    const node = nodeStack.pop();

    // Mark this node as visited
    nodeVisited[node] = true;

    // Collect the previous Layers
    const parentNodes = getParentNodes(node);

    // Get the layer and previous layers
    const layer = getLayerFromNode(node);
    const parentLayers = parentNodes.map(getLayerFromNode);
    
    // Call the iterator callback
    iteratorFn.call(null, layer, parentLayers, i++);

    // // Check if we reached the end layer
    // if (params.end && layer.name === params.end) {
    //   break;
    // }
    // Get all children for this layer
   
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