/**
 * 底部导航 - Blink/Zenly 风格：地图、聊天、通知、我
 */
import { NavLink } from 'react-router-dom';

const items = [
  { to: '/map', label: '地图', icon: '🗺️' },
  { to: '/chat', label: '聊天', icon: '💬' },
  { to: '/notifications', label: '通知', icon: '🔔' },
  { to: '/settings', label: '我', icon: '🍄' },
];

export function NavBar() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around py-2 px-4 safe-area-pb"
      style={{
        background: 'rgba(15, 15, 26, 0.9)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {items.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all duration-200 ${
              isActive
                ? 'text-white bg-gradient-to-b from-violet-500/25 to-fuchsia-500/20 border border-white/10 shadow-[0_0_20px_rgba(139,92,246,0.2)]'
                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
            }`
          }
        >
          <span className="text-xl">{icon}</span>
          <span className="text-xs font-medium">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
