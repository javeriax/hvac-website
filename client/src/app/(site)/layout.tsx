import { Grain } from '@/components/brand';
import { Footer } from '@/components/site/Footer';
import { Navbar } from '@/components/site/Navbar';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Grain />
      <Navbar />
      <main className="relative z-10">{children}</main>
      <Footer />
    </>
  );
}
