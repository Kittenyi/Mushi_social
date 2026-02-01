/**
 * 用户 Profile 页 - 全屏玻璃质感、大头像、Bio、Soul 标签、操作按钮
 * 从地图点进来会带 state.address，可直接「发消息」进聊天（无需输入 0x 地址）
 */
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { NavBar } from '../components/layout/NavBar';

// 模拟用户（与地图 MOCK_NEARBY 对应，含 address 便于直接发消息）
const MOCK_USERS = {
  '1': { name: 'Alex', address: '0x1111111111111111111111111111111111111111', bio: '清迈数字游民，爱咖啡与代码', soulType: 'Degen', status: '在喝咖啡 ☕', isFriend: false },
  '2': { name: 'Sam', address: '0x2222222222222222222222222222222222222222', bio: 'Yellow Coworking 常驻', soulType: 'Builder', status: 'Yellow Coworking', isFriend: true },
  '3': { name: 'Jade', address: '0x3333333333333333333333333333333333333333', bio: '写代码中', soulType: 'Explorer', status: '写代码中 💻', isFriend: false },
};

export function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const user = MOCK_USERS[id] || { name: 'Unknown', address: null, bio: '', soulType: 'Degen', isFriend: false };
  const chatAddress = location.state?.address ?? user.address;

  return (
    <div
      className="min-h-screen text-white flex flex-col"
      style={{
        background: 'linear-gradient(165deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
      }}
    >
      <header className="flex items-center justify-between p-4 pt-safe">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl"
        >
          ←
        </button>
        <span className="text-white/60 text-sm">Profile</span>
        <div className="w-10" />
      </header>

      <div className="flex-1 flex flex-col items-center px-6 pt-4 pb-20">
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center text-4xl mb-4 border-2 border-white/10"
          style={{
            background: 'rgba(255,255,255,0.06)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          🍄
        </div>
        <h1 className="text-2xl font-semibold text-white mb-1">{user.name}</h1>
        <span
          className="text-sm px-3 py-1 rounded-full mb-4"
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.4) 0%, rgba(167,139,250,0.3) 100%)',
            border: '1px solid rgba(167,139,250,0.4)',
          }}
        >
          {user.soulType}
        </span>
        <p className="text-white/60 text-center text-sm max-w-xs mb-8">{user.bio}</p>

        <div
          className="w-full max-w-sm rounded-3xl p-5 mb-8 border border-white/[0.08] backdrop-blur-xl"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          <p className="text-white/50 text-sm mb-4">状态</p>
          <p className="text-white/90">{user.status}</p>
        </div>

        <div className="flex gap-3 w-full max-w-sm">
          {!user.isFriend && (
            <button
              type="button"
              className="flex-1 py-3 rounded-2xl font-medium border border-white/20 bg-white/5 hover:bg-white/10 transition-colors"
            >
              👤 Add Friend
            </button>
          )}
          <Link
            to={chatAddress ? `/chat/${chatAddress}` : '/chat'}
            className="flex-1 py-3 rounded-2xl font-medium text-center text-white btn-primary"
          >
            💬 发消息
          </Link>
          {user.isFriend && (
            <button
              type="button"
              className="flex-1 py-3 rounded-2xl font-medium border border-white/20 bg-white/5 hover:bg-white/10 transition-colors"
              onClick={() => navigate('/map')}
            >
              📍 到Ta那里去
            </button>
          )}
        </div>
      </div>

      <NavBar />
    </div>
  );
}
