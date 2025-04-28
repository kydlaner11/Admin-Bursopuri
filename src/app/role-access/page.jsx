import Breadcrumb from "@/components/Breadcrumb";
import RoleAccessLayer from "@/components/RoleAccessLayer";
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
        <Breadcrumb title='Role Access' />

        {/* RoleAccessLayer */}
        <RoleAccessLayer />
      </MasterLayout>
    </>
  );
};

export default Page;
