export interface Log {
  log_id: number;
  log: string;
  rank: number;
  category: string | null;
  checksum: number | null;
}

export interface KeywordCount {
  keyword: string;
  count: number;
  rank: number;
}

export interface Category {
  log_id: number;
  category: string;
  rank: number;
}

export interface WebSocketData {
  content: {
    all_tasks: {
      rank: number;
      tasks: {
        analyzed_logs: Log[];
        categories: Category[];
        keyword_count: KeywordCount[];
        checksums: {
          log_id: number;
          checksum: number;
          rank: number;
        }[];
      };
    }[];
  };
}
