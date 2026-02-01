/**
 * Mushi 成长阶段、人格、状态模式
 * 与 DESIGN-Mushi-Visual-Spec 及后端 classifySoul 对齐
 */

/** 成长阶段：由钱包年龄与交互数决定 */
export const MUSHI_STAGE = {
  SPORE: 'spore',   // 钱包 < 30 天
  SPROUT: 'sprout', // 协议数 < 3
  MATURE: 'mature', // 活跃用户
};

/** Soul 标签（与 soulBrain 输出 label 一致，用于视觉映射） */
export const PERSONA_TAG = {
  WHALE: 'Whale 🐋',
  DEGEN: 'Degen ⚡',
  DAO_GOVERNOR: 'DAO Governor',
  BUILDER: 'Buidler 🛠️',
  SOCIAL_STAR: 'Social Star',
  NEWBIE: 'Newbie 🐣',
  ACTIVE_VOTER: 'Active Voter',
  ALPHA_HUNTER: 'Alpha Hunter',
  EXPLORER: 'Explorer',
};

/** 用户实时状态（清迈 IRL 场景） */
export const STATUS_MODE = {
  CHILL: 'chill',     // Sabai，欢迎偶遇
  FOCUS: 'focus',     // Deep Work，半透明膜
  HELP: 'help',       // 找合作，头顶信号光
};
