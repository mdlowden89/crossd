import Welcome from './pages/Welcome';
import Onboarding from './pages/Onboarding';
import SetupProfile from './pages/SetupProfile';
import MBTIQuiz from './pages/MBTIQuiz';
import FirstMoment from './pages/FirstMoment';
import Explore from './pages/Explore';
import ProfileDetail from './pages/ProfileDetail';
import Moments from './pages/Moments';
import MomentDetail from './pages/MomentDetail';
import Trail from './pages/Trail';
import ChatList from './pages/ChatList';
import Chat from './pages/Chat';
import CrossdPlus from './pages/CrossdPlus';
import Recaps from './pages/Recaps';
import Profile from './pages/Profile';
import Verification from './pages/Verification';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import AdminVerification from './pages/AdminVerification';
import AdminReports from './pages/AdminReports';
import Home from './pages/Home';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Welcome": Welcome,
    "Onboarding": Onboarding,
    "SetupProfile": SetupProfile,
    "MBTIQuiz": MBTIQuiz,
    "FirstMoment": FirstMoment,
    "Explore": Explore,
    "ProfileDetail": ProfileDetail,
    "Moments": Moments,
    "MomentDetail": MomentDetail,
    "Trail": Trail,
    "ChatList": ChatList,
    "Chat": Chat,
    "CrossdPlus": CrossdPlus,
    "Recaps": Recaps,
    "Profile": Profile,
    "Verification": Verification,
    "Settings": Settings,
    "Notifications": Notifications,
    "AdminVerification": AdminVerification,
    "AdminReports": AdminReports,
    "Home": Home,
}

export const pagesConfig = {
    mainPage: "Welcome",
    Pages: PAGES,
    Layout: __Layout,
};