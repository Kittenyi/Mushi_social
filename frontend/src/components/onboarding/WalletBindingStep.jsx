/**
 * Step 3: 灵魂唤醒 - 钱包连接 (OKX / MetaMask / 币安 / Phantom 等)
 * 数据扫描: 交易频次、资产净值、协议参与度
 */
export function WalletBindingStep() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6">
      <h2 className="text-xl mb-2">连接钱包</h2>
      <p className="text-white/60 text-sm mb-8">灵魂唤醒 · 链上数据扫描</p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button className="rounded-2xl bg-white/10 py-3 hover:bg-white/20">MetaMask</button>
        <button className="rounded-2xl bg-white/10 py-3 hover:bg-white/20">OKX</button>
        <button className="rounded-2xl bg-white/10 py-3 hover:bg-white/20">币安钱包</button>
        <button className="rounded-2xl bg-white/10 py-3 hover:bg-white/20">Phantom</button>
      </div>
    </div>
  );
}
