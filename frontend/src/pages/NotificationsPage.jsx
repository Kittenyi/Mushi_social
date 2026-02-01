/**
 * 通知中心：/notifications
 */
import { NavBar } from '../components/layout/NavBar';

export function NotificationsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background pb-nav">
      <header className="p-4 pt-safe">
        <h1 className="mb-4 text-4xl font-bold">Notifications</h1>
        <p className="text-xl text-muted-foreground">Friend requests, new messages, etc.</p>
      </header>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-xl text-muted-foreground">No notifications yet</p>
        </div>
      </div>
      <NavBar />
    </div>
  );
}
