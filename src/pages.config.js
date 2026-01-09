import Welcome from './pages/Welcome';
import Onboarding from './pages/Onboarding';
import SetupProfile from './pages/SetupProfile';
import MBTIQuiz from './pages/MBTIQuiz';
import FirstMoment from './pages/FirstMoment';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Welcome": Welcome,
    "Onboarding": Onboarding,
    "SetupProfile": SetupProfile,
    "MBTIQuiz": MBTIQuiz,
    "FirstMoment": FirstMoment,
}

export const pagesConfig = {
    mainPage: "Welcome",
    Pages: PAGES,
    Layout: __Layout,
};