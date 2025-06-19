import BreadcrumbProduct from "../components/BreadcrumbProduct";
import DescriptionProduct from "../components/DescriptionProduct";
import InforShop from "../components/InforShop";
import OperationProduct from "../components/OperationProduct";
interface ProductPageProps {
  params: { productId: string };
}

export default async function ProductPage({ params }: ProductPageProps) {
  return (
    <div className="flex flex-col w-[70%] mx-auto">
      <div className="my-2.5">
        <BreadcrumbProduct />
      </div>
      <div className="flex flex-col gap-5 w-full">
        <div className="bg-white py-8 rounded-sm w-full  mx-auto shadow">
          <OperationProduct />
        </div>
        <div className="bg-white py-5 rounded-sm w-full  mx-auto shadow">
          <InforShop />
        </div>
        <div className="bg-white py-8 rounded-sm w-full  mx-auto shadow">
          <DescriptionProduct />
        </div>
      </div>
    </div>
  );
}
