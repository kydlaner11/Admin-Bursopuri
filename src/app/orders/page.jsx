import Breadcrumb from "@/components/Breadcrumb";
import OrderProccess from "@/components/child/OrdersProccess";
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
      <MasterLayout requiredRoles={['kepala_dapur']}>
        {/* Breadcrumb */}
        <Breadcrumb title='Proses Pesanan' />

        {/* TypographyLayer */}
        <OrderProccess />
      </MasterLayout>
    </>
  );
};

export default Page;
