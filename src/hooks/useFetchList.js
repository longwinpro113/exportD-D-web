import { useEffect, useState, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
      const url = queryString ? `${API_URL}${path}?${queryString}` : `${API_URL}${path}`;
      
      const res = await fetch(url, config);
      if (!res.ok) throw new Error("Fetch failed");
      
      const result = await res.json();
      console.log(`Fetch List Result (${path}):`, result);
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
