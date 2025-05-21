import Breadcrumb from "@/components/Breadcrumb";
import MenuOptionAdd from "@/components/MenuOptionAdd";
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
        <Breadcrumb title='Manage Menu - Options' />

        {/* InvoiceListLayer */}
        <MenuOptionAdd />
      </MasterLayout>
    </>
  );
};

export default Page;
