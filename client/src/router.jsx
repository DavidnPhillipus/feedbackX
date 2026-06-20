import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import Profile from './pages/Profile';
import Register from './pages/Register';
import Login from './pages/Login';
import SideBar from './components/SideBar';
import SearchBox from './components/SearchBox';
import Invites from './pages/Invites';
import FeedbackRooms from './pages/FeedbackRooms';
import Explore from './pages/Explore';
import PostPage from './pages/Post';
import MyProjects from './pages/MyProjects';
import AdminUsers from './pages/AdminUsers';
import ProtectedRoute, { PublicOnlyRoute } from './components/ProtectedRoute';

import { createBrowserRouter, Navigate } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/LandingPage',
    element: <Navigate to="/" replace />,
  },
  {
    path: '/Register',
    element: (
      <PublicOnlyRoute>
        <Register />
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/Login',
    element: (
      <PublicOnlyRoute>
        <Login />
      </PublicOnlyRoute>
    ),
  },
  {
    element: (
      <ProtectedRoute>
        <SideBar />
      </ProtectedRoute>
    ),
    children: [
      { path: '/home', element: <HomePage /> },
      { path: '/post', element: <PostPage /> },
      { path: '/projects', element: <MyProjects /> },
      { path: '/Search', element: <SearchBox /> },
      { path: '/Profile', element: <Profile /> },
      { path: '/Explore', element: <Explore /> },
      { path: '/feedbackRooms', element: <FeedbackRooms /> },
      { path: '/Invites', element: <Invites /> },
      { path: '/admin/users', element: <AdminUsers /> },
    ],
  },
]);
