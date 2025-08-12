import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import LoadingScreen from "@/components/common/LoadingScreen";

// export function withRoleProtection<P>(
//   WrappedComponent: React.ComponentType<P>,
//   allowedRoles: Array<0 | 1 | 2 | 3 | 4 | 5>
// ) {
//   const ProtectedComponent: React.FC<React.PropsWithChildren<P>> = (props) => {
//     const { user, loading } = useAuth();
//     const router = useRouter();

//     const isAllowedRole = (role: number): role is 0 | 1 | 2 | 3 | 4 | 5 =>
//       [0, 1, 2, 3, 4, 5].includes(role);

//     useEffect(() => {
//       if (
//         !loading &&
//         (!user ||
//           !isAllowedRole(user.role) ||
//           !allowedRoles.includes(user.role))
//       ) {
//         router.push("/authentication/login");
//       }
//     }, [user, loading, router]);

//     if (
//       loading ||
//       !user ||
//       !isAllowedRole(user.role) ||
//       !allowedRoles.includes(user.role)
//     ) {
//       // Đợi redirect hoặc đang loading
//       return (
//         <div className="w-full">
//           <LoadingScreen />
//         </div>
//       );
//     }

//     return <WrappedComponent {...props} />;
//   };

//   return ProtectedComponent;
// }

export function withRoleProtection<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  allowedRoles: Array<0 | 1 | 2 | 3 | 4 | 5>
) {
  const ProtectedComponent = (props: P) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    const isAllowedRole = (role: number): role is 0 | 1 | 2 | 3 | 4 | 5 =>
      [0, 1, 2, 3, 4, 5].includes(role);

    useEffect(() => {
      if (
        !loading &&
        (!user ||
          !isAllowedRole(user.role) ||
          !allowedRoles.includes(user.role))
      ) {
        router.push("/authentication/login");
      }
    }, [user, loading, router]);

    if (
      loading ||
      !user ||
      !isAllowedRole(user.role) ||
      !allowedRoles.includes(user.role)
    ) {
      return (
        <div className="w-full">
          <LoadingScreen />
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };

  ProtectedComponent.displayName = `withRoleProtection(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return ProtectedComponent;
}
