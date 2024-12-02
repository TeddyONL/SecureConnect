// ... (keep existing imports)
import { MarketplacePage } from './pages/MarketplacePage';
import { Navigate } from 'react-router-dom';

function App() {
  // ... (keep existing code)

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