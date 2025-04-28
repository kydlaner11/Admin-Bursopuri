import SignInLayer from "@/components/SignInLayer";

export const metadata = {
  title: "Admin Bursopuri",
  description:
    "Bursopuri is a admin page for managing orders, products, and users.",
};

const Page = () => {
  return (
    <>
      {/* SignInLayer */}
      <SignInLayer />
    </>
  );
};

export default Page;
