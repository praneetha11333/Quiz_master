import { removeToken } from "./auth.js"
import router from "../router.js"
export default{
    setup(){
        removeToken()
        router.push('/login')
    }
   
}