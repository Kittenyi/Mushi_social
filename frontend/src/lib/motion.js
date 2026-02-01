/**
 * Mushi 动效规范（PRD：可爱 + 酷炫，3D 软胶感、果冻色调、弹性 Spring）
 * 所有弹窗/卡片入场、按钮反馈统一使用此配置
 */

/** 弹窗/卡片入场：PRD spring({ stiffness: 300, damping: 20 }) */
export const springDefault = {
  type: 'spring',
  stiffness: 300,
  damping: 20,
};

/** 页面切换：淡入淡出 + 轻微位移 */
export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { type: 'spring', stiffness: 300, damping: 30 },
};

/** 按钮点击：缩小 0.95 → 弹回（PRD） */
export const buttonTap = {
  scale: 0.95,
  transition: { type: 'spring', stiffness: 400, damping: 17 },
};

/** 蘑菇待机：持续呼吸动画（轻微 scale） */
export const mushroomIdle = {
  scale: [1, 1.03, 1],
  transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
};

/** Framer Motion 默认 transition 供 motion.div 等使用 */
export const transitionSpring = {
  type: 'spring',
  stiffness: 300,
  damping: 20,
};

export default {
  springDefault,
  pageTransition,
  buttonTap,
  mushroomIdle,
  transitionSpring,
};
