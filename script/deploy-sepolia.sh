#!/usr/bin/env bash
# 部署 MushiRegistry 到 Sepolia（私钥通过环境变量传入，不要提交 .env 中的私钥）
set -e
export ETH_RPC_URL="${ETH_RPC_URL:-https://rpc.sepolia.org}"
export PRIVATE_KEY="${PRIVATE_KEY:?Set PRIVATE_KEY}"
forge script script/Deploy.s.sol:DeployMushiRegistry --rpc-url "$ETH_RPC_URL" --broadcast
