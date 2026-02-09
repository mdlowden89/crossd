/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AdminReports from './pages/AdminReports';
import AdminVerification from './pages/AdminVerification';
import Chat from './pages/Chat';
import ChatList from './pages/ChatList';
import CrossdPlus from './pages/CrossdPlus';
import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import FirstMoment from './pages/FirstMoment';
import Home from './pages/Home';
import MBTIQuiz from './pages/MBTIQuiz';
import MomentDetail from './pages/MomentDetail';
import Moments from './pages/Moments';
import Notifications from './pages/Notifications';
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';
import ProfileDetail from './pages/ProfileDetail';
import Recaps from './pages/Recaps';
import Settings from './pages/Settings';
import SetupProfile from './pages/SetupProfile';
import Trail from './pages/Trail';
import Verification from './pages/Verification';
import Welcome from './pages/Welcome';
import LogMoment from './pages/LogMoment';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminReports": AdminReports,
    "AdminVerification": AdminVerification,
    "Chat": Chat,
    "ChatList": ChatList,
    "CrossdPlus": CrossdPlus,
    "Dashboard": Dashboard,
    "Explore": Explore,
    "FirstMoment": FirstMoment,
    "Home": Home,
    "MBTIQuiz": MBTIQuiz,
    "MomentDetail": MomentDetail,
    "Moments": Moments,
    "Notifications": Notifications,
    "Onboarding": Onboarding,
    "Profile": Profile,
    "ProfileDetail": ProfileDetail,
    "Recaps": Recaps,
    "Settings": Settings,
    "SetupProfile": SetupProfile,
    "Trail": Trail,
    "Verification": Verification,
    "Welcome": Welcome,
    "LogMoment": LogMoment,
}

export const pagesConfig = {
    mainPage: "Welcome",
    Pages: PAGES,
    Layout: __Layout,
};