// pages/index.js
"use client"

import { useState } from 'react';
import PageLoader from '../../components/Pageloader';
import { BaseNeue } from '../../app/layout';

export default function Home() {
  const [loading, setLoading] = useState(true);

  const handleLoadingComplete = () => {
    setLoading(false);
  };

  return (
    <>
      {loading ? (
        <PageLoader onComplete={handleLoadingComplete} />
      ) : (
        
        <div className="flex flex-col items-center justify-center h-screen">
          <h1 className="text-6xl">Page Loaded</h1>
        </div>
      )}
    </>
  );
}