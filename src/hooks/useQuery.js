import { useState, useCallback } from "react";

const useQuery = (initial) => {
  const [query, setQuery] = useState(initial);

  const updateQuery = useCallback((newQuery) => {
    setQuery((prev) => {
      // Dùng strict equality để tránh tạo reference mới nếu query không thay đổi
      let hasChanges = false;
      for (let key in newQuery) {
          if (prev[key] !== newQuery[key]) {
              hasChanges = true; break;
          }
      }
      if (!hasChanges) return prev;
      
      return {
        ...prev,
        ...newQuery,
      };
    });
  }, []);

  const resetQuery = useCallback(() => {
    setQuery(initial);
  }, [initial]);
  
  return [query, updateQuery, resetQuery];
};

export default useQuery;
