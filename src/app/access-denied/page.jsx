import AccessDeniedLayer from "@/components/AccessDeniedLayer";

export const metadata = {
  title: "Admin Bursopuri",
  description:
    "Bursopuri is a admin page for managing orders, products, and users.",
};

const Page = () => {
  return (
    <>
      <AccessDeniedLayer />
    </>
  );
};

export default Page;
