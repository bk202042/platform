import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthProvider';
import type { User } from '@supabase/supabase-js';

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
    onAuthStateChange: jest.fn(),
    signOut: jest.fn(),
  },
};

// Mock the Supabase client creation
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient,
}));

// Test component that uses the auth context
function TestComponent() {
  const { user, loading, signOut } = useAuth();

  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="user">{user ? user.email : 'no-user'}</div>
      <button onClick={signOut} data-testid="sign-out">
        Sign Out
      </button>
    </div>
  );
}

describe('AuthProvider', () => {
  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    aud: 'authenticated',
    role: 'authenticated',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    app_metadata: {},
    user_metadata: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    });

    mockSupabaseClient.auth.signOut.mockResolvedValue({
      error: null,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should provide initial user when provided', async () => {
      render(
        <AuthProvider initialUser={mockUser}>
          <TestComponent />
        </AuthProvider>
      );

      // Should not be loading since we have initial user
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    });

    it('should show loading state when no initial user provided', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Should be loading initially
      expect(screen.getByTestId('loading')).toHaveTextContent('loading');
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });
    });

    it('should fetch user when no initial user provided', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
      });

      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledTimes(1);
    });
  });

  describe('Authentication State Changes', () => {
    it('should handle auth state changes', async () => {
      let authStateCallback: (event: string, session: any) => void = () => {};

      mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback;
        return {
          data: { subscription: { unsubscribe: jest.fn() } },
        };
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Simulate sign in
      act(() => {
        authStateCallback('SIGNED_IN', { user: mockUser });
      });

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
      });

      // Simulate sign out
      act(() => {
        authStateCallback('SIGNED_OUT', null);
      });

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      });
    });

    it('should set up auth state listener', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(mockSupabaseClient.auth.onAuthStateChange).toHaveBeenCalledTimes(1);
      expect(mockSupabaseClient.auth.onAuthStateChange).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });
  });

  describe('Sign Out', () => {
    it('should handle sign out successfully', async () => {
      render(
        <AuthProvider initialUser={mockUser}>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');

      // Click sign out
      act(() => {
        screen.getByTestId('sign-out').click();
      });

      await waitFor(() => {
        expect(mockSupabaseClient.auth.signOut).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle sign out errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      mockSupabaseClient.auth.signOut.mockRejectedValue(new Error('Sign out failed'));

      render(
        <AuthProvider initialUser={mockUser}>
          <TestComponent />
        </AuthProvider>
      );

      // Click sign out
      act(() => {
        screen.getByTestId('sign-out').click();
      });

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error signing out:', expect.any(Error));
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('should handle getUser errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      mockSupabaseClient.auth.getUser.mockRejectedValue(new Error('Failed to get user'));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
        expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching user:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Cleanup', () => {
    it('should unsubscribe from auth changes on unmount', () => {
      const unsubscribeMock = jest.fn();

      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: unsubscribeMock } },
      });

      const { unmount } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      unmount();

      expect(unsubscribeMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Hook Usage', () => {
    it('should throw error when used outside provider', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Hydration Safety', () => {
    it('should prevent hydration mismatch with initial user', () => {
      // This test ensures that when initialUser is provided,
      // the component doesn't show loading state which could cause hydration mismatch
      render(
        <AuthProvider initialUser={mockUser}>
          <TestComponent />
        </AuthProvider>
      );

      // Should immediately show user data without loading state
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');

      // Should not call getUser when initial user is provided
      expect(mockSupabaseClient.auth.getUser).not.toHaveBeenCalled();
    });

    it('should handle null initial user correctly', () => {
      render(
        <AuthProvider initialUser={null}>
          <TestComponent />
        </AuthProvider>
      );

      // Should not be loading since we have initial state (even if null)
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    });
  });
});
