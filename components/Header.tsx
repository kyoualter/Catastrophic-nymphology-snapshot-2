
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="text-center mb-16 pt-8">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 tracking-tighter">
        <span className="text-pink-500 italic block sm:inline">Catastrophic</span> 
        <span className="text-white sm:ml-2">Nymphology</span>
      </h1>
      <div className="flex items-center justify-center gap-4">
        <span className="h-px w-8 bg-gray-700"></span>
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] opacity-80">
          Erotic Theology & Metabolic Truth Studio
        </p>
        <span className="h-px w-8 bg-gray-700"></span>
      </div>
    </header>
  );
};
