import Footer from '@/components/ui/footer';
import Header from '@/components/ui/header';
import styles from './layout.module.scss';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        {children}  {/* Let children control their own container */}
      </main>
      <Footer />
    </div>
  );
}
