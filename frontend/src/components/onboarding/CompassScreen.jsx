/**
 * Step 1: 品牌降临 - 动态旋转罗盘启动页
 */
export function CompassScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="flex items-center gap-4">
        <div className="animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-sabai" />
        <span className="text-4xl font-bold">AuraCity</span>
      </div>
    </div>
  );
}
