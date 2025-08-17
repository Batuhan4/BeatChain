import React from 'react';
import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-black/50 backdrop-blur-md text-white p-4 flex justify-between items-center border-b border-cyber-orange/20 sticky top-0 z-50">
      <h1 className="text-2xl md:text-3xl font-bold text-cyber-orange hover:text-orange-400 transition-colors">
        <Link href="/">BeatChain</Link>
      </h1>
      <nav>
        <ul className="flex items-center space-x-4 md:space-x-6 text-sm md:text-lg">
          <li>
            <Link href="/tracks" className="hover:text-orange-400 transition-colors">Tracks</Link>
          </li>
          <li>
            <Link 
              href="/start" 
              className="bg-cyber-orange text-black font-bold py-2 px-4 rounded-md hover:bg-orange-400 transition-colors"
            >
              Start Beat
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
