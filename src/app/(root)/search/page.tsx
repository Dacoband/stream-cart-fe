import { Suspense } from "react";
import SearchPageInner from "./components/SearchPageInner";

export default function Page() {
  return (
    <Suspense>
      <SearchPageInner />
    </Suspense>
  );
}
