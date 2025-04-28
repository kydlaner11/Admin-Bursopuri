import Breadcrumb from "@/components/Breadcrumb";
import MenuStockLayer from "@/components/MenuStockLayer";
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
        <Breadcrumb title='Manage Menu - Stock' />

        {/* InvoicePreviewLayer */}
        <MenuStockLayer />
      </MasterLayout>
    </>
  );
};

export default Page;
