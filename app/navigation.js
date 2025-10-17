import Link from 'next/link';

const Navbar = () => {
    return (
        <nav>
            <Link className="pr-10" href="/">Home</Link>
            <Link className="pr-10" href="/page-loader">Page loader</Link>
            <Link className="pr-10" href="/infinite">Infinite</Link>
            <Link className="pr-10" href="/image">Moving image</Link>
<<<<<<< HEAD
=======
            <Link className="pr-10" href="/masonry-grid">Masonry</Link>
>>>>>>> b2a10674 (prova)
            <Link className="pr-10" href="/var-font">Variable font</Link>
            <Link className="pr-10" href="/var-font-2">Variable font 2</Link>
            <Link className="pr-10" href="/blur-font">Blur</Link>
            <Link className="pr-10" href="/about">About</Link>
<<<<<<< HEAD
=======
            <Link className="pr-10" href="/tracker">Tracker</Link>
>>>>>>> b2a10674 (prova)
        </nav>
    );
}
export default Navbar;