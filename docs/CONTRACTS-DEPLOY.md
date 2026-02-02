# Mushi 合约部署（Foundry）

本仓库使用 **Foundry** 作为智能合约开发与部署框架。

## 目录结构

```
├── foundry.toml      # Foundry 配置
├── src/              # Solidity 合约
│   └── MushiRegistry.sol
├── script/           # 部署脚本
│   └── Deploy.s.sol
└── lib/              # 依赖（需安装 forge-std）
```

## 一、部署到 Sepolia 测试网

### 1. 环境准备

1. **安装 Foundry**

   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

2. **安装 forge-std**

   ```bash
   cd /path/to/Mushi_social
   forge install foundry-rs/forge-std
   ```

3. **配置 .env**

   在项目根目录复制 `.env.example` 为 `.env`，并填写：

   ```bash
   cp .env.example .env
   ```

   必填：

   - **PRIVATE_KEY**：部署者钱包私钥（可从 MetaMask 导出，或使用测试网专用钱包）。无 `0x` 或有 `0x` 均可。
   - **ETH_RPC_URL**：Sepolia RPC，任选其一：
     - 公共：`https://rpc.sepolia.org`
     - Alchemy：`https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY`（[Alchemy](https://www.alchemy.com/) 注册后创建 Sepolia App）
     - Infura：`https://sepolia.infura.io/v3/YOUR_KEY`

   可选：

   - **MUSHI_VERSION** / **MUSHI_APP_URI**：MushiRegistry 构造函数参数，不填则用默认值。
   - **ETHERSCAN_API_KEY**：在 [Etherscan](https://etherscan.io/myapikey) 获取，用于 `npm run deploy:sepolia:verify` 验证合约。

### 2. 编译

```bash
forge build
```

### 3. 部署到 Sepolia

```bash
# 仅部署（广播交易）
npm run deploy:sepolia
```

或直接使用 forge（需先 `source .env` 或 export 变量）：

```bash
source .env   # 或 export PRIVATE_KEY=... ETH_RPC_URL=...
forge script script/Deploy.s.sol:DeployMushiRegistry --rpc-url $ETH_RPC_URL --broadcast
```

### 4. 部署并在 Etherscan 上验证

```bash
npm run deploy:sepolia:verify
```

或：

```bash
forge script script/Deploy.s.sol:DeployMushiRegistry --rpc-url $ETH_RPC_URL --broadcast --verify
```

需在 `.env` 中设置 `ETHERSCAN_API_KEY`。

### 5. 部署成功后

控制台会输出类似：

```
MushiRegistry deployed at: 0x...
Version: 1.0.0
AppURI: https://mushi.social
```

将合约地址保存下来，可供前端或后端配置使用。Sepolia 浏览器：<https://sepolia.etherscan.io/>。

---

## 二、其他命令

```bash
# 测试
forge test

# 指定链部署（示例：主网）
export ETH_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
forge script script/Deploy.s.sol:DeployMushiRegistry --rpc-url $ETH_RPC_URL --broadcast
```

## 三、当前合约

- **MushiRegistry**：最小化注册合约，存 `version` 与 `appURI`，可由 owner 更新，供前端或后端读取配置。
