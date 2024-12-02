import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MarketplacePage } from './pages/MarketplacePage';
import { Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ListingsPage } from './pages/ListingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { NewBusinessPage } from './pages/NewBusinessPage';
import { AdminPage } from './pages/AdminPage';
import { ChatPage } from './pages/ChatPage';
import { useAuthStore } from './stores/authStore';
import { useEffect } from 'react';

function App() {
  const { isInitialized, user, refreshToken } = useAuthStore();

  useEffect(() => {
    if (user && !isInitialized) {
      refreshToken();
    }
  }, [user, isInitialized, refreshToken]);

  return (
    <BrowserRouter>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          success: {
            duration: 3000,
          },
          error: {
            duration: 5000,
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="listings" element={<ListingsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="new" element={<NewBusinessPage />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="marketplace" element={<MarketplacePage />} />
          <Route path="user/:id" element={<Navigate to="/profile" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
