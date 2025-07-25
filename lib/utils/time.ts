import { format, isToday, isYesterday, differenceInMinutes, differenceInHours, differenceInDays } from "date-fns";
import { ko } from "date-fns/locale";

/**
 * Format date in Korean Daangn-style relative time format
 * Examples: "방금 전", "5분 전", "2시간 전", "3일 전", "2023.12.25"
 */
export function formatKoreanTime(dateString: string | Date): string {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    const now = new Date();
    
    // Check if date is invalid
    if (isNaN(date.getTime())) {
      return "시간 정보 없음";
    }
    
    const minutesAgo = differenceInMinutes(now, date);
    const hoursAgo = differenceInHours(now, date);
    const daysAgo = differenceInDays(now, date);
    
    // Just now (less than 1 minute)
    if (minutesAgo < 1) {
      return "방금 전";
    }
    
    // Minutes ago (1-59 minutes)
    if (minutesAgo < 60) {
      return `${minutesAgo}분 전`;
    }
    
    // Hours ago (1-23 hours)
    if (hoursAgo < 24) {
      return `${hoursAgo}시간 전`;
    }
    
    // Days ago (1-6 days)
    if (daysAgo < 7) {
      return `${daysAgo}일 전`;
    }
    
    // Weeks ago (1-3 weeks)
    if (daysAgo < 30) {
      const weeksAgo = Math.floor(daysAgo / 7);
      return `${weeksAgo}주 전`;
    }
    
    // More than a month - show actual date
    return format(date, "yyyy.MM.dd", { locale: ko });
    
  } catch (error) {
    console.error("Error formatting Korean time:", error);
    return "시간 정보 없음";
  }
}

/**
 * Format date for detailed view (used in post details, comments)
 * Examples: "2023년 12월 25일 오후 3:30", "오늘 오후 3:30", "어제 오전 11:15"
 */
export function formatKoreanDateTime(dateString: string | Date): string {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    
    if (isNaN(date.getTime())) {
      return "시간 정보 없음";
    }
    
    if (isToday(date)) {
      return `오늘 ${format(date, "a h:mm", { locale: ko })}`;
    }
    
    if (isYesterday(date)) {
      return `어제 ${format(date, "a h:mm", { locale: ko })}`;
    }
    
    return format(date, "yyyy년 MM월 dd일 a h:mm", { locale: ko });
    
  } catch (error) {
    console.error("Error formatting Korean datetime:", error);
    return "시간 정보 없음";
  }
}

/**
 * Format time for activity logs and notifications
 * Examples: "방금", "5분", "2시간", "3일", "1주"
 */
export function formatKoreanActivityTime(dateString: string | Date): string {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    const now = new Date();
    
    if (isNaN(date.getTime())) {
      return "알 수 없음";
    }
    
    const minutesAgo = differenceInMinutes(now, date);
    const hoursAgo = differenceInHours(now, date);
    const daysAgo = differenceInDays(now, date);
    
    if (minutesAgo < 1) return "방금";
    if (minutesAgo < 60) return `${minutesAgo}분`;
    if (hoursAgo < 24) return `${hoursAgo}시간`;
    if (daysAgo < 7) return `${daysAgo}일`;
    
    const weeksAgo = Math.floor(daysAgo / 7);
    if (weeksAgo < 4) return `${weeksAgo}주`;
    
    const monthsAgo = Math.floor(daysAgo / 30);
    return `${monthsAgo}개월`;
    
  } catch (error) {
    console.error("Error formatting Korean activity time:", error);
    return "알 수 없음";
  }
}

/**
 * Get time tooltip for better UX (shown on hover)
 */
export function getTimeTooltip(dateString: string | Date): string {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    
    if (isNaN(date.getTime())) {
      return "시간 정보 없음";
    }
    
    return format(date, "yyyy년 MM월 dd일 (E) a h:mm:ss", { locale: ko });
    
  } catch (error) {
    console.error("Error creating time tooltip:", error);
    return "시간 정보 없음";
  }
}