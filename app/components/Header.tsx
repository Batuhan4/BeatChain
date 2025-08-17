import React from 'react';
import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold">
        <Link href="/">BeatChain</Link>
      </h1>
      <nav>
        <ul className="flex space-x-4">
          <li>
            <Link href="/about">About</Link>
          </li>
          <li>
            <Link href="/artists">Artists</Link>
          </li>
          <li>
            <Link href="/tracks">Tracks</Link>
          </li>
          <li>
            <Link href="/upload">Upload</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
