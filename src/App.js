import React, { lazy, Suspense, useState } from 'react';
import { createBrowserRouter, Outlet, RouterProvider, ScrollRestoration } from 'react-router-dom';
import { AuthProvider, RequireAuth } from './auth';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import ArticlePage from './components/ArticlePage';
import ListingPage from './components/ListingPage';
import AboutUs from './components/AboutUs';
import Login from './components/Login';
import { Loading, NotFound } from './components/States';
import './App.css';

// Loaded on demand: the charts page pulls in Chart.js, and readers never need the admin code.
const IPBangladesh = lazy(() => import('./components/IPBangladesh'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const Dashboard = lazy(() => import('./components/admin/Dashboard'));
const PostEditor = lazy(() => import('./components/admin/PostEditor'));
const Guide = lazy(() => import('./components/admin/Guide'));

const routes = [
  {
    element: <Shell />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/article/:id', element: <ArticlePage /> },
      { path: '/category/:name', element: <ListingPage mode="category" /> },
      { path: '/search', element: <ListingPage mode="search" /> },
      { path: '/ip-bangladesh', element: <IPBangladesh /> },
      { path: '/about', element: <AboutUs /> },
      { path: '/login', element: <Login /> },
      {
        path: '/admin',
        element: (
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        ),
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'new', element: <PostEditor /> },
          { path: 'edit/:id', element: <PostEditor /> },
          { path: 'guide', element: <Guide /> },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
];

function Shell() {
  return (
    <div className="App">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header />
      <main id="main" className="main-content">
        <Suspense fallback={<Loading />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  );
}

function App() {
  // A data router, so the article editor can warn before leaving with unsaved changes.
  const [router] = useState(() => createBrowserRouter(routes));
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
