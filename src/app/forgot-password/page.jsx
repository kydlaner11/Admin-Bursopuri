import ForgotPasswordLayer from "@/components/ForgotPasswordLayer";

export const metadata = {
  title: "Admin Bursopuri",
  description:
    "Bursopuri is a admin page for managing orders, products, and users.",
};

const Page = () => {
  return (
    <>
      {/* ForgotPasswordLayer */}
      <ForgotPasswordLayer />
    </>
  );
};

export default Page;
