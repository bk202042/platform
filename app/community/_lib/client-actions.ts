"use client";

import { createPostSchema } from "@/lib/validation/community";
import { z } from "zod";
import { createCommunityPost as serverCreateCommunityPost } from "./actions";

// 클라이언트에서 사용할 수 있는 래퍼 함수
export async function createCommunityPost(
  values: z.infer<typeof createPostSchema>
) {
  // FormData 객체 생성
  const formData = new FormData();

  // values 객체의 각 필드를 FormData에 추가
  Object.entries(values).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      // 배열인 경우 (예: images)
      value.forEach((item) => {
        formData.append(key, item);
      });
    } else if (value !== undefined && value !== null) {
      // undefined나 null이 아닌 경우에만 추가
      formData.append(key, value.toString());
    }
  });

  // 서버 액션 호출 - 빈 ActionState 객체 전달
  return serverCreateCommunityPost({}, formData);
}
