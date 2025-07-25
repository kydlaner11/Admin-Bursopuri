import Breadcrumb from "@/components/Breadcrumb";
import TypographyLayer from "@/components/TypographyLayer";
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
      <MasterLayout requiredRoles={['admin', 'kepala_dapur']}>
        {/* Breadcrumb */}
        <Breadcrumb title='Riwayat Pesanan' />

        {/* TypographyLayer */}
        <TypographyLayer />
      </MasterLayout>
    </>
  );
};

export default Page;
