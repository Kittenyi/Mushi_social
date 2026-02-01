/**
 * 用户 Profile 页 - BLINK 炫酷风格：深色背景、大圆形头像光晕、@handle、统计、2x2 圆形功能格
 */
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { NavBar } from '../components/layout/NavBar';

const MOCK_USERS = {
  '1': { name: 'Alex', address: '0x1111111111111111111111111111111111111111', bio: 'Digital nomad in Chiang Mai, coffee & code', soulType: 'Degen', status: 'Having coffee ☕', isFriend: false, tags: ['Coffee', 'Photography', 'Writing'], following: 12, followers: 89 },
  '2': { name: 'Sam', address: '0x2222222222222222222222222222222222222222', bio: 'Yellow Coworking regular', soulType: 'Builder', status: 'Yellow Coworking', isFriend: true, tags: ['Coworking', 'Design', 'Running'], following: 24, followers: 156 },
  '3': { name: 'Jade', address: '0x3333333333333333333333333333333333333333', bio: 'Coding & building', soulType: 'Explorer', status: 'Coding 💻', isFriend: false, tags: ['Code', 'Yoga', 'Foodie'], following: 8, followers: 42 },
};

function shortId(address) {
  if (!address || !address.startsWith('0x')) return '—';
  return `${address.slice(2, 6)}…${address.slice(-4)}`;
}

function handleFromName(name) {
  return name ? `@${name.toLowerCase().replace(/\s/g, '_')}` : '@mushi';
}

export function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const user = MOCK_USERS[id] || { name: 'Unknown', address: null, bio: '', soulType: 'Degen', isFriend: false, tags: [], following: 0, followers: 0 };
  const chatAddress = location.state?.address ?? user.address;

  return (
    <div className="flex min-h-screen flex-col bg-background pb-nav profile-page-v2">
      {/* 顶栏：返回 | @handle | 通知+菜单 */}
      <header className="profile-v2-header">
        <button type="button" onClick={() => navigate(-1)} className="profile-v2-header-btn" aria-label="Back">
          ←
        </button>
        <span className="profile-v2-handle">{handleFromName(user.name)}</span>
        <div className="flex items-center gap-2">
          <button type="button" className="profile-v2-header-btn" title="Notifications" aria-label="Notifications">🔔</button>
          <button type="button" className="profile-v2-header-btn" title="Menu" aria-label="Menu">⋯</button>
        </div>
      </header>

      <div className="profile-v2-body flex-1 flex flex-col items-center px-5 pb-24 overflow-y-auto">
        {/* 统计：Following | Followers */}
        <div className="profile-v2-stats">
          <span><strong>{user.following ?? 0}</strong> Following</span>
          <span><strong>{user.followers ?? 0}</strong> Friends</span>
        </div>

        {/* 大圆形头像 + 紫/金光晕 */}
        <div className="profile-v2-avatar-wrap">
          <div className="profile-v2-avatar">
            🍄
          </div>
        </div>

        <h1 className="profile-v2-name">{user.name}</h1>
        {user.address && (
          <p className="profile-v2-wallet">{shortId(user.address)}</p>
        )}
        <span className="profile-v2-soul">{user.soulType}</span>

        {/* Bio：纯文字，无大框 */}
        <p className="profile-v2-bio">
          {user.bio || 'Tell us about yourself'}
        </p>

        {/* 状态一行 */}
        <p className="profile-v2-status">{user.status}</p>

        {/* What I'm into 标签 */}
        {user.tags && user.tags.length > 0 && (
          <div className="profile-v2-tags-wrap">
            <div className="profile-v2-tags">
              {user.tags.map((tag) => (
                <span key={tag} className="profile-v2-tag">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* 主操作：Edit Profile 风格双按钮 */}
        <div className="profile-v2-actions">
          {!user.isFriend && (
            <button type="button" className="profile-v2-btn profile-v2-btn-secondary">
              Add friend
            </button>
          )}
          <Link
            to={chatAddress ? `/chat/${chatAddress}` : '/chat'}
            className="profile-v2-btn profile-v2-btn-primary"
          >
            <span className="wave-icon" aria-hidden>👋</span>
            Say hi!
          </Link>
          {user.isFriend && (
            <button type="button" className="profile-v2-btn profile-v2-btn-secondary" onClick={() => navigate('/map')}>
              📍 Location
            </button>
          )}
        </div>

        {/* 2x2 圆形功能格（参考 BLINK） */}
        <div className="profile-v2-grid">
          <button type="button" className="profile-v2-grid-item">
            <div className="profile-v2-grid-icon profile-v2-icon-friends">👥</div>
            <span>Friends</span>
          </button>
          <button type="button" className="profile-v2-grid-item">
            <div className="profile-v2-grid-icon profile-v2-icon-activity">18</div>
            <span>Activity</span>
          </button>
          <button type="button" className="profile-v2-grid-item">
            <div className="profile-v2-grid-icon profile-v2-icon-star">⭐</div>
            <span>Achievements</span>
          </button>
          <button type="button" className="profile-v2-grid-item">
            <div className="profile-v2-grid-icon profile-v2-icon-check">📍</div>
            <span>Check-in</span>
          </button>
        </div>
      </div>

      <NavBar />
    </div>
  );
}
