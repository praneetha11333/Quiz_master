
import Login from "./components/login.js"
import logout from "./components/logout.js"
import Register from "./components/register.js"
import Adashboard from "./components/admin/dashboard.js"
import udashboard from "./components/user/udashboard.js"
import Aquiz from "./components/admin/quiz.js"
import Asum from  "./components/admin/summary.js"
import uquiz from "./components/user/userquiz.js"
import uscore from "./components/user/userscore.js"
import usum from "./components/user/summaryuser.js"
import home from "./home.js"

const { createRouter, createWebHashHistory  } = VueRouter;


const routes = [
    {path: "/adashboard", component :Adashboard}, 
    {path: "/login", component: Login},
    {path:'/register',component:Register},
    {path:'/udashboard',component:udashboard},
    {path : "/logout",component: logout},
    {path:'/AQuiz',component:Aquiz},
    {path : "/ASummary",component: Asum},
    {path:'/uquiz',component:uquiz},
    {path:'/uscore',component: uscore},
    {path:'/usummary',component: usum},
    {path:'/',component: home},
   
]


export default createRouter({
    history: createWebHashHistory(),
    routes
})
