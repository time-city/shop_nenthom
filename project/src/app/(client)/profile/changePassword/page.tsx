"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/src/lib/action/user.action";
import ProfilePageContent from "@/src/components/client/profileClient";
import ModalChangePassword from "@/src/components/client/changePass";
import LoadingState from "@/src/components/ui/loadingState";
import { callAction } from "@/src/lib/utils/callAction";
export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] =
    useState<Awaited<ReturnType<typeof getCurrentUser>>>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    callAction(() => getCurrentUser(), "Không thể tải thông tin tài khoản. Vui lòng thử lại sau.").then((user) => {
      if (!isMounted) return;
      if (!user) {
        router.replace("/login?redirect=/profile/changePassword");
      } else if (user.role === "ADMIN") {
        router.replace("/admin/dashboard");
      } else {
        setCurrentUser(user);
      }
      setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [router]);

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen bg-[#F2E8D9] flex items-center justify-center">
        <LoadingState label="Đang tải..." />
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100dvh-5rem)] bg-[#F2E8D9]">
      {/* 
        Hiển thị nội dung trang cá nhân làm nền dưới dạng mờ (blur), 
        ngăn chặn tương tác chuột (pointer-events-none) và làm mờ bớt (opacity).
      */}
      <div className="blur-[1.5px] pointer-events-none select-none opacity-40">
        <ProfilePageContent
          initialUser={{
            address: "",
            city: "",
            email: currentUser.email,
            fullname: currentUser.fullname ?? "",
            phone: currentUser.phone ?? "",
            role: currentUser.role,
            zip: "",
          }}
        />
      </div>

      {/* Hiển thị Modal đổi mật khẩu đè lên trên */}
      <ModalChangePassword open={true} onClose={() => router.push("/profile")} />
    </div>
  );
}
