#!/bin/sh

set -x

yum install -y openssl-devel
curl https://sh.rustup.rs -sSf | sh -s - --default-toolchain nightly -y
source ~/.cargo/env
rustup target add wasm32-unknown-unknown
curl -L -o wasm-pack.tar.gz 'https://github.com/rustwasm/wasm-pack/releases/download/v0.8.1/wasm-pack-v0.8.1-x86_64-unknown-linux-musl.tar.gz'
tar xvzf wasm-pack.tar.gz
./wasm-pack-v0.8.1-x86_64-unknown-linux-musl/wasm-pack build --target web
mkdir dist
cp index.html dist
cp main.js dist
cp -r pkg dist
