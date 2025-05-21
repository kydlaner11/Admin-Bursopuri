import UnauthorizedPage from "@/components/Unauthorized";

export const metadata = { 
  title: "Admin Bursopuri",
  description:
    "Bursopuri is a admin page for managing orders, products, and users.",
};

const Page = () => {
  return (
    <>
      {/* SignUpLayer */}
      <UnauthorizedPage />
    </>
  );
};

export default Page;