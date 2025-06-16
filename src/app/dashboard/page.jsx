import DashBoardLayerTen from "@/components/DashBoardLayerTen";
import MasterLayout from "@/masterLayout/MasterLayout";
import { Breadcrumb } from "react-bootstrap";
import { withAuth } from "@/utils/auth";

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
        <Breadcrumb title='Dashboard' />

        {/* DashBoardLayerTen */}
        <DashBoardLayerTen />
      </MasterLayout>
    </>
  );
};

export default Page;
