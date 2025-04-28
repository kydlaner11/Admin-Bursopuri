import Breadcrumb from "@/components/Breadcrumb";
import MenuEditLayer from "@/components/MenuEditLayer";
import MasterLayout from "@/masterLayout/MasterLayout";
import { Suspense } from "react";

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
        <Breadcrumb title='Manage Menu - Edit' />

        {/* InvoiceEditLayer */}
        <Suspense fallback={<div>Loading...</div>}>
          <MenuEditLayer />
        </Suspense>
      </MasterLayout>
    </>
  );
};

export default Page;
