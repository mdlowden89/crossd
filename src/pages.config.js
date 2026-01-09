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
}

export const pagesConfig = {
    mainPage: "Welcome",
    Pages: PAGES,
    Layout: __Layout,
};