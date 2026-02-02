/**
 * 错误边界：包裹 3D 场景，WebGL/WASM 崩溃时回退到静态背景，保证上方按钮和逻辑可用
 */
import { Component } from 'react';

const FALLBACK_STYLE = {
  position: 'absolute',
  inset: 0,
  zIndex: 0,
  pointerEvents: 'none',
  background: 'linear-gradient(165deg, #0f0f1a 0%, #1a1a2e 40%, #16213e 100%)',
};

export class SceneErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.warn('[SceneErrorBoundary] 3D/WebGL 渲染异常，已切换为静态背景:', error?.message || error, info?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return <div style={FALLBACK_STYLE} aria-hidden />;
    }
    return this.props.children;
  }
}
