/**
 * Soul API：根据地址返回原始身份数据 + 分类标签
 * 参考 Web3.bio / Debank / Hoot 等：链上交互行为 → 身份标签
 * 当外部 API 失败时仍返回 200，带默认 Explorer 标签，避免前端「未获取到标签」
 */
import { getRawIdentityData } from '../services/identityMiner.js';
import { classifySoul } from '../services/soulBrain.js';

/**
 * GET /api/soul/:address
 * 返回 { raw, tags }，address 可为 0x 或 ENS
 */
export async function getSoulByAddress(req, res) {
  try {
    const { address } = req.params;
    if (!address) {
      return res.status(400).json({ message: 'Missing address' });
    }

    const raw = await getRawIdentityData(address);

    if (!raw) {
      const normalized = address.trim().toLowerCase().startsWith('0x') ? address.trim().toLowerCase() : address.trim();
      return res.status(200).json({
        address: normalized,
        raw: {
          social: [],
          txCount: 0,
          nftsCount: 0,
          voteCount: 0,
          proposalCount: 0,
          accountAgeDays: null,
          _fallback: true,
        },
        tags: [{ label: 'Explorer', color: 'gray' }],
      });
    }

    const tags = classifySoul(raw);

    res.json({
      address: raw.address,
      raw: {
        social: raw.social,
        txCount: raw.txCount,
        nftsCount: raw.nfts?.length ?? 0,
        voteCount: raw.voteCount,
        proposalCount: raw.proposalCount,
        accountAgeDays: raw.accountAgeDays ?? null,
      },
      tags,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
}
