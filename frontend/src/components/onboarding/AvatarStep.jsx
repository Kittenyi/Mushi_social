/**
 * Step 2c: 身份设定 - 头像上传，Mushi 进化前占位符
 */
export function AvatarStep() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6">
      <div className="text-center">
        <div className="w-32 h-32 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center mx-auto text-muted-foreground">
          上传头像
        </div>
        <p className="mt-4 text-xl text-muted-foreground">Mushi 进化前的占位符</p>
      </div>
    </div>
  );
}
