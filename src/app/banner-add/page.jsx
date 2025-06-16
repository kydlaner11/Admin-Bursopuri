import BannerAdd from "@/components/BannerAdd";
import Breadcrumb from "@/components/Breadcrumb";
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
        <Breadcrumb title='Atur Banner - Tambah' />

        {/* InvoiceAddLayer */}
        <BannerAdd />
      </MasterLayout>
    </>
  );
};

export default Page;
