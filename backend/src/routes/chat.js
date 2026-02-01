import express from 'express';
import Message from '../models/Message.js';

const router = express.Router();

// In-memory fallback when DB not used (e.g. no MONGODB_URI)
const memoryMessages = [];
const addressToSocketId = new Map();

export function setChatIo(io) {
  io.on('connection', (socket) => {
    socket.on('register', (data) => {
      const address = data?.address?.toLowerCase?.();
      if (address) addressToSocketId.set(address, socket.id);
    });
    socket.on('disconnect', () => {
      for (const [addr, id] of addressToSocketId) {
        if (id === socket.id) {
          addressToSocketId.delete(addr);
          break;
        }
      }
    });
  });
}

export function getAddressToSocketId() {
  return addressToSocketId;
}

async function saveMessage(from, to, content) {
  const normalized = {
    from: from?.toLowerCase?.(),
    to: to?.toLowerCase?.(),
    content: String(content || '').trim(),
    createdAt: new Date(),
  };
  if (!normalized.from || !normalized.to || !normalized.content) return null;
  try {
    const doc = await Message.create(normalized);
    return { id: doc._id.toString(), ...normalized, createdAt: doc.createdAt };
  } catch {
    const id = `mem_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const msg = { id, ...normalized };
    memoryMessages.push(msg);
    return msg;
  }
}

async function findMessages(me, peer) {
  const m = me?.toLowerCase?.();
  const p = peer?.toLowerCase?.();
  if (!m || !p) return [];
  try {
    const list = await Message.find({
      $or: [
        { from: m, to: p },
        { from: p, to: m },
      ],
    })
      .sort({ createdAt: 1 })
      .lean();
    return list.map((x) => ({
      id: x._id.toString(),
      from: x.from,
      to: x.to,
      content: x.content,
      fromMe: x.from === m,
      sentAt: x.createdAt ? new Date(x.createdAt).getTime() : Date.now(),
    }));
  } catch {
    return memoryMessages
      .filter(
        (msg) =>
          (msg.from === m && msg.to === p) || (msg.from === p && msg.to === m)
      )
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map((x) => ({
        id: x.id || x._id,
        from: x.from,
        to: x.to,
        content: x.content,
        fromMe: x.from === m,
        sentAt: x.createdAt,
      }));
  }
}

async function findConversations(me) {
  const m = me?.toLowerCase?.();
  if (!m) return [];
  try {
    if (!Message.aggregate) throw new Error('no aggregate');
    const list = await Message.aggregate([
      { $match: { $or: [{ from: m }, { to: m }] } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: { $cond: [{ $eq: ['$from', m] }, '$to', '$from'] },
          lastMessage: { $first: '$content' },
          lastAt: { $first: '$createdAt' },
        },
      },
    ]);
    return list.map((x) => ({
      peerAddress: x._id.startsWith('0x') ? x._id : `0x${x._id}`,
      lastMessage: x.lastMessage,
      lastAt: x.lastAt,
    }));
  } catch {
    const peers = new Set();
    memoryMessages
      .filter((msg) => msg.from === m || msg.to === m)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .forEach((msg) => {
        const peer = msg.from === m ? msg.to : msg.from;
        if (peers.has(peer)) return;
        peers.add(peer);
      });
    const convos = [];
    for (const p of peers) {
      const last = memoryMessages
        .filter(
          (msg) =>
            (msg.from === m && msg.to === p) || (msg.from === p && msg.to === m)
        )
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      if (last)
        convos.push({
          peerAddress: p.startsWith('0x') ? p : `0x${p}`,
          lastMessage: last.content,
          lastAt: last.createdAt,
        });
    }
    convos.sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt));
    return convos;
  }
}

// GET /api/chat/messages?me=0x...&peer=0x...
router.get('/messages', async (req, res) => {
  try {
    const { me, peer } = req.query;
    const list = await findMessages(me, peer);
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/chat/messages  body: { from, to, content }
router.post('/messages', async (req, res) => {
  try {
    const { from, to, content } = req.body;
    const msg = await saveMessage(from, to, content);
    if (!msg) return res.status(400).json({ error: 'Missing from, to or content' });

    const io = req.app.get('io');
    const socketId = io && getAddressToSocketId().get(msg.to.toLowerCase());
    if (io && socketId) {
      io.to(socketId).emit('new_message', {
        id: msg.id,
        from: msg.from,
        to: msg.to,
        content: msg.content,
        fromMe: false,
        sentAt: msg.createdAt ? new Date(msg.createdAt).getTime() : Date.now(),
      });
    }

    res.status(201).json({
      id: msg.id,
      from: msg.from,
      to: msg.to,
      content: msg.content,
      fromMe: true,
      sentAt: msg.createdAt ? new Date(msg.createdAt).getTime() : Date.now(),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/chat/conversations?me=0x...
router.get('/conversations', async (req, res) => {
  try {
    const { me } = req.query;
    const list = await findConversations(me);
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
