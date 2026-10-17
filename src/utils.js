import { useEffect, useState } from 'react';
import { api } from './api';

export function formatDate(iso, options = { day: 'numeric', month: 'long', year: 'numeric' }) {
  if (!iso) return '';
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-GB', options);
}

export function timeAgo(iso) {
  const seconds = (Date.now() - new Date(iso).getTime()) / 1000;
  if (!Number.isFinite(seconds)) return '';
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  if (seconds < 7 * 86400) return `${Math.floor(seconds / 86400)} days ago`;
  return formatDate(iso);
}

export const categoryPath = (name) => `/category/${encodeURIComponent(name)}`;

// Categories are shown in the header, footer and sidebar; fetch them once per page load,
// and again when the admin publishes, unpublishes or deletes an article.
let categoriesPromise = null;
const categoryListeners = new Set();

function loadCategories() {
  categoriesPromise = api.categories().then(
    (data) => data.categories,
    () => {
      categoriesPromise = null;
      return [];
    }
  );
  return categoriesPromise;
}

export function refreshCategories() {
  loadCategories().then((list) => categoryListeners.forEach((listener) => listener(list)));
}

export function useCategories() {
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    let active = true;
    const listener = (list) => active && setCategories(list);
    categoryListeners.add(listener);
    (categoriesPromise || loadCategories()).then(listener);
    return () => {
      active = false;
      categoryListeners.delete(listener);
    };
  }, []);
  return categories;
}

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | IPPS` : 'IPPS - Empowering Bangladesh Through Awareness';
  }, [title]);
}
