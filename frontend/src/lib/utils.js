import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function getComplianceColor(status) {
  switch (status?.toUpperCase()) {
    case 'COMPLIANT':
      return 'text-green-500';
    case 'NON_COMPLIANT':
    case 'NON-COMPLIANT':
      return 'text-red-500';
    case 'PARTIAL':
      return 'text-yellow-500';
    default:
      return 'text-gray-500';
  }
}

export function getComplianceBgColor(status) {
  switch (status?.toUpperCase()) {
    case 'COMPLIANT':
      return 'bg-green-500/20';
    case 'NON_COMPLIANT':
    case 'NON-COMPLIANT':
      return 'bg-red-500/20';
    case 'PARTIAL':
      return 'bg-yellow-500/20';
    default:
      return 'bg-gray-500/20';
  }
}

export function truncateText(text, maxLength = 50) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function downloadFile(data, filename) {
  const blob = new Blob([data], { type: 'application/octet-stream' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
