/**
 * Soul 标签 → 视觉表现映射
 * 供地图/Profile/3D 蘑菇使用，与 DESIGN-Mushi-Visual-Spec 一致
 */

/** 身份标签 → 视觉特征（材质/粒子/装饰） */
export const PERSONA_VISUALS = {
  'Whale 🐋': {
    key: 'whale',
    emissive: true,
    particle: 'gold',
    scale: 1.15,
    description: '金色粒子/光环，体积略放大',
  },
  'Degen ⚡': {
    key: 'degen',
    emissive: true,
    emissiveColor: '#8B5CF6',
    effect: 'lightning',
    description: '高饱和紫，微小电流特效',
  },
  'DAO Governor': {
    key: 'dao_governor',
    accessory: 'crown',
    description: '几何冠冕或丝绒披风',
  },
  'Buidler 🛠️': {
    key: 'buidler',
    material: 'pixelated',
    accessory: 'toolbox',
    description: '局部像素化或数字工具箱',
  },
  'Social Star': {
    key: 'social_star',
    iridescence: true,
    metalness: 0.9,
    roughness: 0.1,
    description: '珍珠镭射虹光',
  },
  'Newbie 🐣': {
    key: 'newbie',
    transparent: true,
    opacityRange: [0.4, 0.7],
    accessory: 'eggshell',
    description: '蛋壳装饰，果冻感',
  },
  'Active Voter': {
    key: 'active_voter',
    description: '基础 + 银色调',
  },
  'Alpha Hunter': {
    key: 'alpha_hunter',
    description: '基础 + 青色高光',
  },
  'Explorer': {
    key: 'explorer',
    description: '默认蘑菇',
  },
};

/** Sabai 森林绿（清迈停留 > 24h） */
export const SABAI_COLOR = '#2D5A27';

/** 根据 raw 计算成长阶段 */
export function getEvolutionStage(raw) {
  if (!raw) return 'mature';
  const ageDays = raw.accountAgeDays;
  const txCount = raw.txCount ?? 0;
  if (ageDays != null && ageDays < 30) return 'spore';
  if (txCount < 10) return 'sprout'; // 协议数用 txCount 近似
  return 'mature';
}

/** 取主标签对应的视觉配置（tags 数组第一个或匹配项） */
export function getPersonaVisual(tags) {
  if (!Array.isArray(tags) || tags.length === 0) {
    return PERSONA_VISUALS['Explorer'];
  }
  const primary = tags[0];
  const label = primary?.label ?? primary;
  return PERSONA_VISUALS[label] ?? PERSONA_VISUALS['Explorer'];
}
