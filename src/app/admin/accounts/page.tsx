import React from "react";
import TableAccount from "../components/TableAccount";

function page() {
  return (
    <div className="flex flex-col gap-5 min-h-full">
      <div className="bg-white sticky top-0  z-10 h-fit w-full py-4 px-8 shadow flex justify-between items-center">
        <div className="">
          <h2 className="text-xl font-bold">Danh sách tài khoản</h2>
        </div>
      </div>
      <div className="mx-5 mb-10">
        <TableAccount />
      </div>
    </div>
  );
}

export default page;
