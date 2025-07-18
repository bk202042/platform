import { toast } from "sonner";

// Toast utility functions with Korean messages
export const toastUtils = {
  // Success messages
  success: {
    postCreated: () => toast.success("게시글이 성공적으로 작성되었습니다! 🎉"),
    postUpdated: () => toast.success("게시글이 수정되었습니다."),
    postDeleted: () => toast.success("게시글이 삭제되었습니다."),
    commentAdded: () => toast.success("댓글이 추가되었습니다."),
    commentDeleted: () => toast.success("댓글이 삭제되었습니다."),
    liked: () => toast.success("좋아요를 눌렀습니다! ❤️"),
    unliked: () => toast.success("좋아요를 취소했습니다."),
    imageUploaded: () => toast.success("이미지가 업로드되었습니다."),
    saved: () => toast.success("저장되었습니다."),
  },

  // Error messages
  error: {
    generic: (message?: string) =>
      toast.error("오류가 발생했습니다", {
        description: message || "다시 시도해주세요.",
      }),
    network: () =>
      toast.error("네트워크 오류", {
        description: "인터넷 연결을 확인하고 다시 시도해주세요.",
        action: {
          label: "다시 시도",
          onClick: () => window.location.reload(),
        },
      }),
    auth: () =>
      toast.error("로그인이 필요합니다", {
        description: "이 기능을 사용하려면 먼저 로그인해주세요.",
        action: {
          label: "로그인",
          onClick: () => (window.location.href = "/auth/sign-in"),
        },
      }),
    validation: (message: string) =>
      toast.error("입력 오류", {
        description: message,
      }),
    server: () =>
      toast.error("서버 오류", {
        description: "일시적인 서버 문제입니다. 잠시 후 다시 시도해주세요.",
      }),
    notFound: (resource: string = "데이터") =>
      toast.error("찾을 수 없음", {
        description: `요청하신 ${resource}를 찾을 수 없습니다.`,
      }),
    permission: () =>
      toast.error("권한 없음", {
        description: "이 작업을 수행할 권한이 없습니다.",
      }),
    imageUpload: (message?: string) =>
      toast.error("이미지 업로드 실패", {
        description: message || "이미지 업로드 중 오류가 발생했습니다.",
      }),
    fileTooLarge: (maxSize: string) =>
      toast.error("파일 크기 초과", {
        description: `파일 크기는 ${maxSize} 이하여야 합니다.`,
      }),
    invalidFileType: () =>
      toast.error("지원하지 않는 파일 형식", {
        description: "JPG, PNG, GIF 파일만 업로드 가능합니다.",
      }),
  },

  // Warning messages
  warning: {
    unsavedChanges: () =>
      toast.warning("저장되지 않은 변경사항", {
        description: "변경사항이 저장되지 않았습니다.",
      }),
    sessionExpiring: () =>
      toast.warning("세션 만료 예정", {
        description: "곧 로그아웃됩니다. 작업을 저장해주세요.",
        action: {
          label: "세션 연장",
          onClick: () => window.location.reload(),
        },
      }),
    slowConnection: () =>
      toast.warning("연결 속도가 느립니다", {
        description: "네트워크 상태를 확인해주세요.",
      }),
  },

  // Info messages
  info: {
    loading: (message: string = "처리 중...") => toast.loading(message),
    offline: () =>
      toast.info("오프라인 모드", {
        description: "인터넷 연결이 복구되면 자동으로 동기화됩니다.",
      }),
    maintenance: () =>
      toast.info("시스템 점검", {
        description: "일부 기능이 일시적으로 제한될 수 있습니다.",
      }),
  },

  // Promise-based toasts for async operations
  promise: {
    createPost: (promise: Promise<unknown>) =>
      toast.promise(promise, {
        loading: "게시글을 작성하는 중...",
        success: "게시글이 성공적으로 작성되었습니다! 🎉",
        error: (error) => `작성 실패: ${error.message || "다시 시도해주세요."}`,
      }),
    updatePost: (promise: Promise<unknown>) =>
      toast.promise(promise, {
        loading: "게시글을 수정하는 중...",
        success: "게시글이 수정되었습니다.",
        error: (error) => `수정 실패: ${error.message || "다시 시도해주세요."}`,
      }),
    deletePost: (promise: Promise<unknown>) =>
      toast.promise(promise, {
        loading: "게시글을 삭제하는 중...",
        success: "게시글이 삭제되었습니다.",
        error: (error) => `삭제 실패: ${error.message || "다시 시도해주세요."}`,
      }),
    uploadImage: (promise: Promise<unknown>) =>
      toast.promise(promise, {
        loading: "이미지를 업로드하는 중...",
        success: "이미지가 업로드되었습니다.",
        error: (error) =>
          `업로드 실패: ${error.message || "다시 시도해주세요."}`,
      }),
    signOut: (promise: Promise<unknown>) =>
      toast.promise(promise, {
        loading: "로그아웃하는 중...",
        success: "로그아웃되었습니다.",
        error: "로그아웃 중 오류가 발생했습니다.",
      }),
  },
};

// Error handler utility
export function handleApiError(error: unknown, context?: string) {
  console.error(`API Error${context ? ` in ${context}` : ""}:`, error);

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes("network") || message.includes("fetch")) {
      toastUtils.error.network();
    } else if (message.includes("401") || message.includes("unauthorized")) {
      toastUtils.error.auth();
    } else if (message.includes("403") || message.includes("forbidden")) {
      toastUtils.error.permission();
    } else if (message.includes("404") || message.includes("not found")) {
      toastUtils.error.notFound();
    } else if (message.includes("500") || message.includes("server")) {
      toastUtils.error.server();
    } else {
      toastUtils.error.generic(error.message);
    }
  } else {
    toastUtils.error.generic();
  }
}

// Retry utility with toast feedback
export function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  context?: string,
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        resolve(result);
        return;
      } catch (error) {
        lastError = error;

        if (attempt < maxRetries) {
          toast.info(`재시도 중... (${attempt}/${maxRetries})`);
          // Wait before retry with exponential backoff
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempt) * 1000),
          );
        }
      }
    }

    handleApiError(lastError, context);
    reject(lastError);
  });
}
