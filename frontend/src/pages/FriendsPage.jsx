/**
 * 好友列表页 - 底部仅两个入口之一；顶部可返回地图
 */
import { useNavigate, Link } from 'react-router-dom';
import { NavBar } from '../components/layout/NavBar';

// 模拟好友（与地图 MOCK_NEARBY 中 isFriend: true 对应）
const MOCK_FRIENDS = [
  { id: '2', address: '0x2222222222222222222222222222222222222222', name: 'Sam', status: 'Yellow Coworking', isFriend: true },
];

export function FriendsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-white flex flex-col pb-20" style={{ background: 'linear-gradient(165deg, #1a0a2e 0%, #0f0f1a 50%, #0f0f1a 100%)' }}>
      <header className="flex items-center gap-3 p-4 pt-safe border-b border-white/10">
        <button
          type="button"
          onClick={() => navigate('/map')}
          className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/15 flex items-center justify-center text-xl transition-colors"
        >
          ←
        </button>
        <span className="text-white/60 text-sm">Map</span>
        <h1 className="flex-1 text-lg font-semibold text-white">Friends</h1>
      </header>

      <div className="flex-1 p-4">
        {MOCK_FRIENDS.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-4xl mb-3">👥</p>
            <p className="text-white/70 text-sm">No friends yet</p>
            <p className="text-white/45 text-xs mt-1">Add people you meet on the map as friends</p>
          </div>
        ) : (
          <div className="space-y-2">
            {MOCK_FRIENDS.map((f) => (
              <Link
                key={f.id}
                to={`/profile/${f.id}`}
                state={{ address: f.address, name: f.name }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/8 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 flex items-center justify-center text-xl border border-white/10">
                  🍄
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{f.name}</p>
                  <p className="text-white/50 text-sm truncate">{f.status}</p>
                </div>
                <span className="text-white/30">→</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <NavBar />
    </div>
  );
}
