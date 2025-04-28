import Breadcrumb from "@/components/Breadcrumb";
import CategoryEditLayer from "@/components/CategoryEditLayer";
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
        <Breadcrumb title='Manage Category - Add' />

        {/* Suspense Boundary */}
        <Suspense fallback={<div>Loading...</div>}>
          <CategoryEditLayer />
        </Suspense>
      </MasterLayout>
    </>
  );
};

export default Page;
