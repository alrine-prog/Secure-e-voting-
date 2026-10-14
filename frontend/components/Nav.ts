import Link from 'next/link';
export default function Nav() {
  return (
    <nav style={{ marginBottom: 16 }}>
      <Link href="/"><a>Home</a></Link>
      <Link href="/admin"><a>Admin</a></Link>
      <Link href="/staff"><a>Staff</a></Link>
      <Link href="/voter"><a>Voter</a></Link>
    </nav>
  );
}
