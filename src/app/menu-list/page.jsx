import Breadcrumb from "@/components/Breadcrumb";
import MenuListLayer from "@/components/MenuListLayer";
import MasterLayout from "@/masterLayout/MasterLayout";

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
        <Breadcrumb title='Menu' />

        {/* InvoiceListLayer */}
        <MenuListLayer />
      </MasterLayout>
    </>
  );
};

export default Page;
