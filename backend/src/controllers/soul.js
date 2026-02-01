/**
 * Soul API：根据地址返回原始身份数据 + 分类标签
 * 统一响应格式：{ success, data: { address, raw, tags } }
 */
import { ok, err, badRequest } from '../utils/response.js';
import { getRawIdentityData } from '../services/identityMiner.js';
import { classifySoul } from '../services/soulBrain.js';

/**
 * GET /api/soul/:address
 * 返回 { success: true, data: { address, raw, tags } }，address 可为 0x 或 ENS
 */
export async function getSoulByAddress(req, res) {
  try {
    const { address } = req.params;
    if (!address) return badRequest(res, 'Missing address');

    const raw = await getRawIdentityData(address);

    if (!raw) {
      const normalized = address.trim().toLowerCase().startsWith('0x') ? address.trim().toLowerCase() : address.trim();
      return ok(res, {
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
    return ok(res, {
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
  } catch (e) {
    console.error(e);
    return err(res, e.message || 'Server error', 500, e);
  }
}
