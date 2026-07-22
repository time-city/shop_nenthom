"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { getCurrentUser } from "../../../lib/action/user.action";
import { getUserAddressesAction } from "@/src/lib/action/address.action";
import { useUserStore } from "@/src/store/useUserStore";
import type { FullFormValues } from "@/src/interface/clientInterface";
import { PROVINCE_POSTAL_CODE_MAP } from "@/src/lib/utils/provincePostalCodes";
import type {
  CartPaymentMethod,
  CheckoutFormProps,
} from "../../../lib/types/client";
import { callAction } from "@/src/lib/utils/callAction";
import { fetchLocations, type Location } from "@/src/lib/utils/location";
import LocationSelect from "@/src/components/ui/LocationSelect";



const initialCheckoutFormValues: FullFormValues = {
  fullname: "",
  email: "",
  phone: "",
  address: "",
  ward: "",
  district: "",
  city: "",
  zip: "",
  note: "",
};

export default function CheckoutForm({ isSubmitting = false, onComplete }: CheckoutFormProps) {
  const { user: storedUser } = useUserStore();
  const [payment, setPayment] = useState<CartPaymentMethod>("cod");
  const [formValues, setFormValues] = useState<FullFormValues>(initialCheckoutFormValues);
  const [errors, setErrors] = useState<Partial<Record<keyof FullFormValues, string>>>({});
  const [hasSession, setHasSession] = useState(true);
  
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | "custom">("custom");

  const [provinces, setProvinces] = useState<Location[]>([]);
  const [districts, setDistricts] = useState<Location[]>([]);
  const [wards, setWards] = useState<Location[]>([]);
  const [selectedIds, setSelectedIds] = useState({
    province: "",
    district: "",
  });

  useEffect(() => {
    fetchLocations(1).then(setProvinces);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadCurrentUser = async () => {
      // action-(lấy user checkout)
      const user = await callAction(() => getCurrentUser(), "Không thể tải thông tin tài khoản. Vui lòng thử lại sau.");

      if (!isMounted) return;

      if (user) {
        setHasSession(true);
        
        // Lấy danh sách địa chỉ đã lưu
        const addressesResult = await callAction(() => getUserAddressesAction(), "Không thể tải danh sách địa chỉ.");
        let addresses: any[] = [];
        if (addressesResult && "success" in addressesResult && addressesResult.success && addressesResult.data) {
          addresses = addressesResult.data;
          setSavedAddresses(addresses);
        }

        const defaultAddress = addresses.find(a => a.is_default) || addresses[0];

        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
          setFormValues((currentValues) => ({
            ...currentValues,
            email: currentValues.email || user.email || "",
            fullname: defaultAddress.fullname,
            phone: defaultAddress.phone,
            address: `${defaultAddress.address}, ${defaultAddress.ward}, ${defaultAddress.district}`,
            city: defaultAddress.city,
            zip: defaultAddress.postal_code || PROVINCE_POSTAL_CODE_MAP[defaultAddress.city] || currentValues.zip,
          }));
        } else {
          // Đọc địa chỉ từ Zustand store (thay vì localStorage)
          const storedAddress = storedUser?.address ?? "";
          const storedCity = storedUser?.city ?? "";
          const storedZip = storedUser?.zip ?? "";

          setFormValues((currentValues) => ({
            ...currentValues,
            email: currentValues.email || user.email || "",
            fullname: currentValues.fullname || user.fullname || "",
            phone: currentValues.phone || user.phone || "",
            address: currentValues.address || user.address || storedAddress,
            city: currentValues.city || user.city || storedCity,
            zip: currentValues.zip || storedZip,
          }));
        }
      } else {
        setHasSession(false);
      }
    };

    void loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [storedUser?.address, storedUser?.city, storedUser?.zip]);

  const validateField = (field: keyof FullFormValues, value: string): string => {
    const trimmed = value.trim();

    // 1. Required check
    if (["fullname", "email", "phone", "address", "ward", "district", "city"].includes(field)) {
      if (!trimmed) {
        return "Vui lòng không để trống";
      }
    }

    // 2. Email format check
    if (field === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.(com|vn|net|org|edu|gov|io|co|info|biz|me|cc|us|uk|jp|kr|tw|sg|live|store|shop|online|xyz|pro|work|tech|dev|app|asia|eu|ca|fr|de|au)(?:\.[a-z]{2,})?$/i;
      if (!emailRegex.test(trimmed)) {
        return "Email không đúng định dạng";
      }
    }

    // 3. Phone check
    if (field === "phone") {
      const phoneRegex = /^(0|\+84)\d{9}$/;
      if (!phoneRegex.test(trimmed)) {
        return "Số điện thoại không hợp lệ";
      }
    }

    return "";
  };

  const handleChange = (field: keyof FullFormValues, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      const errorMsg = validateField(field, value);
      setErrors((prev) => {
        const next = { ...prev };
        if (errorMsg) {
          next[field] = errorMsg;
        } else {
          delete next[field];
        }
        return next;
      });
    }
  };

  const handleProvinceChange = async (id: string, name: string) => {
    setFormValues((prev) => ({
      ...prev,
      city: name,
      district: "",
      ward: "",
      zip: name ? PROVINCE_POSTAL_CODE_MAP[name] || prev.zip : "",
    }));
    setSelectedIds((prev) => ({ ...prev, province: id, district: "" }));
    setDistricts([]);
    setWards([]);
    const data = await fetchLocations(2, id);
    setDistricts(data);
    
    if (errors.city) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.city;
        return next;
      });
    }
  };

  const handleDistrictChange = async (id: string, name: string) => {
    setFormValues((prev) => ({ ...prev, district: name, ward: "" }));
    setSelectedIds((prev) => ({ ...prev, district: id }));
    setWards([]);
    const data = await fetchLocations(3, id);
    setWards(data);

    if (errors.district) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.district;
        return next;
      });
    }
  };

  const handleWardChange = (id: string, name: string) => {
    setFormValues((prev) => ({ ...prev, ward: name }));
    if (errors.ward) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.ward;
        return next;
      });
    }
  };

  const getInputClass = (fieldName: keyof FullFormValues) => {
    const hasError = Boolean(errors[fieldName]);
    return `rounded-xl border-[1.5px] ${hasError
        ? "border-[#ff6b6b] focus:ring-[#ff6b6b]/20"
        : "border-[#F5F0E8]/20 focus:border-[#D6A15F] focus:ring-[#D6A15F]/20"
      } bg-black/50 px-4 py-3 text-sm text-[#F5F0E8] outline-none transition placeholder:text-[#F5F0E8]/45 focus:ring-4`;
  };

  const handleSelectAddress = (id: string | "custom") => {
    setSelectedAddressId(id);
    if (id !== "custom") {
      const selected = savedAddresses.find(a => a.id === id);
        if (selected) {
          setFormValues((prev) => ({
            ...prev,
            fullname: selected.fullname,
            phone: selected.phone,
            address: selected.address,
            ward: selected.ward || "",
            district: selected.district || "",
            city: selected.city,
            zip: selected.postal_code || PROVINCE_POSTAL_CODE_MAP[selected.city] || prev.zip,
          }));
          
          // Xóa lỗi nếu có khi chọn địa chỉ có sẵn
          setErrors((prevErrors) => {
            const nextErrors = { ...prevErrors };
            delete nextErrors.fullname;
            delete nextErrors.phone;
            delete nextErrors.address;
            delete nextErrors.ward;
            delete nextErrors.district;
            delete nextErrors.city;
            delete nextErrors.zip;
            return nextErrors;
          });
      }
    } else {
      // Xóa form để người dùng tự nhập
      setFormValues((prev) => ({
        ...prev,
        fullname: storedUser?.fullname || prev.fullname,
        phone: storedUser?.phone || prev.phone,
        address: "",
        ward: "",
        district: "",
        city: "",
        zip: "",
      }));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const newErrors: Partial<Record<keyof FullFormValues, string>> = {};
    const fieldsToValidate: Array<keyof FullFormValues> = ["fullname", "email", "phone", "address", "ward", "district", "city"];

    fieldsToValidate.forEach((field) => {
      const errorMsg = validateField(field, formValues[field]);
      if (errorMsg) {
        newErrors[field] = errorMsg;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstErrorField = Object.keys(newErrors)[0] as keyof FullFormValues;
      const element = document.getElementsByName(firstErrorField)[0];
      if (element) {
        element.focus();
      }
      return;
    }

    await onComplete({
      address: formValues.address,
      ward: formValues.ward,
      district: formValues.district,
      city: formValues.city,
      email: formValues.email,
      fullname: formValues.fullname,
      note: formValues.note,
      paymentMethod: payment,
      phone: formValues.phone,
      zip: formValues.zip,
    });
  };

  return (
    <form
      id="checkoutForm"
      onSubmit={handleSubmit}
      className="rounded-3xl border border-[#F5F0E8]/10 bg-[#F5F0E8]/5 backdrop-blur-md p-5 shadow-[0_16px_36px_rgba(0,0,0,0.5)] sm:p-7 lg:p-8"
    >
      <fieldset disabled={isSubmitting} className="contents">
        {!hasSession && (
          <div className="mb-8 rounded-xl bg-[#3a080f]/80 px-5 py-4 text-sm font-light text-[#F5F0E8]">
            🎁 Đăng ký thành viên để nhận ưu đãi cho lần mua tiếp theo{" "}
            <a href="/register" className="font-medium text-[#D6A15F] hover:text-[#E5C07B] transition">
              Đăng ký ngay →
            </a>
          </div>
        )}

        <section className="mb-10">
          <h2 className="relative mb-6 pb-4 font-serif text-[1.25rem] font-bold text-[#F5F0E8] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-10 after:bg-[#D6A15F]">
            Thông Tin Thanh Toán
          </h2>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-[0.72rem] uppercase tracking-[0.12em] text-[#F5F0E8]/70">
              Họ và Tên
              <input
                type="text"
                name="fullname"
                value={formValues.fullname}
                onChange={(event) => handleChange("fullname", event.target.value)}
                className={getInputClass("fullname")}
              />
              {errors.fullname && (
                <span className="text-xs text-[#ff6b6b] mt-1 normal-case tracking-normal font-medium">
                  {errors.fullname}
                </span>
              )}
            </label>
            <label className="flex flex-col gap-2 text-[0.72rem] uppercase tracking-[0.12em] text-[#F5F0E8]/70">
              Email
              <input
                type="text"
                name="email"
                value={formValues.email}
                onChange={(event) => handleChange("email", event.target.value)}
                className={getInputClass("email")}
              />
              {errors.email && (
                <span className="text-xs text-[#ff6b6b] mt-1 normal-case tracking-normal font-medium">
                  {errors.email}
                </span>
              )}
            </label>
            <label className="flex flex-col gap-2 text-[0.72rem] uppercase tracking-[0.12em] text-[#F5F0E8]/70">
              Số Điện Thoại
              <input
                type="text"
                name="phone"
                placeholder="+84..."
                value={formValues.phone}
                onChange={(event) => handleChange("phone", event.target.value)}
                className={getInputClass("phone")}
              />
              {errors.phone && (
                <span className="text-xs text-[#ff6b6b] mt-1 normal-case tracking-normal font-medium">
                  {errors.phone}
                </span>
              )}
            </label>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="relative mb-6 pb-4 font-serif text-[1.25rem] font-bold text-[#F5F0E8] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-10 after:bg-[#D6A15F]">
            Địa Chỉ Giao Hàng
          </h2>
          
          {savedAddresses.length > 0 && (
            <div className="mb-6 grid gap-4">
              {savedAddresses.map((address) => (
                <label
                  key={address.id}
                  className={`relative flex cursor-pointer items-start gap-4 rounded-xl border-[1.5px] p-4 transition ${
                    selectedAddressId === address.id
                      ? "border-[#D6A15F] bg-[#D6A15F]/15"
                      : "border-[#F5F0E8]/20 bg-black/30 hover:border-[#F5F0E8]/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="addressSelection"
                    value={address.id}
                    checked={selectedAddressId === address.id}
                    onChange={() => handleSelectAddress(address.id)}
                    className="mt-1 sr-only"
                  />
                  <div className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${selectedAddressId === address.id ? 'border-[#D6A15F]' : 'border-[#F5F0E8]/40'}`}>
                    {selectedAddressId === address.id && <div className="h-2 w-2 rounded-full bg-[#D6A15F]" />}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-[#F5F0E8]">{address.fullname}</span>
                      <span className="text-[#F5F0E8]/50">|</span>
                      <span className="text-[#F5F0E8]/80">{address.phone}</span>
                      {address.is_default && (
                        <span className="rounded bg-[#D6A15F]/20 px-2 py-0.5 text-[0.65rem] uppercase tracking-wider text-[#D6A15F]">Mặc định</span>
                      )}
                    </div>
                    <p className="mt-1.5 text-[0.85rem] leading-relaxed text-[#F5F0E8]/90">
                      {address.address}, {address.ward}, {address.district}, {address.city}
                    </p>
                  </div>
                </label>
              ))}

              <label
                className={`relative flex cursor-pointer items-center gap-4 rounded-xl border-[1.5px] p-4 transition ${
                  selectedAddressId === "custom"
                    ? "border-[#D6A15F] bg-[#D6A15F]/15"
                    : "border-[#F5F0E8]/20 bg-black/30 hover:border-[#F5F0E8]/40"
                }`}
              >
                <input
                  type="radio"
                  name="addressSelection"
                  value="custom"
                  checked={selectedAddressId === "custom"}
                  onChange={() => handleSelectAddress("custom")}
                  className="sr-only"
                />
                <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${selectedAddressId === "custom" ? 'border-[#D6A15F]' : 'border-[#F5F0E8]/40'}`}>
                  {selectedAddressId === "custom" && <div className="h-2 w-2 rounded-full bg-[#D6A15F]" />}
                </div>
                <span className="font-medium text-[#F5F0E8]">Giao đến địa chỉ khác</span>
              </label>
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            {selectedAddressId === "custom" && (
              <>
            {/* Tỉnh / Thành Phố */}
            <label className="flex flex-col gap-2 text-[0.72rem] uppercase tracking-[0.12em] text-[#F5F0E8]/70">
              Tỉnh / Thành Phố
              <LocationSelect
                options={provinces}
                value={formValues.city}
                onChange={handleProvinceChange}
                placeholder="Chọn Tỉnh/Thành phố"
              />
              {errors.city && (
                <span className="text-xs text-[#ff6b6b] mt-1 normal-case tracking-normal font-medium">
                  {errors.city}
                </span>
              )}
            </label>
            
            {/* Quận / Huyện */}
            <label className="flex flex-col gap-2 text-[0.72rem] uppercase tracking-[0.12em] text-[#F5F0E8]/70">
              Quận / Huyện
              <LocationSelect
                options={districts}
                value={formValues.district}
                onChange={handleDistrictChange}
                placeholder="Chọn Quận/Huyện"
                disabled={!formValues.city}
              />
              {errors.district && (
                <span className="text-xs text-[#ff6b6b] mt-1 normal-case tracking-normal font-medium">
                  {errors.district}
                </span>
              )}
            </label>
            
            {/* Phường / Xã */}
            <label className="flex flex-col gap-2 text-[0.72rem] uppercase tracking-[0.12em] text-[#F5F0E8]/70 md:col-span-2">
              Phường / Xã
              <LocationSelect
                options={wards}
                value={formValues.ward}
                onChange={handleWardChange}
                placeholder="Chọn Phường/Xã"
                disabled={!formValues.district}
              />
              {errors.ward && (
                <span className="text-xs text-[#ff6b6b] mt-1 normal-case tracking-normal font-medium">
                  {errors.ward}
                </span>
              )}
            </label>

            {/* Địa Chỉ (Street) */}
            <label className="flex flex-col gap-2 text-[0.72rem] uppercase tracking-[0.12em] text-[#F5F0E8]/70">
              Đường / Số nhà
              <input
                type="text"
                name="address"
                placeholder="Số nhà, tên đường..."
                value={formValues.address}
                onChange={(event) => handleChange("address", event.target.value)}
                className={getInputClass("address")}
              />
              {errors.address && (
                <span className="text-xs text-[#ff6b6b] mt-1 normal-case tracking-normal font-medium">
                  {errors.address}
                </span>
              )}
            </label>

            <label className="flex flex-col gap-2 text-[0.72rem] uppercase tracking-[0.12em] text-[#F5F0E8]/70">
              Mã Bưu Chính
              <input
                type="text"
                name="zip"
                value={formValues.zip}
                readOnly
                className={`${getInputClass("zip")} cursor-not-allowed bg-black/20 text-[#F5F0E8]/50`}
              />
            </label>
              </>
            )}
            <label className="flex flex-col gap-2 text-[0.72rem] uppercase tracking-[0.12em] text-[#F5F0E8]/70 md:col-span-2">
              Ghi Chú Đơn Hàng (Tùy Chọn)
              <textarea
                name="note"
                placeholder="Hướng dẫn giao hàng, yêu cầu đặc biệt..."
                value={formValues.note}
                onChange={(event) => handleChange("note", event.target.value)}
                className={`${getInputClass("note")} min-h-24 resize-y`}
              />
            </label>
          </div>
        </section>

        <section>
          <h2 className="relative mb-6 pb-4 font-serif text-[1.25rem] font-bold text-[#F5F0E8] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-10 after:bg-[#D6A15F]">
            Phương Thức Thanh Toán
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label
              className={`relative cursor-pointer rounded-xl border-[1.5px] px-5 py-4 text-center text-sm transition ${payment === "cod"
                  ? "border-[#D6A15F] bg-[#D6A15F]/20 text-[#D6A15F]"
                  : "border-[#F5F0E8]/20 bg-black/40 text-[#F5F0E8]"
                }`}
            >
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={payment === "cod"}
                onChange={() => setPayment("cod")}
                className="sr-only"
              />
              Thanh Toán Khi Nhận Hàng
            </label>
            <label
              className={`relative cursor-pointer rounded-xl border-[1.5px] px-5 py-4 text-center text-sm transition ${payment === "bank"
                  ? "border-[#D6A15F] bg-[#D6A15F]/20 text-[#D6A15F]"
                  : "border-[#F5F0E8]/20 bg-black/40 text-[#F5F0E8]"
                }`}
            >
              <input
                type="radio"
                name="payment"
                value="bank"
                checked={payment === "bank"}
                onChange={() => setPayment("bank")}
                className="sr-only"
              />
              Chuyển Khoản Ngân Hàng
            </label>
          </div>

          {payment === "bank" ? (
            <div className="mt-5 rounded-xl bg-black/50 border border-[#F5F0E8]/10 p-4 text-sm leading-7 text-[#F5F0E8]/85">
              <p className="flex items-center gap-2">
                <svg className="size-5 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                <strong className="text-[#F5F0E8]">Thanh toán bằng mã QR tự động</strong>
              </p>
              <p className="mt-1 text-[#F5F0E8]/70">
                Sau khi bấm <strong>&quot;Đặt hàng&quot;</strong>, hệ thống sẽ hiển thị mã VietQR. Bạn chỉ cần mở app ngân hàng quét mã, đơn hàng sẽ được tự động xác nhận ngay lập tức!
              </p>
            </div>
          ) : null}
        </section>
      </fieldset>
    </form>
  );
}
