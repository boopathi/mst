#!/bin/sh

set -x

yum install -y openssl-devel
curl https://sh.rustup.rs -sSf | sh -s - --default-toolchain nightly -y
source ~/.cargo/env
rustup target add wasm32-unknown-unknown
cargo install wasm-pack --root ./
./bin/wasm-pack build --target web
mkdir dist
cp index.html dist
cp main.js dist
cp -r pkg dist
