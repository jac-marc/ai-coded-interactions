import Link from 'next/link';
import { Space_Grotesk } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({
    subsets: ['latin'],
    weight: '400',
    style: 'normal',
    display: 'swap',
});

const NAV_ITEMS = [
    { href: '/', label: 'Home' },
    { href: '/page-loader', label: 'Page loader' },
    { href: '/infinite', label: 'Infinite' },
    { href: '/image', label: 'Moving image' },
    { href: '/var-font', label: 'Variable font' },
    { href: '/var-font-2', label: 'Variable font 2' },
    { href: '/blur-font', label: 'Blur' },
    { href: '/about', label: 'About' },
    //{ href: '/endless-void', label: 'Void' },
    { href: '/3d-number', label: '3d number' },
    { href: '/email-gestures', label: 'Email gestures' },
];

const Navbar = () => {
    return (
        <nav
            className={spaceGrotesk.className}
            style={{ fontOpticalSizing: 'auto', fontSizeAdjust: 'from-font' }}
        >
            {NAV_ITEMS.map(({ href, label }) => (
                <Link key={href} className="pr-10" href={href}>
                    {label}
                </Link>
            ))}
        </nav>
    );
};

export default Navbar;
