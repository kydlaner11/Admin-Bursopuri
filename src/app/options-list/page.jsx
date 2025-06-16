import Breadcrumb from "@/components/Breadcrumb";
import MenuOptionLayer from "@/components/MenuOptionLayer";
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
        <Breadcrumb title='Pilihan Menu' />

        {/* InvoiceListLayer */}
        <MenuOptionLayer />
      </MasterLayout>
    </>
  );
};

export default Page;
