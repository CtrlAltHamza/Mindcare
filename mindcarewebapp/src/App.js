import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import AssessmentPage from './pages/AssessmentPage';
import RedditScraperPage from './pages/RedditScraperPage';
import TwitterScraperPage from './pages/TwitterScraperPage';
import './App.css';

export default function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/assessment" element={<AssessmentPage />} />
          <Route path="/reddit" element={<RedditScraperPage />} />
          <Route path="/twitter" element={<TwitterScraperPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
