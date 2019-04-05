use std::cmp::Ordering;
use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Node(i32, i32);

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Edge {
    source: usize,
    target: usize,
    weight: f64,
}

impl PartialEq for Edge {
    fn eq(&self, other: &Edge) -> bool {
        self.weight == other.weight
    }
}

impl PartialOrd for Edge {
    fn partial_cmp(&self, other: &Edge) -> Option<Ordering> {
        self.weight.partial_cmp(&other.weight)
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Graph {
    nodes: Vec<Node>,
    edges: Vec<Edge>,
}

#[derive(Debug, Clone)]
struct Subset {
    parent: usize,
    rank: i32,
}

fn find(subsets: &Vec<Subset>, i: usize) -> usize {
    let mut i = i;
    while subsets.get(i).expect("subset i is unavailable").parent != i {
        i = subsets.get(i).expect("subset i is unavailable 2").parent;
    }
    return i;
}

fn union(subsets: &mut Vec<Subset>, x: usize, y: usize) {
    let x_root = find(&subsets, x);
    let y_root = find(&subsets, y);

    if x_root == y_root {
        return;
    }

    if subsets[x_root].rank < subsets[y_root].rank {
        subsets[x_root].parent = y_root;
    } else if subsets[x_root].rank > subsets[y_root].rank {
        subsets[y_root].parent = x_root;
    } else {
        subsets[y_root].parent = x_root;
        subsets[x_root].rank += 1;
    }
}

pub fn compute(graph: &Graph) -> Vec<Edge> {
    let Graph{edges, nodes} = graph;
    let mut edges = edges.clone();
    edges.sort_unstable_by(|a, b| a.partial_cmp(b).unwrap());

    let mut result_edges: Vec<Edge> = Vec::new();
    let mut subsets: Vec<Subset> = Vec::new();
    for i in 0..nodes.len() {
        subsets.push(Subset{
            parent: i,
            rank: 0
        });
    }

    let mut i = 0;
    let mut e = 0;
    while e < nodes.len() - 1 {
        let next_edge = edges.get(i).expect("next edge is unavailable").clone();
        i += 1;

        let x = find(&subsets, next_edge.source);
        let y = find(&subsets, next_edge.target);
        if x != y {
            result_edges.push(next_edge);
            e += 1;
            union(&mut subsets, x, y);
        }
    }

    result_edges.to_vec()
}
