'use client';
import React, { useState } from 'react';
import Modal from '../../ui/Modal';
import PostForm from '../PostForm';
import type { Post } from '../../../services/posts.service';

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (post: Post) => void;
}

// Wraps PostForm in the shared Modal so the create flow can be launched
// from anywhere (the profile "create post" button, the home "create" menu).
// The key remounts PostForm whenever the modal opens, guaranteeing a clean
// editor + empty fields each time instead of stale state from a previous open.
export default function CreatePostModal({ open, onClose, onCreated }: CreatePostModalProps) {
  const [nonce] = useState(() => Math.random());

  return (
    <Modal open={open} onClose={onClose} title="إنشاء منشور" maxWidth="max-w-2xl">
      {/* key={nonce + open} forces PostForm to remount on each open so the
          TipTap editor and attachments always start fresh. */}
      <PostForm
        key={`${nonce}-${open}`}
        onCreated={(post) => {
          onCreated?.(post);
          onClose();
        }}
      />
    </Modal>
  );
}
