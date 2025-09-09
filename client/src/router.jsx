import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import Profile from './pages/Profile';
import Register from './pages/Register';
import Login from './pages/Login';
import SideBar from './components/SideBar';
import Invites from './pages/Invites';
import FeedbackRooms from './pages/FeedbackRooms';
import Explore from './Explore'

import { createBrowserRouter } from 'react-router-dom';
import path from 'path';



export const router = createBrowserRouter([
    {
        path: '/LandingPage', element: <LandingPage />,
    },
    {
        path: '/Register', element: <Register />,
    },
    {
        path, path: '/Login', element: <Login />,
    },
    { element: <SideBar />, children: [
        {path: '/' , element: <HomePage />},
        {path: '/Profile', element: <Profile />},
        {path: '/Explore', element: <Explore />},
        {path: 'feedbackRooms', element: <FeedbackRooms />},
        {path: '/Invites', element: <Invites />},
    ]},



   
])