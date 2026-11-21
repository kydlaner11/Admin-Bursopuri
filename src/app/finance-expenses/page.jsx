import ExpenseLayer from "@/components/finance/ExpenseLayer";
import MasterLayout from "@/masterLayout/MasterLayout";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata = {
  title: "Pengeluaran | Admin Bursopuri",
  description: "Catat pengeluaran, gaji pemilik, dan pemasukan lain.",
};

const Page = () => {
  return (
    <>
      <MasterLayout requiredRoles={["admin"]}>
        <Breadcrumb title='Pengeluaran' />
        <ExpenseLayer />
      </MasterLayout>
    </>
  );
};

export default Page;