import LoadingState from "../../../components/ui/loadingState";

export default function CollectionLoading() {
  return (
    <section className="min-h-[70vh] bg-[#6B1218] px-4 py-20 text-[#F5F0E8] sm:px-6 lg:px-12">
      <div className="mx-auto flex min-h-[420px] w-full max-w-[1220px] items-center justify-center">
        <LoadingState
          label="Đang tải bộ sưu tập..."
          className="w-full max-w-md border-[#F5F0E8]/10 bg-[#F5F0E8]/10 text-[#F5F0E8]"
        />
      </div>
    </section>
  );
}
