import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from './components/public/PublicLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/public/HomePage';
import { EventsCatalog } from './pages/public/EventsCatalog';
import { EventDetailPage } from './pages/public/EventDetailPage';
import { GalleryCatalog } from './pages/public/GalleryCatalog';
import { GalleryAlbumPage } from './pages/public/GalleryAlbumPage';
import { TeamsPage } from './pages/public/TeamsPage';
import { MohylaGamesPage } from './pages/public/MohylaGamesPage';
import { PartnersPage } from './pages/public/PartnersPage';
import { ContactsPage } from './pages/public/ContactsPage';
import { Login } from './pages/admin/Login';
import { VerifyOTP } from './pages/admin/VerifyOTP';
import { AdminLayout } from './pages/AdminLayout';
import { Dashboard } from './pages/admin/Dashboard';
import { AdminEvents } from './pages/admin/AdminEvents';
import { EventForm } from './pages/admin/EventForm';
import { SiteSettingsPage } from './pages/admin/SiteSettingsPage';
import { AdminContacts } from './pages/admin/AdminContacts';
import { AdminPartners } from './pages/admin/AdminPartners';
import { AdminGallery } from './pages/admin/AdminGallery';
import { AlbumForm } from './pages/admin/AlbumForm';
import { MohylaGamesForm } from './pages/admin/MohylaGamesForm';
import { AdminTeams } from './pages/admin/AdminTeams';
import { TeamForm } from './pages/admin/TeamForm';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="events" element={<EventsCatalog />} />
          <Route path="events/:id" element={<EventDetailPage />} />
          <Route path="gallery" element={<GalleryCatalog />} />
          <Route path="gallery/:id" element={<GalleryAlbumPage />} />
          <Route path="teams" element={<TeamsPage />} />
          <Route path="mohyla-games" element={<MohylaGamesPage />} />
          <Route path="partners" element={<PartnersPage />} />
          <Route path="contacts" element={<ContactsPage />} />
        </Route>

        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/verify" element={<VerifyOTP />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="settings" element={<SiteSettingsPage />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="events/new" element={<EventForm />} />
            <Route path="events/:id" element={<EventForm />} />
            <Route path="contacts" element={<AdminContacts />} />
            <Route path="partners" element={<AdminPartners />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="gallery/:id" element={<AlbumForm />} />
            <Route path="mohyla-games" element={<MohylaGamesForm />} />
            <Route path="teams" element={<AdminTeams />} />
            <Route path="teams/new" element={<TeamForm />} />
            <Route path="teams/:id" element={<TeamForm />} />
          </Route>
        </Route>

        <Route path="/login" element={<Navigate to="/admin/login" replace />} />
        <Route path="/verify" element={<Navigate to="/admin/verify" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
