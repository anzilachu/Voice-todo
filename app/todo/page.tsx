'use client';

import { useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import VoiceInput from '../components/VoiceInput';
import TodoList from '../components/TodoList';
import { GlassNav, SignOutButton, VoiceContainer } from '../styles/components';

export default function TodoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const todoListRef = useRef<{ handleTasksCreated: (tasks: string[]) => void }>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/');
    }
  }, [status, router]);

  const handleTasksCreated = (tasks: string[]) => {
    todoListRef.current?.handleTasksCreated(tasks);
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Good night';
  };

  const getFirstName = (name: string | null | undefined) => {
    if (!name) return '';
    return name.split(' ')[0];
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <GlassNav>
        <div className="max-w-3xl mx-auto px-4 md:px-6 h-16 flex items-center justify-end">
          <SignOutButton onClick={handleSignOut} title="Sign out">
            <span className="hidden sm:inline">Sign out</span>
            <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </SignOutButton>
        </div>
      </GlassNav>

      <main className="max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="space-y-8">
          <div className="space-y-1">
            <h1 className="text-2xl font-medium text-gray-900">
              {getGreeting()}{session?.user?.name ? `, ${getFirstName(session.user.name)}` : ''}
            </h1>
            <p className="text-gray-500">
              What would you like to accomplish today?
            </p>
          </div>

          <div className="space-y-6">
            <VoiceContainer>
              <VoiceInput onTasksCreated={handleTasksCreated} />
            </VoiceContainer>
            <TodoList ref={todoListRef} onTasksCreated={handleTasksCreated} />
          </div>
        </div>
      </main>
    </div>
  );
}
