"use client";

import SnakeGame from "@/components/SnakeGame";
import { MadeWithDyad } from "@/components/made-with-dyad";

const Index = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto text-center mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4 text-slate-900">
          React Snakec
        </h1>
        <p className="text-lg text-slate-600">
          A simple, fun, and addictive classic game built with React.
        </p>
      </div>
      
      <main className="flex justify-center">
        <SnakeGame />
      </main>

      <footer className="mt-12">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default Index;