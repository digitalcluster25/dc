import React from 'react';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Digital Cluster 25 - Building the Future Web</title>
        <meta name="description" content="Digital Cluster 25 starts here. Welcome to our journey of building innovative web solutions and digital experiences. Join us as we create the future of web development." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: "url('/dc25_bg.jpg')"
      }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      
      <div className="text-center relative z-10">
        <h1 className="text-6xl font-bold text-white mb-8 leading-tight drop-shadow-lg">
          Digital Cluster 25<br />
          starts here
        </h1>
        <p className="text-2xl text-blue-200 font-light drop-shadow-md">
          Welcome, let's build our web.
        </p>
      </div>
    </div>
    </>
  );
}
