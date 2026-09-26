import Link from "next/link";

const navItems = [
  { href: "/discover", label: "Discover" },
  { href: "/rank", label: "Rank" },
  { href: "/watched", label: "Watched" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/account", label: "Account" },
];

export function AppHeader() {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link className="brand" href="/">
          watchnotes
        </Link>

        <nav className="app-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
