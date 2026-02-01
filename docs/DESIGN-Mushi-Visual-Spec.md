# Sabai Mushi 视觉与交互设计规范

**参考产品**: [Blink](https://blinkmap.com/en) — 朋友在地图上、check in、bump、audiostickers、take over territory  
**Moodboard**: [Bioluminescent Forest](https://www.pinterest.com/search/pins/?q=bioluminescent%20forest&rs=typed) — 发光森林、湿润土壤、孢子光感

---

## 1. 基础形态：成长阶段 (Evolution Stages)

根据钱包「年龄」（第一笔交易时间）决定蘑菇的基础大小与形态。

| 阶段 | 条件 | 视觉特征 |
|------|------|----------|
| **孢子 (Spore)** | 钱包年龄 < 30 天 | 半透明、漂浮的球体，带有微弱脉动光 |
| **幼苗 (Sprout)** | 交互协议数 < 3（可用 txCount 等近似） | 刚破土的小蘑菇，颜色较浅，可带未脱落蛋壳 |
| **成熟 (Mature)** | 活跃用户（其余） | 标准 3D 蘑菇，完整菌盖+菌柄，可挂装饰件 |

**数据来源**: 后端 `raw.accountAgeDays`、`raw.txCount` 等；前端据此计算 `evolutionStage`。

---

## 2. 人格特征：视觉组件映射 (Persona Components)

将 `classifySoul` 输出的标签转化为 3D 装饰/材质表现：

| 身份标签 (Tag) | 视觉特征 (Visual Element) | 设计建议 |
|----------------|---------------------------|----------|
| **Whale 🐋** | 金色粒子/光环 | 蘑菇周围环绕发光金色孢子粉末，体积略放大 |
| **Degen ⚡** | 电感紫 & 闪电 | 菌盖高饱和紫，周身动态微小电流特效 |
| **DAO Governor** | 议员披风/头饰 | 顶部极简几何冠冕，或菌柄丝绒披风 |
| **Buidler 🛠️** | 像素化/工具包 | 材质局部像素化，或身背半透明数字工具箱 |
| **Social Star** | 彩色虹光 | 菌盖表面珍珠镭射（Holographic）色泽 |
| **Newbie 🐣** | 蛋壳/半透明 | 底部未脱落蛋壳，整体果冻感、透明度高 |
| **Explorer** | 默认 | 基础蘑菇，无额外装饰 |

---

## 3. 环境互动：清迈限定 (Chiang Mai Special Edition)

体现 **Sabai**（泰语 Chill）内核，基于 LBS 的地理渲染：

- **Sabai 状态**: 用户在清迈（H3 网格）停留 > 24h，蘑菇颜色向低饱和度「大地色/森林绿」偏移（如 `#2D5A27`）。
- **热力/菌丝**: 多名 Mushi 物理靠近（如 Yellow Coworking），地图底层绘制**发光菌丝连线**（Mycelium），连接彼此坐标。

---

## 4. 交互反馈 (Interaction UI)

- **Ping (打招呼)**: 对方蘑菇全身震动，向外扩散一圈**发光孢子波纹**。
- **X402 咨询中**: 正在付费咨询的蘑菇被一层**淡蓝色能量罩**包裹，表示「忙碌/共生」状态。

---

## 5. 技术实现：1+N 模块化与 Three.js

### 5.1 建模策略

- **1 个 Base 蘑菇**: 统一 Low-poly 模型，保证 Three.js 性能。
- **N 个外挂组件**: 根据 Soul 标签动态加载 `.gltf` 装饰（冠冕、粒子、光环等）。

### 5.2 Three.js 动态参数（标签 → 材质/Shader）

| 标签 | 材质/Shader 属性 | Three.js 实现建议 |
|------|------------------|-------------------|
| **Degen ⚡** | Emissive 自发光 | `emissiveIntensity` 随时间交替，脉动感 |
| **Whale 🐋** | Particle System | `THREE.Points` 在模型周围漂浮粒子 |
| **Social Star** | Iridescence 虹彩 | `metalness: 0.9`，`roughness: 0.1`，镭射感 |
| **Newbie 🐣** | Opacity | `transparent: true`，`opacity` 在 0.4–0.7 震荡 |
| **Sabai (Chiang Mai)** | Color Gradient | Lerp 将基础色平滑过渡到森林绿 `#2D5A27` |

### 5.3 环境与灯光

- **地图背景**: `StandardMaterial` + 深色高光贴图，模拟清迈雨后「湿润土壤」。
- **动态菌丝**: 两 Soul 在 LBS 上靠近时，用 `THREE.CatmullRomCurve3` 生成发光曲线连接两坐标。

---

## 6. 用户自建身份层 (User-Defined Layer)

### 6.1 基础信息

- **Display Name**: 自定义昵称；若有 ENS/Lens 可自动填入并展示标识。
- **性别倾向 (Gender Expression)**  
  - 视觉: 三种 Mushi 轮廓（曲线型 / 方正型 / 中性流体型）。  
  - 社交: 仅后端匹配参考，不强制展示。

### 6.2 兴趣标签 (Custom Hobby Tags)

链上标签外，用户可手动添加 3–5 个生活化标签，以**悬浮孢子**形式围绕蘑菇。

- **互动**: 两 Mushi 靠近且存在**相同手动标签**时，两菇之间产生微弱**电火花连接**。
- **推荐池**: #RockClimbing #Surfing #DigitalNomad #CoffeeLover #CrossFit #JigsawPuzzles 等。

### 6.3 实时状态 (Status Mode)

- **Chill (Sabai)**: 默认。蘑菇放松呼吸律动，「欢迎偶遇」。
- **Focus (Deep Work)**: 外层半透明薄膜，「正在专注，暂不咨询」。
- **Help (Looking for Collaboration)**: 头顶信号灯光，适合黑客松找合伙人。

---

## 7. 与现有代码的衔接

- **Soul 数据**: `GET /api/soul/:address` 返回 `raw`（需含 `accountAgeDays` 以算 evolution stage）与 `tags`。
- **前端**: 用 `raw.accountAgeDays`、`raw.txCount` 计算 `evolutionStage`（spore / sprout / mature）；用 `tags` 查表驱动 Persona 视觉与 1+N 装饰加载。
- **地图**: MapView 当前为 Mapbox 2D；菌丝连线、Sabai 色、Ping 波纹等可在 Mapbox 上做 2D 表现，或后续接入 Three.js 地图层。

---

## 8. 实现阶段建议

| 阶段 | 内容 |
|------|------|
| **P0** | 后端 Soul API 返回 `accountAgeDays`；前端 `evolutionStage` + Persona 视觉配置表；地图上 Mushi 用 2D 图标 + 颜色/标签区分 |
| **P1** | 菌丝连线（Mapbox 上两点发光线）；Sabai 色（清迈 H3 + 24h 逻辑）；Ping 波纹占位 |
| **P2** | Three.js 1+N 蘑菇（Base + GLTF 装饰）；Degen/Whale 等材质与粒子 |
| **P3** | 用户兴趣标签、状态模式（Chill/Focus/Help）、X402 能量罩 |

---

*参考: Blink 地图社交氛围 + Bioluminescent Forest 发光森林质感。*
