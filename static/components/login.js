import router from "../router.js"
import { setToken } from "./auth.js"

export default {
    setup() {
        const { ref, reactive } = Vue
        const fromdata = reactive({ "email": '', "password": '' })
        const message = ref("")

        const fillAdmin = () => {
            fromdata.email = 'user@admin.com'
            fromdata.password = '333'
        }

        const fillUser = () => {
            fromdata.email = 'taylor@hector.com'
            fromdata.password = '333'
        }

        const login = async () => {

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(fromdata)
                })
                if (!response.ok) {
                    throw new Error("Invalid credentials")
                }

                const data = await response.json()
                

                if ('auth-token' in data) {
                    setToken(data["auth-token"], data["id"])
                    
                    if (data['username']==='Admin'){
                        router.push('/adashboard')
                    }
                    else{
                        router.push('/udashboard')
                    }

                } else {
                    message.value = data.message || "login failed"
                }
            } catch (error) {
                message.value = "Invalid Credentials."
            }
        }

        return { fromdata, login, message, fillAdmin, fillUser }
    },

    template: `
     <div class="d-flex justify-content-center  align-items-center mt-5">
    <div class="bg-light p-4 rounded shadow-sm" style="width: 400px;">
      <p class="text-center mb-3">{{ message }}</p>

      <div class="mb-3">
        <label for="email" class="form-label small">Email:</label>
        <input type="email" id="email" class="form-control form-control-sm" v-model="fromdata.email">
      </div>

      <div class="mb-4">
        <label for="password" class="form-label small">Password:</label>
        <input type="password" id="password" class="form-control form-control-sm" v-model="fromdata.password">
      </div>

      <button class="btn btn-primary btn-sm w-100 mb-2" @click="login">Login</button>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-secondary btn-sm w-50" @click="fillAdmin">Fill Admin</button>
        <button class="btn btn-outline-secondary btn-sm w-50" @click="fillUser">Fill User</button>
      </div>
    </div>
  </div>`
}
