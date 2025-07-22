// utils/withRoleProtection.tsx
import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import LoadingScreen from "@/components/common/LoadingScreen";

export function withRoleProtection<P>(
  WrappedComponent: React.ComponentType<P>,
  allowedRoles: Array<0 | 1 | 2 | 3>
) {
  const ProtectedComponent: React.FC<React.PropsWithChildren<P>> = (props) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    if (loading)
      return (
        <div className="w-full">
          <LoadingScreen />
        </div>
      );

    const isAllowedRole = (role: number): role is 0 | 1 | 2 | 3 =>
      [0, 1, 2, 3].includes(role);

    if (
      !user ||
      !isAllowedRole(user.role) ||
      !allowedRoles.includes(user.role)
    ) {
      router.push("/unauthorized");
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  return ProtectedComponent;
}
