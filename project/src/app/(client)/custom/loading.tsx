import LoadingState from "../../../components/ui/loadingState";

export default function CustomLoading() {
  return (
    <section className="min-h-[70vh] bg-[#6B1218] px-4 py-20 text-[#F5F0E8] sm:px-6 lg:px-16">
      <div className="mx-auto flex min-h-[420px] w-full max-w-[1200px] items-center justify-center">
        <LoadingState
          label="Đang tải tuỳ chọn nến..."
          className="w-full max-w-md border-[#F5F0E8]/10 bg-[#F5F0E8]/10 text-[#F5F0E8]"
        />
      </div>
    </section>
  );
}
