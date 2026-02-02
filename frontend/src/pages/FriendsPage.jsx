/**
 * Friends list — shows Sam + accepted friends (e.g. Sherry after accepting request)
 */
import { useEffect, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { UsersRound } from 'lucide-react';
import { NavBar } from '../components/layout/NavBar';
import { getAcceptedFriendIds, SHERRY_ID, SHERRY_FRIEND_ENTRY } from '../lib/friendsData';

const MOCK_FRIENDS = [
  { id: '2', address: '0x2222222222222222222222222222222222222222', name: 'Sam', status: 'Yellow Coworking', isFriend: true },
];

const ACCEPTED_FRIEND_ENTRIES = { [SHERRY_ID]: SHERRY_FRIEND_ENTRY };

export function FriendsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const acceptedIds = useMemo(() => getAcceptedFriendIds(), []);

  const list = useMemo(() => {
    const base = [...MOCK_FRIENDS];
    acceptedIds.forEach((id) => {
      if (ACCEPTED_FRIEND_ENTRIES[id] && !base.some((f) => f.id === id)) {
        base.push(ACCEPTED_FRIEND_ENTRIES[id]);
      }
    });
    return base;
  }, [acceptedIds]);

  useEffect(() => {
    const state = location.state;
    if (state?.openChatFor === SHERRY_ID && state?.peerAddress) {
      navigate(`/chat/${state.peerAddress}`, { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  return (
    <div className="flex min-h-screen flex-col bg-background pb-nav">
      <header className="flex items-center gap-3 p-4 pt-safe border-b border-white/10">
        <button
          type="button"
          onClick={() => navigate('/map')}
          className="touch-target w-11 h-11 rounded-xl bg-white/10 hover:bg-white/15 flex items-center justify-center text-xl"
          aria-label="Back to map"
        >
          ←
        </button>
        <h1 className="flex-1 mb-0 text-4xl font-serif font-light tracking-tight text-foreground">Friends</h1>
      </header>

      <div className="flex-1 p-4">
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <UsersRound className="w-14 h-14 text-white/40 mb-3 shrink-0" strokeWidth={1.5} />
            <p className="text-white/70 text-sm">No friends yet</p>
            <p className="text-white/45 text-xs mt-1">Add people you meet on the map as friends</p>
          </div>
        ) : (
          <div className="space-y-2">
            {list.map((f) => (
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
