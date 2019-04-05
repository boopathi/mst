#!/bin/sh

curl https://sh.rustup.rs -sSf | sh -s - --default-toolchain nightly -y
source ~/.cargo/env
rustup target add wasm32-unknown-unknown
cargo install wasm-pack
wasm-pack build --target web
