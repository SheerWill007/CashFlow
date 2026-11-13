import Link from 'next/link';

export function Footer() {
  return (
    <footer className="footer">
      <div>
        <div className="logo">CASHFLOW</div>
        <p>Your money, one day at a time.</p>
      </div>
      <nav aria-label="Footer sections">
        <strong>Sections</strong>
        <a href="#features">Features</a>
        <a href="#tour">Tour</a>
        <a href="#how">How it works</a>
        <a href="#faq">FAQ</a>
      </nav>
      <nav aria-label="Account">
        <strong>Account</strong>
        <Link href="/login">Log in</Link>
        <Link href="/signup">Sign up</Link>
      </nav>
    </footer>
  );
}
