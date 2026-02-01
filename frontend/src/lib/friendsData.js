/**
 * Friend list data: Sherry (Chengdu, Sichuan) + accepted-friends persistence
 */

export const SHERRY_ID = 'sherry';
export const SHERRY_ADDRESS = '0x5300000000000000000000000000000000000001';

export const SHERRY_FRIEND_ENTRY = {
  id: SHERRY_ID,
  address: SHERRY_ADDRESS,
  name: 'Sherry',
  status: 'Chengdu, Sichuan',
  isFriend: true,
};

const ACCEPTED_FRIENDS_KEY = 'mushi_accepted_friends';

export function getAcceptedFriendIds() {
  try {
    const raw = localStorage.getItem(ACCEPTED_FRIENDS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addAcceptedFriend(id) {
  try {
    const ids = getAcceptedFriendIds();
    if (ids.includes(id)) return;
    localStorage.setItem(ACCEPTED_FRIENDS_KEY, JSON.stringify([...ids, id]));
  } catch (e) {
    console.warn('[friendsData] addAcceptedFriend failed', e);
  }
}
