import Breadcrumb from "@/components/Breadcrumb";
import FaqLayer from "@/components/FaqLayer";
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
        <Breadcrumb title='Faq' />

        {/* FaqLayer */}
        <FaqLayer />
      </MasterLayout>
    </>
  );
};

export default Page;
