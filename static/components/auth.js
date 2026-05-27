const{ref}=Vue


const token = ref(localStorage.getItem("auth-token")|| null)
const id = ref(parseInt(localStorage.getItem("id")|| null))


const setToken = (newToken,ids) => {
    localStorage.setItem("auth-token", newToken)
    localStorage.setItem("id", ids)
  
    token.value = newToken
    id.value=parseInt(ids)
    
}


const removeToken = () => {
    localStorage.removeItem("auth-token")
    localStorage.removeItem("id")
    token.value = null
    id.value=null

   
}
export { token, setToken, removeToken ,id}
