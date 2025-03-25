'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

interface PhotoCardProps {
  id: string;
  url: string;
  title: string;
  votes: Array<{ id: string; value: number; userId: string }>;
  onVoteChange: (value: number) => void;
  onClick?: () => void;
}

export default function PhotoCard({ url, title, votes, onVoteChange, onClick }: PhotoCardProps) {
  const { data: session } = useSession();
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (value: number) => {
    if (isVoting || !session?.user) return;

    try {
      setIsVoting(true);
      await onVoteChange(value);
    } finally {
      setIsVoting(false);
    }
  };

  const userVote = votes.find(vote => vote.userId === session?.user?.id)?.value;

  return (
    <div className="relative h-full group" onClick={onClick}>
      <Image
        src={url}
        alt={title}
        className="object-cover rounded-lg cursor-pointer"
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex justify-center gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleVote(userVote === -1 ? 0 : -1);
            }}
            className={`px-4 py-2 rounded-md transition-colors ${
              userVote === -1 ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
            }`}
            disabled={isVoting}
          >
            👎 ({votes.filter(v => v.value === -1).length})
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleVote(userVote === 1 ? 0 : 1);
            }}
            className={`px-4 py-2 rounded-md transition-colors ${
              userVote === 1 ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'
            }`}
            disabled={isVoting}
          >
            👍 ({votes.filter(v => v.value === 1).length})
          </button>
        </div>
      </div>
    </div>
  );
} 