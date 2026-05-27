import router from "./router.js"
import navbar from "./navbar.js"

const { createApp,onMounted } = Vue

// Create Vue App
const app = createApp({
    template: `
        <div class="full-width">
            <navbar></navbar>
            <router-view></router-view>
        </div>
    `
})

app.component('navbar', navbar)
app.use(router)
app.mount("#app")


