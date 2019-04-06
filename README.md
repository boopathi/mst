# mst

A demo of [Kruskal's algorithm](https://en.wikipedia.org/wiki/Kruskal%27s_algorithm) for [Minimum Spanning Tree](https://en.wikipedia.org/wiki/Minimum_spanning_tree) in JS and Rust(wasm).

https://mst.boopathi.in/

## The graph

- Nodes: Generate `n` random points in the full screen canvas
- Edges: Every node is connected to every other node. `n * (n-1) / 2` edges
- Weights: The weight of an edge is the distance between the two nodes it connects

## Try it locally

### Requirements

- [Rust > 1.30.0](https://www.rust-lang.org/tools/install)
  - `curl https://sh.rustup.rs -sSf | sh`
- [wasm-pack](https://github.com/rustwasm/wasm-pack)
  - `cargo install wasm-pack`
- [configure wasm32 target for rust](https://rustwasm.github.io/docs/wasm-pack/prerequisites/non-rustup-setups.html)
  - `rustup target add wasm32-unknown-unknown`

### Build

The rust library `mst` needs to be built using `wasm-pack` with the config to output for web (this target takes care of `fetch`ing of the wasm file and the WebAssembly instantiation).

```sh
wasm-pack build --target web
```

### Run

After the wasm files are built you can verify it by looking into the `pkg/` directory, the following files -

- `pkg/mst.js`
- `pkg/mst_bg.wasm`

which will be fetched from `main.js`

Simply start a static file server to serve `index.html`

```sh
python -m SimpleHTTPServer
```

## Findings

Rust performs ~3x-4x faster for bigger graphs. For smaller ones, the performance improvement is not worth the effort - `numNodes=100` gives `8ms`(JS) to `6ms`(Rust) improvement.

```
[RUST] Took ~137ms to send input, construct Graph in Rust and compute MST for 1000 nodes with 499500 edges and serialize in Rust and deserialize in JS 999 edges
[JS] Took ~451ms to compute MST for 1000 nodes with 499500 edges
```

## License

Licensed under either of

- Apache License, Version 2.0, ([LICENSE-APACHE](LICENSE-APACHE) or http://www.apache.org/licenses/LICENSE-2.0)
- MIT license ([LICENSE-MIT](LICENSE-MIT) or http://opensource.org/licenses/MIT)

at your option.

### Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.
