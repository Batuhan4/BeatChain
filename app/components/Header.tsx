import React from 'react';
import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-black/30 backdrop-blur-lg text-white p-4 flex justify-between items-center border-b border-orange-500/20 sticky top-0 z-50">
      <h1 className="text-3xl font-bold text-orange-500 hover:text-orange-400 transition-colors">
        <Link href="/">BeatChain</Link>
      </h1>
      <nav>
        <ul className="flex items-center space-x-4 md:space-x-6 text-lg">
          <li>
            <Link href="/tracks" className="hover:text-orange-400 transition-colors">Tracks</Link>
          </li>
          <li>
            <Link href="/about" className="hover:text-orange-400 transition-colors">About</Link>
          </li>
          <li>
            <Link 
              href="/start" 
              className="bg-orange-600 text-white font-bold py-2 px-5 rounded-full hover:bg-orange-500 transition-colors"
            >
              Start a Beat
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
