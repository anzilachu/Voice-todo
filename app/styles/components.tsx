'use client';

import styled from 'styled-components';

export const TodoContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
  padding: 1.5rem;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.04);

  @media (max-width: 640px) {
    padding: 1rem;
    border-radius: 20px;
  }
`;

export const TodoItem = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1rem;
  margin: 0.75rem 0;
  transition: all 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
`;

export const GlassNav = styled.nav`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 50;
  transition: all 0.3s ease;
`;

export const SignOutButton = styled.button`
  background: white;
  color: #374151;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);

  &:hover {
    background: #10B981;
    color: white;
    border-color: #10B981;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
  }

  @media (max-width: 640px) {
    padding: 0.5rem;
  }
`;

export const TimeButton = styled.button`
  background: #F3F4F6;
  color: #4B5563;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    background: #E5E7EB;
    color: #374151;
  }
`;

export const VoiceContainer = styled.div`
  padding: 1.5rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }

  @media (max-width: 640px) {
    padding: 1rem;
  }
`;
