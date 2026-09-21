import React from 'react';
import Leaderboard from '../forest/Leaderboard/Leaderboard';

export default function Leaderboards() {
  return (
    <section className="p-6">
      <h1 className="text-2xl font-semibold">Leaderboards</h1>
      <div className="mt-4">
        <Leaderboard />
      </div>
    </section>
  );
}
