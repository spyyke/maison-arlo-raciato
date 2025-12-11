import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
// Lazy load pages for code splitting
const Home = React.lazy(() => import('./pages/Home'));
const ProductDetails = React.lazy(() => import('./pages/ProductDetails'));
const CollectionDetails = React.lazy(() => import('./pages/CollectionDetails'));
import './App.css';

function App() {
  return (
    <Layout>
      <Suspense fallback={
        <div className="loading-state" style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div className="spinner" style={{
            width: '40px',
            height: '40px',
            border: '2px solid var(--color-charcoal-muted)',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <span style={{
            fontFamily: 'var(--font-heading)',
            color: 'var(--color-charcoal)',
            letterSpacing: '0.1em'
          }}>MAISON ARLO RACIÀTO</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products/:handle" element={<ProductDetails />} />
          <Route path="/collections/:handle" element={<CollectionDetails />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

export default App;
