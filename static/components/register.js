export default {
    setup(){ 
        const {ref,reactive}= Vue
        const regdata= reactive({'email':'','username':'','password':''})
        const message=ref('')

        const reg= async() =>{
            try{
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(regdata)
            })
            const data= await response.json()
            message.value=data.message || "registration failed"
            regdata.email = ''
            regdata.username = ''
            regdata.password = ''
            }catch(error){
                message.value ="Error occured during Registration"
            }
           // Reset form data
        }
        return{regdata,message,reg}

      },
      template: `
        <div class="d-flex justify-content-center align-items-center mt-5">
        <div class="bg-light p-4 rounded shadow-sm" style="width: 400px;">
      <p class="text-center mb-3">{{ message }}</p>

      <div class="mb-3">
        <label class="form-label small" for="email">Email:</label>
        <input type="email" id="email" class="form-control form-control-sm" v-model="regdata.email">
      </div>

      <div class="mb-3">
        <label class="form-label small" for="username">Username:</label>
        <input type="text" id="username" class="form-control form-control-sm" v-model="regdata.username">
      </div>

      <div class="mb-4">
        <label class="form-label small" for="password">Password:</label>
        <input type="password" id="password" class="form-control form-control-sm" v-model="regdata.password">
      </div>

      <button class="btn btn-primary btn-sm w-100" @click="reg">Register</button>
      <p class="text-center mt-3 small">Already have an account? <router-link to="/login">Login</router-link></p>
    </div>
  </div>`

}