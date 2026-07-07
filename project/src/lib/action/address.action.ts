'use server';
import { getPublicErrorMessage } from "../utils/publicError";
import { getSession } from "../session";
import { AddressService, AddressCreateInput } from "../services/address.service";
import { z } from "zod";

const addressSchema = z.object({
    fullname: z.string().min(1, "Họ và tên không được để trống"),
    phone: z.string().regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, "Số điện thoại không hợp lệ"),
    address: z.string().min(1, "Địa chỉ không được để trống"),
    ward: z.string().min(1, "Phường/Xã không được để trống"),
    district: z.string().min(1, "Quận/Huyện không được để trống"),
    city: z.string().min(1, "Tỉnh/Thành phố không được để trống"),
    postal_code: z.string().optional().nullable(),
});

export async function getUserAddressesAction() {
    const session = await getSession();
    if (!session) return { error: "Bạn chưa đăng nhập" };

    try {
        const addresses = await AddressService.getUserAddresses(session.sub);
        return { success: true, data: addresses };
    } catch (err) {
        return { error: getPublicErrorMessage(err, "Có lỗi xảy ra khi lấy danh sách địa chỉ.") };
    }
}

export async function createAddressAction(data: AddressCreateInput) {
    const session = await getSession();
    if (!session) return { error: "Bạn chưa đăng nhập" };

    const parsed = addressSchema.safeParse(data);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    try {
        const address = await AddressService.createAddress(session.sub, parsed.data);
        return { success: true, message: "Thêm địa chỉ thành công", data: address };
    } catch (err) {
        console.error("❌ CREATE ADDRESS ERROR:", err);
        return { error: getPublicErrorMessage(err, "Có lỗi xảy ra khi thêm địa chỉ.") };
    }
}

export async function updateAddressAction(addressId: string, data: AddressCreateInput) {
    const session = await getSession();
    if (!session) return { error: "Bạn chưa đăng nhập" };

    const parsed = addressSchema.safeParse(data);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    try {
        const address = await AddressService.updateAddress(addressId, session.sub, parsed.data);
        return { success: true, message: "Cập nhật địa chỉ thành công", data: address };
    } catch (err) {
        return { error: getPublicErrorMessage(err, "Có lỗi xảy ra khi cập nhật địa chỉ.") };
    }
}

export async function deleteAddressAction(addressId: string) {
    const session = await getSession();
    if (!session) return { error: "Bạn chưa đăng nhập" };

    try {
        await AddressService.deleteAddress(addressId, session.sub);
        return { success: true, message: "Xóa địa chỉ thành công" };
    } catch (err) {
        return { error: getPublicErrorMessage(err, "Có lỗi xảy ra khi xóa địa chỉ.") };
    }
}

export async function setDefaultAddressAction(addressId: string) {
    const session = await getSession();
    if (!session) return { error: "Bạn chưa đăng nhập" };

    try {
        await AddressService.setDefaultAddress(addressId, session.sub);
        return { success: true, message: "Đã đặt làm địa chỉ mặc định" };
    } catch (err) {
        return { error: getPublicErrorMessage(err, "Có lỗi xảy ra khi đặt địa chỉ mặc định.") };
    }
}
