# 身份标签逻辑与 Soul API

## 1. 身份标签判定矩阵

| 标签 | 判定逻辑 | 核心指标 | 数据源 |
|------|----------|----------|--------|
| **DAO Governor** | 治理发起者：Tally 有提案记录 | `proposalCount > 0` | Tally API（可扩展） |
| **Active Voter** | 近 6 月内 Snapshot 投票 | `voteCount > 5` | Snapshot GraphQL |
| **Buidler 🛠️** | 合约部署者 / Gitcoin Passport | `isDeployer === true` | Alchemy（可扩展） |
| **Degen ⚡** | 高频交易 | `txCount > 500` | Alchemy |
| **Whale 🐋** | 蓝筹 NFT 或净值 > $50k | 蓝筹合约 / Debank | Alchemy + Debank（可扩展） |
| **Alpha Hunter** | L2 空投 / OAT | `hasAirdropNFT` | Galxe（可扩展） |
| **Social Star** | Farcaster 粉丝 > 500 | `followerCount > 500` | Web3.bio |
| **Newbie 🐣** | 钱包 < 30 天且交互少 | `accountAge < 30d` | Alchemy（可扩展） |
| **Explorer** | 默认兜底 | - | - |

## 2. 多源数据采集 (The Miner)

- **backend/src/services/identityMiner.js**：`getRawIdentityData(address)`
  - **Web3.bio**：`GET https://api.web3.bio/profile/{address}`，ENS/Farcaster/Lens 聚合
  - **Snapshot**：GraphQL `votes(where: { voter })`
  - **Alchemy**（可选）：`eth_getTransactionCount` + `alchemy_getNFTs`，需 `ALCHEMY_API_KEY`

## 3. 灵魂分类 (The Brain)

- **backend/src/services/soulBrain.js**：`classifySoul(rawData)` → `[{ label, color }]`
  - 输入：Miner 返回的 `raw`
  - 输出：标签数组，无则返回 `[{ label: 'Explorer', color: 'gray' }]`

## 4. API

- **GET /api/soul/:address**
  - `address`：0x 地址或 ENS（如 `vitalik.eth`）
  - 响应：`{ address, raw: { social, txCount, nftsCount, voteCount, proposalCount }, tags }`

## 5. 环境变量（后端）

- `WEB3_BIO_API_KEY`（可选）：Web3.bio 限流放宽
- `ALCHEMY_API_KEY`（可选）：启用 txCount + NFT、账户年龄、合约部署者等，否则相关项为 0 / 空
- `TALLY_API_KEY`（可选）：启用 Tally 治理提案数（proposalCount），否则为 0

## 6. 参考

- [Web3.bio API](https://api.web3.bio/)
- [Snapshot GraphQL](https://docs.snapshot.org/)
- [Alchemy](https://docs.alchemy.com/)
- Debank / Hoot.it 可后续接入净值与更多画像
