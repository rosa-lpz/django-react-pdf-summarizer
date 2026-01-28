import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/core';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadPDF = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/upload/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const summarizeDocument = async (docId) => {
  const response = await api.post('/summarize/', {
    doc_id: docId,
  });
  return response.data;
};

export const queryDocument = async (docId, query) => {
  const response = await api.post('/query/', {
    doc_id: docId,
    query: query,
  });
  return response.data;
};

export default api;
