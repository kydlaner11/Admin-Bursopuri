import DashBoardLayerTen from "@/components/DashBoardLayerTen";
import MasterLayout from "@/masterLayout/MasterLayout";
import { Breadcrumb } from "react-bootstrap";

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
        <Breadcrumb title='POS & Inventory' />

        {/* DashBoardLayerTen */}
        <DashBoardLayerTen />
      </MasterLayout>
    </>
  );
};

export default Page;
