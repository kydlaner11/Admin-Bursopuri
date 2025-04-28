import SignUpLayer from "@/components/SignUpLayer";

export const metadata = { 
  title: "Admin Bursopuri",
  description:
    "Bursopuri is a admin page for managing orders, products, and users.",
};

const Page = () => {
  return (
    <>
      {/* SignUpLayer */}
      <SignUpLayer />
    </>
  );
};

export default Page;
