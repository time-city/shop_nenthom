"use client";

import { useEffect, useState, useRef } from "react";
import { X, ChevronDown, Check } from "lucide-react";

export interface AddressFormData {
  id?: string;
  fullname: string;
  phone: string;
  address: string;
  ward: string;
  district: string;
  city: string;
  postal_code?: string | null;
}

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AddressFormData) => Promise<void>;
  initialData?: AddressFormData | null;
  defaultFullname?: string;
  defaultPhone?: string;
}

interface Location {
  id: string;
  name: string;
  full_name: string;
}

const fetchLocations = async (level: number, parentId: string = "0") => {
  try {
    const res = await fetch(`https://esgoo.net/api-tinhthanh/${level}/${parentId}.htm`);
    const data = await res.json();
    if (data.error === 0) {
      return data.data as Location[];
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch locations:", error);
    return [];
  }
};

const CustomSelect = ({ 
  options, 
  value, 
  onChange, 
  placeholder, 
  disabled 
}: { 
  options: Location[], 
  value: string, 
  onChange: (id: string, name: string) => void, 
  placeholder: string,
  disabled?: boolean
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between rounded-[10px] border-[1.5px] border-[#F5F0E8]/20 bg-black/40 px-4 py-3 text-left text-[0.95rem] text-[#F5F0E8] outline-none transition hover:border-[#D6A15F]/50 focus:border-[#D6A15F] disabled:cursor-not-allowed disabled:bg-black/20 disabled:text-[#F5F0E8]/40`}
      >
        <span className={value ? "text-[#F5F0E8]" : "text-[#F5F0E8]/40"}>
          {value || placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180 text-[#D6A15F]" : "text-[#F5F0E8]/40"}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-[#F5F0E8]/10 bg-[#1A0506]/95 p-1 shadow-xl backdrop-blur-lg custom-scrollbar">
          {options.length === 0 ? (
            <div className="p-3 text-center text-sm text-[#F5F0E8]/50">Đang tải...</div>
          ) : (
            options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id, opt.full_name);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-[0.9rem] transition-colors hover:bg-[#D6A15F]/10 ${
                  value === opt.full_name ? "text-[#D6A15F] font-medium bg-[#D6A15F]/5" : "text-[#F5F0E8]/80"
                }`}
              >
                {opt.full_name}
                {value === opt.full_name && <Check className="h-4 w-4" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default function AddressModal({ isOpen, onClose, onSave, initialData, defaultFullname = "", defaultPhone = "" }: AddressModalProps) {
  const [formData, setFormData] = useState<AddressFormData>({
    fullname: "",
    phone: "",
    city: "",
    district: "",
    ward: "",
    address: "",
  });

  const [provinces, setProvinces] = useState<Location[]>([]);
  const [districts, setDistricts] = useState<Location[]>([]);
  const [wards, setWards] = useState<Location[]>([]);

  const [selectedIds, setSelectedIds] = useState({
    province: "",
    district: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize data
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          fullname: defaultFullname,
          phone: defaultPhone,
          city: "",
          district: "",
          ward: "",
          address: "",
        });
      }
      setError(null);
    }
  }, [isOpen, initialData, defaultFullname, defaultPhone]);

  // Load provinces
  useEffect(() => {
    if (isOpen && provinces.length === 0) {
      fetchLocations(1).then(setProvinces);
    }
  }, [isOpen, provinces.length]);

  // Handle province change
  const handleProvinceChange = async (id: string, name: string) => {
    setFormData(prev => ({ ...prev, city: name, district: "", ward: "" }));
    setSelectedIds(prev => ({ ...prev, province: id, district: "" }));
    setDistricts([]);
    setWards([]);
    const data = await fetchLocations(2, id);
    setDistricts(data);
  };

  // Handle district change
  const handleDistrictChange = async (id: string, name: string) => {
    setFormData(prev => ({ ...prev, district: name, ward: "" }));
    setSelectedIds(prev => ({ ...prev, district: id }));
    setWards([]);
    const data = await fetchLocations(3, id);
    setWards(data);
  };

  const handleWardChange = (id: string, name: string) => {
    setFormData(prev => ({ ...prev, ward: name }));
  };

  const removeDiacritics = (str: string) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/đ/g, "d").replace(/[^a-z0-9\s]/g, "").trim();
  };

  const findBestMatch = (target: string, options: Location[]) => {
    if (!target) return null;
    const normTarget = removeDiacritics(target);
    if (!normTarget) return null;
    
    // Try exact match
    let match = options.find(o => removeDiacritics(o.full_name) === normTarget || removeDiacritics(o.name) === normTarget);
    if (match) return match;

    // Try partial match
    match = options.find(o => {
      const normFull = removeDiacritics(o.full_name);
      const normName = removeDiacritics(o.name);
      return normFull.includes(normTarget) || normTarget.includes(normName);
    });
    return match;
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError("Trình duyệt không hỗ trợ lấy vị trí");
      return;
    }

    setIsSubmitting(true);
    console.log("📍 [Location] Đang lấy tọa độ GPS...");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          console.log(`📍 [Location] Đã lấy tọa độ: ${latitude}, ${longitude}`);
          console.log("🌍 [OSM] Đang gọi API OpenStreetMap...");
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=vi`);
          const data = await res.json();
          
          if (data && data.display_name) {
            console.log("🌍 [OSM] Dữ liệu thô từ OpenStreetMap:", data);
            
            // Normalize whole string for exact matching
            const displayNameNorm = removeDiacritics(data.display_name);
            
            // Split by comma FIRST, then normalize each part!
            const rawParts = data.display_name.split(',');
            const nameParts = rawParts
              .map((s: string) => removeDiacritics(s))
              .filter((s: string) => s.length > 3);
            
            console.log("🔍 [Match] Chuỗi địa chỉ đã chuẩn hóa (bỏ dấu):", displayNameNorm);
            console.log("🔍 [Match] Các mảnh cắt từ chuỗi địa chỉ:", nameParts);

let currentProvId = "";
            const newFormData = { ...formData, address: data.display_name };

            const checkMatch = (loc: Location) => {
              const normName = removeDiacritics(loc.name);
              const normFull = removeDiacritics(loc.full_name);
              if (displayNameNorm.includes(normName) || displayNameNorm.includes(normFull)) return true;
              for (const part of nameParts) {
                if (part.length > 6 && (normName.includes(part) || normFull.includes(part))) {
                  return true;
                }
              }
              return false;
            };

            // 1. Match Province
            console.log("▶️ Bắt đầu quét Tỉnh/Thành phố...");
            const matchedProv = provinces.find(checkMatch);
            
            if (matchedProv) {
              console.log("✅ [MATCHED PROVINCE]:", matchedProv.full_name);
              currentProvId = matchedProv.id;
              newFormData.city = matchedProv.full_name;
              setSelectedIds(prev => ({ ...prev, province: currentProvId, district: "" }));
              
              // Fetch Districts
              console.log(`▶️ Đang tải danh sách Quận/Huyện cho Tỉnh ID: ${currentProvId}...`);
              const fetchedDistricts = await fetchLocations(2, currentProvId);
              setDistricts(fetchedDistricts);
              
              // 2. Match District
const matchedDist = fetchedDistricts.find(checkMatch);
              
              if (matchedDist) {
                console.log("✅ [MATCHED DISTRICT]:", matchedDist.full_name);
                newFormData.district = matchedDist.full_name;
                setSelectedIds(prev => ({ ...prev, district: matchedDist.id }));
                
                // Fetch Wards
                console.log(`▶️ Đang tải danh sách Phường/Xã cho Quận ID: ${matchedDist.id}...`);
                const fetchedWards = await fetchLocations(3, matchedDist.id);
                setWards(fetchedWards);
                
                // 3. Match Ward
                const matchedWard = fetchedWards.find(checkMatch);
                if (matchedWard) {
                  console.log("✅ [MATCHED WARD]:", matchedWard.full_name);
                  newFormData.ward = matchedWard.full_name;
                } else {
                  console.warn("⚠️ [NO MATCH]: Không tìm thấy Phường/Xã nào khớp trong Quận", matchedDist.full_name);
                }
              } else {
                console.warn(`⚠️ [NO MATCH]: Không tìm thấy Quận/Huyện trong chuỗi địa chỉ. Kích hoạt chế độ FALLBACK (quét toàn bộ Phường của Tỉnh ${matchedProv.full_name})...`);
                try {
                  console.log(`▶️ Đang gọi API tải Phường/Xã cho ${fetchedDistricts.length} Quận/Huyện cùng lúc...`);
                  const allWardsPromises = fetchedDistricts.map(d => fetchLocations(3, d.id).then(wards => ({ district: d, wards })));
                  const allWardsResults = await Promise.all(allWardsPromises);
                  console.log(`✅ Tải xong dữ liệu của tổng cộng ${allWardsResults.reduce((acc, curr) => acc + curr.wards.length, 0)} Phường/Xã. Bắt đầu rà quét diện rộng...`);
                  
                  let foundWard = null;
                  let foundDistrict = null;
                  let foundWardsList: Location[] = [];

                  for (const result of allWardsResults) {
                    const match = result.wards.find(checkMatch);
                    if (match) {
                      foundWard = match;
                      foundDistrict = result.district;
                      foundWardsList = result.wards;
                      break;
                    }
                  }

                  if (foundDistrict && foundWard) {
                    console.log("✅ [FALLBACK SUCCESS]: Đã tìm thấy Phường/Xã!", foundWard.full_name);
                    console.log("✅ [FALLBACK SUCCESS]: Suy ngược ra Quận/Huyện là:", foundDistrict.full_name);
                    newFormData.district = foundDistrict.full_name;
                    setSelectedIds(prev => ({ ...prev, district: foundDistrict.id }));
                    setWards(foundWardsList);
                    newFormData.ward = foundWard.full_name;
                  } else {
                    console.error("❌ [FALLBACK FAILED]: Đã quét toàn bộ Phường/Xã nhưng không có kết quả nào khớp.");
                  }
                } catch (e) {
                  console.error("Fallback matching failed", e);
                }
              }
            } else {
              console.error("❌ [NO MATCH]: Không tìm thấy Tỉnh/Thành phố nào khớp trong chuỗi:", displayNameNorm);
            }
            
            console.log("✨ Hoàn tất xử lý, dữ liệu form cuối cùng:", newFormData);
            setFormData(newFormData);
            setError(null);
          } else {
            setError("Không thể xác định vị trí chi tiết");
          }
        } catch (err) {
          setError("Lỗi kết nối khi lấy vị trí");
        } finally {
          setIsSubmitting(false);
        }
      },
      (error) => {
        setIsSubmitting(false);
        setError("Vui lòng cho phép truy cập vị trí để sử dụng tính năng này");
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!formData.city || !formData.district || !formData.ward || !formData.address) {
        throw new Error("Vui lòng điền đầy đủ thông tin địa chỉ");
      }
      
      const submitData = {
        ...formData,
        fullname: formData.fullname || defaultFullname || "Khách hàng",
        // The default phone must match Zod regex: /^(0|\+84)[3|5|7|8|9][0-9]{8}$/
        phone: formData.phone || defaultPhone || "0900000000",
      };

      console.log("🚀 [Submit] Đang gửi dữ liệu lên server:", submitData);

      await onSave(submitData);
      
      console.log("✅ [Submit] Lưu thành công!");
      onClose();
    } catch (err) {
      console.error("❌ [Submit Error]:", err);
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-[#1A0506] border border-[#F5F0E8]/10 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#F5F0E8]/10 px-6 py-4">
          <h3 className="font-serif text-xl text-[#F5F0E8]">
            {initialData ? "Chỉnh Sửa Địa Chỉ" : "Thêm Địa Chỉ Mới"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-[#F5F0E8]/50 transition hover:bg-[#F5F0E8]/10 hover:text-[#F5F0E8]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-5 flex justify-end">
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-full border border-[#D6A15F]/50 bg-[#D6A15F]/10 px-4 py-2 text-xs font-medium text-[#D6A15F] transition hover:bg-[#D6A15F] hover:text-[#2C1810]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z"/><path d="M12 2v20"/><path d="M2 12h20"/></svg>
              Lấy Vị Trí Hiện Tại
            </button>
          </div>
          <div className="grid gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[0.7rem] uppercase tracking-wider text-[#F5F0E8]/70">Tỉnh / Thành Phố</label>
              <CustomSelect
                options={provinces}
                value={formData.city}
                onChange={handleProvinceChange}
                placeholder="Chọn Tỉnh/Thành phố"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-[0.7rem] uppercase tracking-wider text-[#F5F0E8]/70">Quận / Huyện</label>
                <CustomSelect
                  options={districts}
                  value={formData.district}
                  onChange={handleDistrictChange}
                  placeholder="Chọn Quận/Huyện"
                  disabled={!formData.city}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[0.7rem] uppercase tracking-wider text-[#F5F0E8]/70">Phường / Xã</label>
                <CustomSelect
                  options={wards}
                  value={formData.ward}
                  onChange={handleWardChange}
                  placeholder="Chọn Phường/Xã"
                  disabled={!formData.district}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[0.7rem] uppercase tracking-wider text-[#F5F0E8]/70">Địa Chỉ Cụ Thể</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full rounded-[10px] border-[1.5px] border-[#F5F0E8]/20 bg-black/40 px-4 py-3 text-[0.95rem] text-[#F5F0E8] outline-none transition focus:border-[#D6A15F]"
                placeholder="Số nhà, Tên đường..."
              />
            </div>
            
            {error && <div className="text-sm font-medium text-red-400">{error}</div>}

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-full border border-[#F5F0E8]/20 py-3 text-sm font-medium uppercase tracking-widest text-[#F5F0E8] transition hover:bg-[#F5F0E8]/5"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-gradient-to-r from-[#D6A15F] to-[#E5C07B] py-3 text-sm font-medium uppercase tracking-widest text-[#2C1810] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Đang lưu..." : "Lưu Địa Chỉ"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
