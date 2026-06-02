import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login }            from './pages/Login';
import { Register }         from './pages/Register';
import { Dashboard }        from './pages/Dashboard';
import { ItineraryDetail }  from './pages/ItineraryDetail';
import { SharedItinerary }  from './pages/SharedItinerary';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
          {/* Public */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/share/:token" element={<SharedItinerary />} />

          {/* Protected */}
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/itinerary/:id" element={
            <ProtectedRoute><ItineraryDetail /></ProtectedRoute>
          } />

          {/* Default */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
    </ThemeProvider>
  );
}