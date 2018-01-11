import {INode, IEdge, iterate, iterateDfs, iterateBfs} from '../src/index';

describe('dagIterator::iterate', () => {

  it('iterate', () => {

    const nodes: INode<String>[] = [
      {name: "A", data: "Node A"},
      {name: "B", data: "Node B"},
      {name: "C", data: "Node C"},
      {name: "D", data: "Node D"},
      {name: "E", data: "Node E"}
    ];

    //  A --- B --- C
    //   \     \ 
    //    ----- D --- E

    const edges: IEdge[] = [
      {src: "A", dst: "B"},
      {src: "A", dst: "D"},
      {src: "B", dst: "C"},
      {src: "B", dst: "D"},
      {src: "D", dst: "E"}
    ];

    let j = 0;
    iterate<String>(nodes, edges, (node, parents, i, depth) => {
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
          expect(node).toEqual(nodes[3].data);
          expect(parents).toEqual([nodes[0].data, nodes[1].data]);
          break;
        case 3:
          expect(node).toEqual(nodes[4].data);
          expect(parents).toEqual([nodes[3].data]);
          break;
        case 4:
          expect(node).toEqual(nodes[2].data);
          expect(parents).toEqual([nodes[1].data]);
          break;
        default:
          expect(false).toEqual(true);
      }
      j++;
    });
  });

  it('iterate until node', () => {
    
    const nodes = [
      {name: "A", data: "Node A"},
      {name: "B", data: "Node B"},
      {name: "C", data: "Node C"},
      {name: "D", data: "Node D"}
    ];

    //  A --- B 
    //   \     \ 
    //    ----- C --- D

    const edges = [
      {src: "A", dst: "B"},
      {src: "A", dst: "C"},
      {src: "B", dst: "C"},
      {src: "C", dst: "D"}
    ];

    let j = 0;
    iterate<String>(nodes, edges, (node, parents, i, depth) => {
      
      switch(i) {
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
      j++;
    }, nodes[1].name);
  });
});

describe('dagIterator::iterateDfs', () => {

  it('iterate', () => {

    const nodes: INode<String>[] = [
      {name: "A", data: "Node A"},
      {name: "B", data: "Node B"},
      {name: "C", data: "Node C"},
      {name: "D", data: "Node D"},
      {name: "E", data: "Node E"},
      {name: "F", data: "Node F"},
      {name: "G", data: "Node G"}
    ];

    //                G
    //               /
    //  A --- B --- C --- D
    //         \
    //          ----- E --- F

    const edges: IEdge[] = [
      {src: "A", dst: "B"},
      {src: "B", dst: "C"},
      {src: "C", dst: "D"},
      {src: "B", dst: "E"},
      {src: "E", dst: "F"},
      {src: "C", dst: "G"}
    ];

    let j = 0;
    iterateDfs<String>(nodes, edges, (node, parents, i, depth) => {
      
      switch(i) {
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
          expect(parents).toEqual([nodes[1].data]);
          break;
        case 3:
          expect(node).toEqual(nodes[6].data);
          expect(parents).toEqual([nodes[2].data]);
          break;
        case 4:
          expect(node).toEqual(nodes[3].data);
          expect(parents).toEqual([nodes[2].data]);
          break;
        case 5:
          expect(node).toEqual(nodes[4].data);
          expect(parents).toEqual([nodes[1].data]);
          break;
        case 6:
          expect(node).toEqual(nodes[5].data);
          expect(parents).toEqual([nodes[4].data]);
          break;
        default:
          expect(false).toEqual(true);
      }
      j++;
    });
  });

  it('iterate with multiple starting nodes', () => {
    
    const nodes = [
      {name: "A", data: "Node A"},
      {name: "B", data: "Node B"},
      {name: "C", data: "Node C"},
      {name: "D", data: "Node D"},
      {name: "E", data: "Node E"},
      {name: "F", data: "Node F"},
      {name: "G", data: "Node G"}
    ];

    //     G
    //   / 
    //  A --- D --- E
    //         \ 
    //    B --- C --- F
    //
    //  A => D => E => G => B => C => F

    const edges = [
      {src: "A", dst: "D"},
      {src: "A", dst: "G"},      
      {src: "B", dst: "C"},
      {src: "D", dst: "C"},
      {src: "D", dst: "E"},
      {src: "C", dst: "F"}
    ];

    let j = 0;
    iterateDfs<String>(nodes, edges, (node, parents, i, depth) => {
      
      switch(j) {
        case 0:
          expect(node).toEqual(nodes[0].data);
          expect(parents).toEqual([]);
          expect(i).toEqual(0);
          expect(depth).toEqual(0);
          break;
        case 1:
          expect(node).toEqual(nodes[3].data);
          expect(parents).toEqual([nodes[0].data]);
          expect(i).toEqual(1);
          expect(depth).toEqual(1);
          break;
        case 2:
          expect(node).toEqual(nodes[4].data);
          expect(parents).toEqual([nodes[3].data]);
          expect(i).toEqual(2);
          expect(depth).toEqual(2);
          break;
        case 3:
          expect(node).toEqual(nodes[6].data);
          expect(parents).toEqual([nodes[0].data]);
          expect(i).toEqual(3);
          expect(depth).toEqual(1);
          break;          
        case 4:
          expect(node).toEqual(nodes[1].data);
          expect(parents).toEqual([]);
          expect(i).toEqual(4);
          expect(depth).toEqual(0);
          break;
        case 5:
          expect(node).toEqual(nodes[2].data);
          expect(parents).toEqual([nodes[1].data, nodes[3].data]);
          expect(i).toEqual(5);
          expect(depth).toEqual(2);
          break;
        case 6:
          expect(node).toEqual(nodes[5].data);
          expect(parents).toEqual([nodes[2].data]);
          expect(i).toEqual(6);
          expect(depth).toEqual(3);
          break;
        default:
          expect(false).toEqual(true);
      }
      j++;
    });
  });
});

describe('dagIterator::iterateBfs', () => {
  
  it('iterate with multiple starting nodes', () => {
    
    const nodes = [
      {name: "A", data: "Node A"},
      {name: "B", data: "Node B"},
      {name: "C", data: "Node C"},
      {name: "D", data: "Node D"},
      {name: "E", data: "Node E"},
      {name: "F", data: "Node F"},
      {name: "G", data: "Node G"}
    ];

    //  A --- D --- E
    //         \ 
    //    B --- C --- F
    //     \
    //      G
    //
    // B => A => C => G => D => F => E
    const edges = [
      {src: "A", dst: "D"},
      {src: "B", dst: "C"},
      {src: "B", dst: "G"},
      {src: "C", dst: "D"},
      {src: "D", dst: "E"},
      {src: "C", dst: "F"}
    ];

    let j = 0;
    iterateBfs<String>(nodes, edges, (node, parents, i, depth) => {
      
      switch(j) {
        case 0:
          expect(node).toEqual(nodes[1].data);
          expect(parents).toEqual([]);
          expect(i).toEqual(0);
          expect(depth).toEqual(0);
          break;
        case 1:
          expect(node).toEqual(nodes[0].data);
          expect(parents).toEqual([]);
          expect(i).toEqual(1);
          expect(depth).toEqual(0);
          break;
        case 2:
          expect(node).toEqual(nodes[2].data);
          expect(parents).toEqual([nodes[1].data]);
          expect(i).toEqual(2);
          expect(depth).toEqual(1);
          break;
        case 3:
          expect(node).toEqual(nodes[6].data);
          expect(parents).toEqual([nodes[1].data]);
          expect(i).toEqual(3);
          expect(depth).toEqual(1);
          break;
        case 4:
          expect(node).toEqual(nodes[3].data);
          expect(parents).toEqual([nodes[0].data, nodes[2].data]);
          expect(i).toEqual(4);
          expect(depth).toEqual(2);
          break;
        case 5:
          expect(node).toEqual(nodes[5].data);
          expect(parents).toEqual([nodes[2].data]);
          expect(i).toEqual(5);
          expect(depth).toEqual(2);
          break;
        case 6:
          expect(node).toEqual(nodes[4].data);
          expect(parents).toEqual([nodes[3].data]);
          expect(i).toEqual(6);
          expect(depth).toEqual(3);
          break;
        default:
          expect(false).toEqual(true);
      }
      j++;
    });
  });
});