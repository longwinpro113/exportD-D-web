import { useEffect, useState, useCallback } from "react";
import { buildApiUrl } from "../config/api";

const useFetchList = (path, query, config = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAPI = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filteredQuery = Object.fromEntries(
        Object.entries(query).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
      );
      const queryString = new URLSearchParams(filteredQuery).toString();
      const url = queryString ? `${buildApiUrl(path)}?${queryString}` : buildApiUrl(path);
      
      const res = await fetch(url, config);
      if (!res.ok) throw new Error("Fetch failed");
      
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error("useFetchList Error:", err);
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [path, JSON.stringify(query), JSON.stringify(config)]);

  useEffect(() => {
    fetchAPI();
  }, [fetchAPI]);

  return [data, loading, error, fetchAPI];
};

export default useFetchList;
