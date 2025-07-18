import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { toastUtils, handleApiError, withRetry } from '../toast';

// Mock sonner
const mockToast = {
  success: jest.fn(),
  error: jest.fn(),
  warning: jest.fn(),
  info: jest.fn(),
  loading: jest.fn(),
  promise: jest.fn(),
  dismiss: jest.fn(),
};

jest.mock('sonner', () => ({
  toast: mockToast,
}));

describe('Toast Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Success Toasts', () => {
    it('should show post created toast', () => {
      toastUtils.success.postCreated();
      expect(mockToast.success).toHaveBeenCalledWith('게시글이 성공적으로 작성되었습니다! 🎉');
    });

    it('should show comment added toast', () => {
      toastUtils.success.commentAdded();
      expect(mockToast.success).toHaveBeenCalledWith('댓글이 추가되었습니다.');
    });

    it('should show liked toast', () => {
      toastUtils.success.liked();
      expect(mockToast.success).toHaveBeenCalledWith('좋아요를 눌렀습니다! ❤️');
    });

    it('should show unliked toast', () => {
      toastUtils.success.unliked();
      expect(mockToast.success).toHaveBeenCalledWith('좋아요를 취소했습니다.');
    });
  });

  describe('Error Toasts', () => {
    it('should show generic error toast', () => {
      toastUtils.error.generic('Custom error message');
      expect(mockToast.error).toHaveBeenCalledWith('오류가 발생했습니다', {
        description: 'Custom error message'
      });
    });

    it('should show generic error toast with default message', () => {
      toastUtils.error.generic();
      expect(mockToast.error).toHaveBeenCalledWith('오류가 발생했습니다', {
        description: '다시 시도해주세요.'
      });
    });

    it('should show network error toast with retry action', () => {
      // Mock window.location.reload
      const mockReload = jest.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: mockReload },
        writable: true,
      });

      toastUtils.error.network();
      expect(mockToast.error).toHaveBeenCalledWith('네트워크 오류', {
        description: '인터넷 연결을 확인하고 다시 시도해주세요.',
        action: {
          label: '다시 시도',
          onClick: expect.any(Function)
        }
      });

      // Test the retry action
      const call = mockToast.error.mock.calls[0];
      const action = call[1].action;
      action.onClick();
      expect(mockReload).toHaveBeenCalled();
    });

    it('should show auth error toast with login action', () => {
      // Mock window.location
      Object.defineProperty(window, 'location', {
        value: { href: '' },
        writable: true,
      });

      toastUtils.error.auth();
      expect(mockToast.error).toHaveBeenCalledWith('로그인이 필요합니다', {
        description: '이 기능을 사용하려면 먼저 로그인해주세요.',
        action: {
          label: '로그인',
          onClick: expect.any(Function)
        }
      });

      // Test the login action
      const call = mockToast.error.mock.calls[0];
      const action = call[1].action;
      action.onClick();
      expect(window.location.href).toBe('/auth/sign-in');
    });

    it('should show validation error toast', () => {
      toastUtils.error.validation('Invalid input');
      expect(mockToast.error).toHaveBeenCalledWith('입력 오류', {
        description: 'Invalid input'
      });
    });

    it('should show file too large error', () => {
      toastUtils.error.fileTooLarge('5MB');
      expect(mockToast.error).toHaveBeenCalledWith('파일 크기 초과', {
        description: '파일 크기는 5MB 이하여야 합니다.'
      });
    });
  });

  describe('Promise Toasts', () => {
    it('should handle successful promise', async () => {
      const successPromise = Promise.resolve('success');

      toastUtils.promise.createPost(successPromise);

      expect(mockToast.promise).toHaveBeenCalledWith(successPromise, {
        loading: '게시글을 작성하는 중...',
        success: '게시글이 성공적으로 작성되었습니다! 🎉',
        error: expect.any(Function)
      });
    });

    it('should handle failed promise with custom error', async () => {
      const errorPromise = Promise.reject(new Error('Custom error'));

      toastUtils.promise.createPost(errorPromise);

      const call = mockToast.promise.mock.calls[0];
      const errorHandler = call[1].error;
      const result = errorHandler(new Error('Custom error'));

      expect(result).toBe('작성 실패: Custom error');
    });

    it('should handle failed promise without error message', async () => {
      const errorPromise = Promise.reject(new Error());

      toastUtils.promise.createPost(errorPromise);

      const call = mockToast.promise.mock.calls[0];
      const errorHandler = call[1].error;
      const result = errorHandler(new Error());

      expect(result).toBe('작성 실패: 다시 시도해주세요.');
    });
  });

  describe('handleApiError', () => {
    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      (console.error as jest.Mock).mockRestore();
    });

    it('should handle network errors', () => {
      const networkError = new Error('network error');
      handleApiError(networkError);

      expect(console.error).toHaveBeenCalledWith('API Error:', networkError);
      expect(mockToast.error).toHaveBeenCalledWith('네트워크 오류', expect.any(Object));
    });

    it('should handle auth errors', () => {
      const authError = new Error('401 unauthorized');
      handleApiError(authError);

      expect(mockToast.error).toHaveBeenCalledWith('로그인이 필요합니다', expect.any(Object));
    });

    it('should handle permission errors', () => {
      const permissionError = new Error('403 forbidden');
      handleApiError(permissionError);

      expect(mockToast.error).toHaveBeenCalledWith('권한 없음', expect.any(Object));
    });

    it('should handle not found errors', () => {
      const notFoundError = new Error('404 not found');
      handleApiError(notFoundError);

      expect(mockToast.error).toHaveBeenCalledWith('찾을 수 없음', expect.any(Object));
    });

    it('should handle server errors', () => {
      const serverError = new Error('500 server error');
      handleApiError(serverError);

      expect(mockToast.error).toHaveBeenCalledWith('서버 오류', expect.any(Object));
    });

    it('should handle generic errors', () => {
      const genericError = new Error('Something went wrong');
      handleApiError(genericError);

      expect(mockToast.error).toHaveBeenCalledWith('오류가 발생했습니다', {
        description: 'Something went wrong'
      });
    });

    it('should handle non-Error objects', () => {
      handleApiError('string error');

      expect(mockToast.error).toHaveBeenCalledWith('오류가 발생했습니다', {
        description: '다시 시도해주세요.'
      });
    });

    it('should include context in console log', () => {
      const error = new Error('test error');
      handleApiError(error, 'test context');

      expect(console.error).toHaveBeenCalledWith('API Error in test context:', error);
    });
  });

  describe('withRetry', () => {
    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      (console.error as jest.Mock).mockRestore();
    });

    it('should succeed on first try', async () => {
      const operation = jest.fn().mockResolvedValue('success');

      const result = await withRetry(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
      expect(mockToast.info).not.toHaveBeenCalled();
    });

    it('should retry on failure and eventually succeed', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockResolvedValue('success');

      const promise = withRetry(operation);

      // Fast-forward through the retry delays
      jest.advanceTimersByTime(2000); // First retry delay
      await Promise.resolve(); // Let the first retry execute

      jest.advanceTimersByTime(4000); // Second retry delay
      await Promise.resolve(); // Let the second retry execute

      const result = await promise;

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
      expect(mockToast.info).toHaveBeenCalledTimes(2);
      expect(mockToast.info).toHaveBeenNthCalledWith(1, '재시도 중... (1/3)');
      expect(mockToast.info).toHaveBeenNthCalledWith(2, '재시도 중... (2/3)');
    });

    it('should fail after max retries', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('persistent error'));

      const promise = withRetry(operation, 2);

      // Fast-forward through all retry delays
      jest.advanceTimersByTime(10000);

      await expect(promise).rejects.toThrow('persistent error');
      expect(operation).toHaveBeenCalledTimes(2);
      expect(mockToast.info).toHaveBeenCalledWith('재시도 중... (1/2)');
    });

    it('should use custom max retries', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('error'));

      const promise = withRetry(operation, 1);

      await expect(promise).rejects.toThrow('error');
      expect(operation).toHaveBeenCalledTimes(1);
      expect(mockToast.info).not.toHaveBeenCalled(); // No retries
    });

    it('should handle API errors with context', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('network error'));

      const promise = withRetry(operation, 1, 'test operation');

      await expect(promise).rejects.toThrow('network error');
      expect(mockToast.error).toHaveBeenCalled(); // handleApiError should be called
    });
  });
});
