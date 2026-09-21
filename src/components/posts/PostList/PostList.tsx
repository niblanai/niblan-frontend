'use client';
import React from 'react';
import PostItem from '../PostItem';
import type { Post } from '../../../services/posts.service';

interface PostListProps {
  posts: Post[];
  loading?: boolean;
  error?: string | null;
  currentAccountId?: string;
  onUpdated?: (post: Post) => void;
  onDeleted?: (id: string) => void;
}

export default function PostList({ posts, loading, error, currentAccountId, onUpdated, onDeleted }: PostListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="relative w-6 h-6">
          <div className="absolute inset-0 rounded-full border-2 border-[#E8DFCB]" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#C69A3E] animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-sm text-[#C0392B] py-16">{error}</p>;
  }

  if (posts.length === 0) {
    return <p className="text-center text-sm text-[#8A8172] py-16">لا يوجد منشورات بعد</p>;
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostItem key={post.id} post={post} currentAccountId={currentAccountId} onUpdated={onUpdated} onDeleted={onDeleted} />
      ))}
    </div>
  );
}
