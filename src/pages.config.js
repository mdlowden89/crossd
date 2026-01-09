import Welcome from './pages/Welcome';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Welcome": Welcome,
}

export const pagesConfig = {
    mainPage: "Welcome",
    Pages: PAGES,
    Layout: __Layout,
};