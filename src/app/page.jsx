import DashBoardLayerOne from "@/components/DashBoardLayerOne";
import MasterLayout from "@/masterLayout/MasterLayout";
import Breadcrumb from "@/components/Breadcrumb";

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
        <Breadcrumb title='Orders' />

        {/* DashBoardLayerOne */}
        <DashBoardLayerOne />
      </MasterLayout>
    </>
  );
};

export default Page;
