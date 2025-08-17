import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-black/50 text-gray-400 p-4 mt-auto border-t border-orange-500/20">
      <p className="text-center">
        &copy; {new Date().getFullYear()} BeatChain. A decentralized music protocol.
      </p>
    </footer>
  );
};

export default Footer;
