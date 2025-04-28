import Breadcrumb from "@/components/Breadcrumb";
import MenuAddLayer from "@/components/MenuAddLayer";
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
      <MasterLayout>
        {/* Breadcrumb */}
        <Breadcrumb title='Manage Menu - Add' />

        {/* InvoiceAddLayer */}
        <MenuAddLayer />
      </MasterLayout>
    </>
  );
};

export default Page;
