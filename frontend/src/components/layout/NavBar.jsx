/**
 * Bottom nav: Chat & Friends only. Dynamic pill + glow when active.
 */
import { NavLink } from 'react-router-dom';

const items = [
  { to: '/chat', label: 'Chat', icon: '💬' },
  { to: '/friends', label: 'Friends', icon: '👥' },
];

export function NavBar() {
  return (
    <nav
      className="nav-bar"
      role="navigation"
      aria-label="Main navigation"
    >
      {items.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `nav-bar-item ${isActive ? 'nav-bar-item-active' : ''}`
          }
        >
          <span className="nav-bar-icon" aria-hidden>{icon}</span>
          <span className="nav-bar-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
