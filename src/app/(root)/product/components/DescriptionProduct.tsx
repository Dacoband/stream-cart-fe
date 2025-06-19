import React from "react";

function DescriptionProduct() {
  return (
    <div className=" mx-auto px-8 ">
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-medium text-gray-800 ">
            Chi Tiết Sản Phẩm
          </span>
        </div>
      </div>
      <div className="p-4 space-y-8 mt-5">
        <div className="w-full flex gap-3 ">
          <div className=" text-gray-500 w-[150px] flex items-center ">
            Danh mục
          </div>
          <div className="flex-1 grid-flow-col space-x-2.5">Đồ chơi</div>
        </div>
        <div className="w-full flex gap-3 ">
          <div className=" text-gray-500 w-[150px] flex items-center ">
            Khối lượng
          </div>
          <div className="flex-1 grid-flow-col space-x-2.5">1kg</div>
        </div>
        <div className="w-full flex gap-3">
          <div className=" text-gray-500 w-[150px] flex items-center ">
            Kích thước
          </div>
          <div className="flex-1 grid-flow-col space-x-2.5">30x40x50</div>
        </div>
        <div className="w-full flex gap-3 ">
          <div className=" text-gray-500 w-[150px] flex items-center ">
            Số lượng trong kho
          </div>
          <div className="flex-1 grid-flow-col space-x-2.5">99</div>
        </div>
        <div className="w-full flex gap-3 ">
          <div className=" text-gray-500 w-[150px]  ">Mô tả</div>
          <div className="flex-1 grid-flow-col space-x-2.5">
            Lời muốn nói ✨ Sản phẩm được may và đo theo phương pháp thủ công
            đơn vị do đó sẽ có những chênh lệch về kích thước từ trong quá trình
            sản xuất 1-3 Cm ✨ Mỗi Sẩn phẩm sẽ có cách đo riêng theo kích thước
            vải hay theo kích thước thành phẩm hay tính từ chân đến đầu gấu bông
            ✨ Khi vận chuyển gấu bông sẽ được hút chân không để tiện cho vận
            chuyển lên khi khách hàng nhận gấu bông sẽ hiện tượng móp nhẹ ở một
            vài chỗ. Nhưng khách hàng cứ yên tâm đợi 2-3h gấu bông sẽ tự đàn hồi
            lại về dáng ban đầu ✨ Mọi thắc mắc hay yêu cầu khách hàng inbox để
            được shop hỗ trợ chu đáo
          </div>
        </div>
      </div>
    </div>
  );
}

export default DescriptionProduct;
