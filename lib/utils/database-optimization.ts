// Database query optimization utilities

import { createClient } from "@/lib/supabase/server";

// Query optimization patterns
export const queryOptimizations = {
  // Optimize post queries with proper indexing and selective fields
  optimizedPostQuery: (options: {
    limit?: number;
    offset?: number;
    apartmentId?: string;
    category?: string;
    sortBy?: "latest" | "popular";
  }) => {
    const {
      limit = 20,
      offset = 0,
      apartmentId,
      category,
      sortBy = "latest",
    } = options;

    let query = `
      SELECT
        p.id,
        p.title,
        p.content,
        p.category,
        p.apartment_id,
        p.created_at,
        p.updated_at,
        p.view_count,
        p.like_count,
        p.comment_count,
        u.id as author_id,
        u.name as author_name,
        u.avatar_url as author_avatar,
        a.name as apartment_name,
        a.city as apartment_city
      FROM community_posts p
      LEFT JOIN auth.users u ON p.author_id = u.id
      LEFT JOIN apartments a ON p.apartment_id = a.id
      WHERE p.status = 'published'
    `;

    const params: unknown[] = [];
    let paramIndex = 1;

    if (apartmentId) {
      query += ` AND p.apartment_id = $${paramIndex}`;
      params.push(apartmentId);
      paramIndex++;
    }

    if (category) {
      query += ` AND p.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    // Optimize sorting
    if (sortBy === "popular") {
      query += ` ORDER BY
        (p.like_count * 2 + p.comment_count * 3 + p.view_count * 0.1) DESC,
        p.created_at DESC
      `;
    } else {
      query += ` ORDER BY p.created_at DESC`;
    }

    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    return { query, params };
  },

  // Optimized comment query with threading
  optimizedCommentQuery: (postId: string) => {
    return {
      query: `
        WITH RECURSIVE comment_tree AS (
          -- Base case: top-level comments
          SELECT
            c.id,
            c.content,
            c.created_at,
            c.updated_at,
            c.author_id,
            c.post_id,
            c.parent_id,
            u.name as author_name,
            u.avatar_url as author_avatar,
            0 as depth,
            ARRAY[c.created_at] as sort_path
          FROM community_comments c
          LEFT JOIN auth.users u ON c.author_id = u.id
          WHERE c.post_id = $1 AND c.parent_id IS NULL

          UNION ALL

          -- Recursive case: child comments
          SELECT
            c.id,
            c.content,
            c.created_at,
            c.updated_at,
            c.author_id,
            c.post_id,
            c.parent_id,
            u.name as author_name,
            u.avatar_url as author_avatar,
            ct.depth + 1,
            ct.sort_path || c.created_at
          FROM community_comments c
          LEFT JOIN auth.users u ON c.author_id = u.id
          JOIN comment_tree ct ON c.parent_id = ct.id
          WHERE ct.depth < 5  -- Limit nesting depth
        )
        SELECT * FROM comment_tree
        ORDER BY sort_path
      `,
      params: [postId],
    };
  },

  // Batch operations for better performance
  batchInsertImages: (
    images: Array<{
      post_id: string;
      url: string;
      alt_text?: string;
      order_index: number;
    }>
  ) => {
    const values = images
      .map(
        (img, index) =>
          `($${index * 4 + 1}, $${index * 4 + 2}, $${index * 4 + 3}, $${index * 4 + 4})`
      )
      .join(", ");

    const params = images.flatMap((img) => [
      img.post_id,
      img.url,
      img.alt_text || "",
      img.order_index,
    ]);

    return {
      query: `
        INSERT INTO community_post_images (post_id, url, alt_text, order_index)
        VALUES ${values}
        RETURNING *
      `,
      params,
    };
  },
};

// Connection pooling and query execution optimization
export class DatabaseOptimizer {
  private static instance: DatabaseOptimizer;
  private queryCache = new Map<
    string,
    { result: unknown; timestamp: number }
  >();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  static getInstance(): DatabaseOptimizer {
    if (!DatabaseOptimizer.instance) {
      DatabaseOptimizer.instance = new DatabaseOptimizer();
    }
    return DatabaseOptimizer.instance;
  }

  // Execute query with caching
  async executeWithCache<T>(
    cacheKey: string,
    queryFn: () => Promise<T>,
    ttl = this.CACHE_TTL
  ): Promise<T> {
    const cached = this.queryCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.result as T;
    }

    const result = await queryFn();
    this.queryCache.set(cacheKey, {
      result,
      timestamp: Date.now(),
    });

    return result;
  }

  // Batch multiple queries for better performance
  async executeBatch<T>(queries: Array<() => Promise<T>>): Promise<T[]> {
    return Promise.all(queries.map((query) => query()));
  }

  // Clear cache for specific patterns
  invalidateCache(pattern?: string): void {
    if (!pattern) {
      this.queryCache.clear();
      return;
    }

    for (const key of this.queryCache.keys()) {
      if (key.includes(pattern)) {
        this.queryCache.delete(key);
      }
    }
  }

  // Get cache statistics
  getCacheStats() {
    return {
      size: this.queryCache.size,
      keys: Array.from(this.queryCache.keys()),
    };
  }
}

// Optimized data fetching functions
export const optimizedQueries = {
  // Get posts with optimized query
  async getPosts(options: {
    limit?: number;
    offset?: number;
    apartmentId?: string;
    category?: string;
    sortBy?: "latest" | "popular";
  }) {
    const supabase = await createClient();
    const optimizer = DatabaseOptimizer.getInstance();
    const { query, params } = queryOptimizations.optimizedPostQuery(options);

    const cacheKey = `posts_${JSON.stringify(options)}`;

    return optimizer.executeWithCache(cacheKey, async () => {
      const { data, error } = await supabase.rpc("execute_optimized_query", {
        query_text: query,
        query_params: params,
      });

      if (error) throw error;
      return data;
    });
  },

  // Get post with comments in single query
  async getPostWithComments(postId: string) {
    const supabase = await createClient();
    const optimizer = DatabaseOptimizer.getInstance();

    const cacheKey = `post_with_comments_${postId}`;

    return optimizer.executeWithCache(
      cacheKey,
      async () => {
        // Execute both queries in parallel
        const [postResult, commentsResult] = await Promise.all([
          supabase
            .from("community_posts")
            .select(
              `
            *,
            author:auth.users(id, name, avatar_url),
            apartment:apartments(id, name, city),
            images:community_post_images(*)
          `
            )
            .eq("id", postId)
            .single(),

          supabase.rpc("get_threaded_comments", { post_id: postId }),
        ]);

        if (postResult.error) throw postResult.error;
        if (commentsResult.error) throw commentsResult.error;

        return {
          post: postResult.data,
          comments: commentsResult.data,
        };
      },
      2 * 60 * 1000
    ); // 2 minute cache for post details
  },

  // Batch update post metrics
  async updatePostMetrics(
    updates: Array<{
      postId: string;
      viewCount?: number;
      likeCount?: number;
      commentCount?: number;
    }>
  ) {
    const supabase = await createClient();
    const optimizer = DatabaseOptimizer.getInstance();

    // Invalidate related caches
    updates.forEach((update) => {
      optimizer.invalidateCache(`post_${update.postId}`);
      optimizer.invalidateCache("posts_");
    });

    // Execute batch update - Supabase queries already return promises
    const promises = updates.map((update) =>
      supabase
        .from("community_posts")
        .update({
          ...(update.viewCount !== undefined && {
            view_count: update.viewCount,
          }),
          ...(update.likeCount !== undefined && {
            like_count: update.likeCount,
          }),
          ...(update.commentCount !== undefined && {
            comment_count: update.commentCount,
          }),
          updated_at: new Date().toISOString(),
        })
        .eq("id", update.postId)
    );

    return Promise.all(promises);
  },
};

// Database performance monitoring
export const dbPerformanceMonitor = {
  slowQueryThreshold: 1000, // 1 second
  queryTimes: new Map<string, number[]>(),

  // Track query performance
  trackQuery<T>(queryName: string, queryFn: () => Promise<T>): Promise<T> {
    const startTime = Date.now();

    return queryFn().finally(() => {
      const duration = Date.now() - startTime;

      if (!this.queryTimes.has(queryName)) {
        this.queryTimes.set(queryName, []);
      }

      const times = this.queryTimes.get(queryName)!;
      times.push(duration);

      // Keep only last 100 measurements
      if (times.length > 100) {
        times.shift();
      }

      // Log slow queries
      if (duration > this.slowQueryThreshold) {
        console.warn(`Slow query detected: ${queryName} took ${duration}ms`);
      }
    });
  },

  // Get performance statistics
  getStats() {
    const stats: Record<
      string,
      {
        count: number;
        avgTime: number;
        maxTime: number;
        minTime: number;
      }
    > = {};

    for (const [queryName, times] of this.queryTimes.entries()) {
      if (times.length > 0) {
        stats[queryName] = {
          count: times.length,
          avgTime: times.reduce((a, b) => a + b, 0) / times.length,
          maxTime: Math.max(...times),
          minTime: Math.min(...times),
        };
      }
    }

    return stats;
  },
};
