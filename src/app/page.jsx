import DashBoardLayerOne from "@/components/DashBoardLayerOne";
import MasterLayout from "@/masterLayout/MasterLayout";
import Breadcrumb from "@/components/Breadcrumb";

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
        <Breadcrumb title='Pesanan' />

        {/* DashBoardLayerOne */}
        <DashBoardLayerOne />
      </MasterLayout>
    </>
  );
};

export default Page;
