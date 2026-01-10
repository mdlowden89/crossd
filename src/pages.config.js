import AdminReports from './pages/AdminReports';
import AdminVerification from './pages/AdminVerification';
import Chat from './pages/Chat';
import ChatList from './pages/ChatList';
import CrossdPlus from './pages/CrossdPlus';
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
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminReports": AdminReports,
    "AdminVerification": AdminVerification,
    "Chat": Chat,
    "ChatList": ChatList,
    "CrossdPlus": CrossdPlus,
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
}

export const pagesConfig = {
    mainPage: "Welcome",
    Pages: PAGES,
    Layout: __Layout,
};