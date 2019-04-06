extern crate wasm_bindgen;
extern crate serde;
extern crate serde_json;

mod mst;

use wasm_bindgen::prelude::*;
use mst::*;

#[wasm_bindgen]
extern {
    #[wasm_bindgen(js_namespace=console)]
    fn log(s: &str);
}

macro_rules! console_log {
   ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

// An interface to get nodes and edges from JavaScript world
#[wasm_bindgen]
#[derive(Debug)]
pub struct JsGraph {
    nodes: Vec<Node>,
    edges: Vec<Edge>
}

#[wasm_bindgen]
impl JsGraph {
    pub fn new() -> JsGraph {
        JsGraph {
            nodes: vec![],
            edges: vec![]
        }
    }

    pub fn add_node(&mut self, x: i32, y: i32) {
        &self.nodes.push(Node::new(x, y));
    }

    pub fn add_edge(&mut self, source: usize, target: usize, weight: f64) {
        &self.edges.push(Edge::new(source, target, weight));
    }

    pub fn compute_mst(&self) -> JsValue {
        let JsGraph{nodes, edges} = self;
        let graph: Graph = Graph::new(nodes.to_vec(), edges.to_vec());
        let result = compute(&graph);
        JsValue::from_serde(&result).unwrap()
    }

    pub fn print(&self) {
        console_log!("{:?}", self);
    }
}
