/**
 * Step 1: 品牌降临 - 动态旋转罗盘启动页
 */
export function CompassScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-sabai" />
      <span className="ml-4 text-xl">AuraCity</span>
    </div>
  );
}
