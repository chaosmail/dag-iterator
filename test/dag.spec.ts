import {INode, IEdge, iterate} from '../src/index';

describe('dagIterator::iterateDfs', () => {

  it('iterate', () => {
    
    const nodes: INode<String>[] = [
      {name: "A", data: "Node A"},
      {name: "B", data: "Node B"},
      {name: "C", data: "Node C"},
      {name: "D", data: "Node D"}
    ];

    const edges: IEdge[] = [
      {src: "A", dst: "B"},
      {src: "A", dst: "C"},
      {src: "B", dst: "C"},
      {src: "C", dst: "D"}
    ];

    var j = 0;

    iterate<String>(nodes, edges, (node, parents, i) => {
      
      switch(j) {
        case 0:
          expect(node).toEqual(nodes[0].data);
          expect(parents).toEqual([]);
          break;
        case 1:
          expect(node).toEqual(nodes[1].data);
          expect(parents).toEqual([nodes[0].data]);
          break;
        case 2:
          expect(node).toEqual(nodes[2].data);
          expect(parents).toEqual([nodes[0].data, nodes[1].data]);
          break;
        case 3:
          expect(node).toEqual(nodes[3].data);
          expect(parents).toEqual([nodes[2].data]);
          break;
        default:
          expect(false).toEqual(true);
      }

      j += 1;
    });
  });

  it('iterate with multiple starting nodes', () => {
    
    const nodes = [
      {name: "A", data: "Node A"},
      {name: "B", data: "Node B"},
      {name: "C", data: "Node C"},
      {name: "D", data: "Node D"}
    ];

    const edges = [
      {src: "A", dst: "D"},
      {src: "B", dst: "C"},
      {src: "C", dst: "D"}
    ];

    var j = 0;

    iterate<String>(nodes, edges, (node, parents, i) => {
      
      switch(j) {
        case 0:
          expect(node).toEqual(nodes[1].data);
          expect(parents).toEqual([]);
          break;
        case 1:
          expect(node).toEqual(nodes[0].data);
          expect(parents).toEqual([]);
          break;
        case 2:
          expect(node).toEqual(nodes[2].data);
          expect(parents).toEqual([nodes[0].data, nodes[1].data]);
          break;
        default:
          expect(false).toEqual(true);
      }

      j += 1;
    }, nodes[1].name);
  });

  it('iterate until node', () => {
    
    const nodes = [
      {name: "A", data: "Node A"},
      {name: "B", data: "Node B"},
      {name: "C", data: "Node C"},
      {name: "D", data: "Node D"}
    ];

    const edges = [
      {src: "A", dst: "B"},
      {src: "A", dst: "C"},
      {src: "B", dst: "C"},
      {src: "C", dst: "D"}
    ];

    var j = 0;

    iterate<String>(nodes, edges, (node, parents, i) => {
      
      switch(j) {
        case 0:
          expect(node).toEqual(nodes[0].data);
          expect(parents).toEqual([]);
          break;
        case 1:
          expect(node).toEqual(nodes[1].data);
          expect(parents).toEqual([nodes[0].data]);
          break;
        default:
          expect(false).toEqual(true);
      }

      j += 1;
    }, nodes[1].name);
  });
});