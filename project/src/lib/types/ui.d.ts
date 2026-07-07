/** Props component hiển thị trạng thái loading dùng chung. */
export type LoadingStateProps = {
  className?: string;
  label?: string;
  type?: "default" | "spinner" | "cart" | "product" | "table" | "card";
};
