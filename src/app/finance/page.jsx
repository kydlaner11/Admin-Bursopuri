import FinanceDashboardLayer from "@/components/finance/FinanceDashboardLayer";
import MasterLayout from "@/masterLayout/MasterLayout";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata = {
  title: "Keuangan | Admin Bursopuri",
  description: "Ringkasan keuangan Bursopuri: omzet, pengeluaran, dan target harian.",
};

const Page = () => {
  return (
    <>
      <MasterLayout requiredRoles={["admin"]}>
        <Breadcrumb title='Keuangan' />
        <FinanceDashboardLayer />
      </MasterLayout>
    </>
  );
};

export default Page;