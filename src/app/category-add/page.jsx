import Breadcrumb from "@/components/Breadcrumb";
import CategoryAddLayer from "@/components/CategoryAddLayer";
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
        <Breadcrumb title='Manage Category - Add' />

        {/* InvoiceAddLayer */}
        <CategoryAddLayer />
      </MasterLayout>
    </>
  );
};

export default Page;
