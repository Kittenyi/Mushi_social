/**
 * 通用按钮（弹性点击 0.95 → 弹回）
 */
export function Button({ children, ...props }) {
  return (
    <button
      type="button"
      className="hover:scale-95 active:scale-95 transition-transform"
      {...props}
    >
      {children}
    </button>
  );
}
