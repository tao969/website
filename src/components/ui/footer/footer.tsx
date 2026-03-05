import { AUTHOR } from '@/config';
import styles from './footer.module.scss';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className="container">
        <p className={styles.copy}>
          &copy;&nbsp;{year}&nbsp;{AUTHOR.name}
        </p>
      </div>
    </footer>
  );
}
