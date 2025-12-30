import { useState, useCallback } from 'react';
import api from '../api/api.js';

export const useBenchmarking = () => {
  const [results, setResults] = useState(null);
  const [downloadLink, setDownloadLink] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateBenchmark = useCallback(async ({ apiKey, urls, attributes }) => {
    setLoading(true);
    setError(null);
    setResults(null);
    setDownloadLink(null);

    try {
      if (!urls || urls.length === 0) {
        throw new Error('A lista de URLs não pode estar vazia.');
      }
      if (!apiKey) {
        throw new Error('A chave da API é obrigatória.');
      }

      const response = await api.post('/scrape/', {
        api_key: apiKey,
        urls: urls,
        attributes: attributes,
        provider: "google"
      });

      const data = response.data;

      if (data.status === 'success') {
        setResults(data.data);
        
        if (data.download_link) {
          const baseUrl = api.defaults.baseURL.replace('/api', ''); 
          setDownloadLink(`${baseUrl}${data.download_link}`);
        }
      } else {
        throw new Error(data.message || 'Erro desconhecido ao processar.');
      }

    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || err.message;
      setError(message);
      console.error("Erro no Benchmark:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = () => {
    setResults(null);
    setDownloadLink(null);
    setError(null);
  };

  return {
    generateBenchmark,
    clearResults,
    results,
    downloadLink,
    loading,
    error
  };
};