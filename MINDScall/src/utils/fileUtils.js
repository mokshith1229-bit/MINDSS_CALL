import api from './api';

export const handleFileDownload = async (file) => {
  if (file.storageProvider === 's3' && file.objectKey) {
    try {
      const res = await api.post('/files/download', { objectKey: file.objectKey });
      const { downloadUrl } = res.data.data;
      if (downloadUrl) {
        window.open(downloadUrl, '_blank');
      } else {
        alert('Could not generate download URL');
      }
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download file');
    }
  } else {
    // Fallback to local static URL
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const finalUrl = file.url.startsWith('http') ? file.url : `${baseUrl}${file.url}`;
    window.open(finalUrl, '_blank');
  }
};
