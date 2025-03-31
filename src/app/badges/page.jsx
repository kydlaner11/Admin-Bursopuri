import BadgesLayer from "@/components/BadgesLayer";
import Breadcrumb from "@/components/Breadcrumb";
import MasterLayout from "@/masterLayout/MasterLayout";

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
        <Breadcrumb title='Components / Badges' />

        {/* BadgesLayer */}
        <BadgesLayer />
      </MasterLayout>
    </>
  );
};

export default Page;
