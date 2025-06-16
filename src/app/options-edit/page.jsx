import Breadcrumb from "@/components/Breadcrumb";
import MenuOptionEdit from "@/components/MenuOptionEdit";
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
        <Breadcrumb title='Atur Menu - Pilihan' />

        {/* InvoiceListLayer */}
        <Suspense fallback={<div>Loading...</div>}>
          <MenuOptionEdit />
        </Suspense>
      </MasterLayout>
    </>
  );
};

export default Page;
