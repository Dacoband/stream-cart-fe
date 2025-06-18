"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function requireRole<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  allowedRoles: string[]
) {
  return function ProtectedComponent(props: T) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    // const [dots, setDots] = useState("");

    // useEffect(() => {
    //   const interval = setInterval(() => {
    //     setDots((prev) => {
    //       if (prev === "...") return "";
    //       return prev + ".";
    //     });
    //   }, 500);

    //   return () => clearInterval(interval);
    // }, []);
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
    }

    return <WrappedComponent {...props} />;
  };
}
