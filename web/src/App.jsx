import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
// Lazy load pages for code splitting
const Home = React.lazy(() => import('./pages/Home'));
const ProductDetails = React.lazy(() => import('./pages/ProductDetails'));
const CollectionDetails = React.lazy(() => import('./pages/CollectionDetails'));
import SmoothScroll from './components/Motion/SmoothScroll';
import PageTransition from './components/Motion/PageTransition';
import './App.css';

function App() {

  return (
    <SmoothScroll>
      <div className="noise-overlay"></div>
      <Layout>
        <PageTransition>
          <Suspense fallback={<div className="loading-state"></div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products/:handle" element={<ProductDetails />} />
              <Route path="/collections/:handle" element={<CollectionDetails />} />
            </Routes>
          </Suspense>
        </PageTransition>
      </Layout>
    </SmoothScroll>
  );
}

export default App;
