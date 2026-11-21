import SalesEntryLayer from "@/components/finance/SalesEntryLayer";
import MasterLayout from "@/masterLayout/MasterLayout";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata = {
  title: "Penjualan Harian | Admin Bursopuri",
  description: "Input rekap penjualan harian per kanal.",
};

const Page = () => {
  return (
    <>
      <MasterLayout requiredRoles={["admin"]}>
        <Breadcrumb title='Penjualan Harian' />
        <SalesEntryLayer />
      </MasterLayout>
    </>
  );
};

export default Page;