/**
 * Bottom nav: Chat、Friends、通知、我（个人主页）— 悬浮无背景，Lucide 图标
 */
import { NavLink } from 'react-router-dom';
import { MessageCircle, UsersRound, Bell, CircleUser } from 'lucide-react';

const items = [
  { to: '/chat', label: 'Chat', Icon: MessageCircle },
  { to: '/friends', label: 'Friends', Icon: UsersRound },
  { to: '/notifications', label: 'Notifications', Icon: Bell },
  { to: '/settings', label: 'Me', Icon: CircleUser },
];

export function NavBar() {
  return (
    <div className="nav-bar-wrap">
      <nav
        className="nav-bar nav-bar-float"
        role="navigation"
        aria-label="Main navigation"
      >
        {items.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-bar-item ${isActive ? 'nav-bar-item-active' : ''}`
            }
          >
            <span className="nav-bar-icon shrink-0" aria-hidden>
              <Icon className="w-5 h-5" strokeWidth={2} />
            </span>
            <span className="nav-bar-label">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
