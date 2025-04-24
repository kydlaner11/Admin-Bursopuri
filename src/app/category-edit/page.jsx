import Breadcrumb from "@/components/Breadcrumb";
import CategoryEditLayer from "@/components/CategoryEditLayer";
import MasterLayout from "@/masterLayout/MasterLayout";
import { Suspense } from "react";

export const metadata = {
  title: "Admin Bursopuri",
  description:
    "Wowdash NEXT JS is a developer-friendly, ready-to-use admin template designed for building attractive, scalable, and high-performing web applications.",
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
