'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface Vote {
  id: string;
  value: number;
  userId: string;
}

interface PhotoCardProps {
  id: string;
  url: string;
  title: string | null;
  votes: Vote[];
  onVoteChange: (value: number) => void;
}

export default function PhotoCard({ id, url, title, votes, onVoteChange }: PhotoCardProps) {
  const { data: session } = useSession();
  const [isVoting, setIsVoting] = useState(false);

  const upvotes = votes.filter(vote => vote.value === 1).length;
  const downvotes = votes.filter(vote => vote.value === -1).length;
  const score = upvotes - downvotes;

  // Find the user's current vote if it exists
  const userVote = session?.user?.id ? votes.find(vote => vote.userId === session.user.id) : null;

  const handleVote = async (value: number) => {
    if (isVoting || !session?.user?.id) return;

    try {
      setIsVoting(true);
      
      // If clicking the same button that's already active, we're unvoting
      const isUnvoting = userVote?.value === value;
      
      const response = await fetch(`/api/photos/${id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          value: isUnvoting ? 0 : value // Send 0 to indicate unvote
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to vote');
      }

      onVoteChange(isUnvoting ? 0 : value);
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="relative h-full group">
      <img
        src={url}
        alt={title || 'Photo'}
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-4 text-sm">
          <button
            onClick={() => handleVote(1)}
            disabled={isVoting}
            className={`flex items-center gap-1 ${
              userVote?.value === 1
                ? 'text-green-400'
                : 'text-gray-200 hover:text-green-400'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={userVote?.value === 1 ? "Remove upvote" : "Upvote"}
          >
            <span className="text-lg">👍</span>
            <span>{upvotes}</span>
          </button>
          <button
            onClick={() => handleVote(-1)}
            disabled={isVoting}
            className={`flex items-center gap-1 ${
              userVote?.value === -1
                ? 'text-red-400'
                : 'text-gray-200 hover:text-red-400'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={userVote?.value === -1 ? "Remove downvote" : "Downvote"}
          >
            <span className="text-lg">👎</span>
            <span>{downvotes}</span>
          </button>
          <span className="text-gray-200 ml-auto">
            Score: {score}
          </span>
        </div>
      </div>
    </div>
  );
} 