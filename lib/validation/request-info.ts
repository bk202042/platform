import { z } from "zod";

export const RequestInfoSchema = z.object({
  name: z.string().min(2, "이름은 필수입니다."),
  phone: z.string().optional(),
  email: z.string().email("유효하지 않은 이메일 주소입니다."),
  message: z.string().min(10, "메시지는 최소 10자 이상이어야 합니다."),
});

export type RequestInfo = z.infer<typeof RequestInfoSchema>;
