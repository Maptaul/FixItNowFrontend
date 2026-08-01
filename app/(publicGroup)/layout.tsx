import { Footer } from "@/components/shared/footer";
import { Navbar } from "@/components/shared/navbar";

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
};

export default PublicLayout;
