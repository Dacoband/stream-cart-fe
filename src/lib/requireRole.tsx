import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function requireRole<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  allowedRoles: string[]
) {
  return function ProtectedComponent(props: T) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
      const userStr = localStorage.getItem("user");

      if (userStr) {
        const user = JSON.parse(userStr);
        if (allowedRoles.includes(user.role)) {
          setIsAuthorized(true);
        } else {
          router.push("/unauthorized");
        }
      } else {
        router.push("/authentication");
      }
    }, []);

    if (isAuthorized === null) {
      return (
        <p className="text-center mt-10">🔒 Đang kiểm tra quyền truy cập...</p>
      );
    }

    return <WrappedComponent {...props} />;
  };
}
