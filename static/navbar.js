import {token,id } from './components/auth.js'
import { globalStore } from './components/store.js';

export default {
    setup() {
        
        const { computed} =Vue
        const isAuthenticated = computed(() => {
          return token.value !== null
        })
        const isAdmin =computed(()=>{
          return id.value===1
        })
        return { isAuthenticated , globalStore,isAdmin};
    },

    template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div class="container-fluid">
        
        <a class="navbar-brand fw-bold" href="#">📚 Welcome</a>

        <div class="collapse navbar-collapse justify-content-between" id="navbarContent">
          
          
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item" v-if="isAuthenticated && !isAdmin">
              <router-link class="nav-link"  to="/udashboard">Dashboard</router-link>  
            </li>
             <li class="nav-item" v-if="isAuthenticated && isAdmin">
              <router-link class="nav-link"  to="/adashboard">Home</router-link>  
            </li>

            <li class="nav-item" v-if="isAuthenticated && !isAdmin">
              <router-link class="nav-link" to="/uscore">Scores</router-link>
            </li>
            <li class="nav-item" v-if="isAuthenticated && isAdmin">
              <router-link class="nav-link" to="/AQuiz">Quiz</router-link>
            </li>
            <li class="nav-item"v-if="isAuthenticated && isAdmin">
              <router-link class="nav-link" to="/ASummary">Summary</router-link>
            </li>
             <li class="nav-item" v-if="isAuthenticated && !isAdmin">
              <router-link class="nav-link" to="/usummary">Summary</router-link>
            </li>

          </ul>
  
          
          <div v-if="isAuthenticated && isAdmin" class="d-flex me-3" role="search" @submit.prevent>
            <input 
              class="form-control me-2" 
              type="search" 
              placeholder="Search subjects..." 
              aria-label="Search"
              v-model="globalStore"
            >
          </div>
  
          
          <div class="d-flex align-items-center">
            <router-link v-if="!isAuthenticated" class="btn btn-outline-primary me-2" to="/login">Login</router-link>
            <router-link v-if="!isAuthenticated" class="btn btn-outline-secondary me-3" to="/register">Register</router-link>
            <router-link v-if="isAuthenticated" class="btn btn-outline-danger" to="/logout">Logout</router-link>
          </div>
        </div>
      </div>
    </nav>
  `
  
};
