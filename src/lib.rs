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

    #[wasm_bindgen(js_namespace=performance)]
    fn now() -> f64;
}

macro_rules! console_log {
   ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

#[wasm_bindgen]
pub fn compute_mst(val: &JsValue) -> JsValue {
    let serde_start = now();
    let graph: Graph = val.into_serde().unwrap();
    console_log!("[RUST] Took {:?}ms serde deserialize.", now() - serde_start);

    let compute_start = now();
    let result = compute(&graph);
    console_log!("[RUST] Took {:?}ms to compute MST.", now() - compute_start);

    JsValue::from_serde(&result).unwrap()
}
