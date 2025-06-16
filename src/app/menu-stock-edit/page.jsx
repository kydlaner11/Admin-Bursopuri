import Breadcrumb from "@/components/Breadcrumb";
import MenuStockEdit from "@/components/MenuStockEdit";;
import MasterLayout from "@/masterLayout/MasterLayout";
import { Suspense } from "react";

export const metadata = {
  title: "Admin Bursopuri",
  description:
    "Bursopuri is a admin page for managing orders, products, and users.",
};

const Page = () => {
  return (
    <>
      {/* MasterLayout */}
      <MasterLayout requiredRoles={['admin']}>
        {/* Breadcrumb */}
        <Breadcrumb title='Atur Stok - Edit' />

        {/* Suspense Boundary */}
        <Suspense fallback={<div>Loading...</div>}>
          <MenuStockEdit />
        </Suspense>
      </MasterLayout>
    </>
  );
};

export default Page;
