/**
 * 通知中心：/notifications
 */
import { NavBar } from '../components/layout/NavBar';

export function NotificationsPage() {
  return (
    <div
      className="min-h-screen text-white flex flex-col pb-20"
      style={{
        background: 'linear-gradient(165deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
      }}
    >
      <header className="p-4 pt-safe">
        <h1 className="text-xl font-semibold">通知</h1>
        <p className="text-white/50 text-sm mt-1">好友请求、新消息等</p>
      </header>
      <div className="flex-1 px-6 text-white/40 text-sm">暂无通知</div>
      <NavBar />
    </div>
  );
}
