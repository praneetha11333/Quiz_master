import router from '../../router.js'

export default {
    setup(){
        const{ref,reactive,onMounted,computed} = Vue
        const state=reactive({quiz:[],mess:'',computed_qiuz:[]})
        const  quiz= async()=>{
          try{
            console.log(localStorage.getItem("auth-token"))
            const response=await fetch(`/api/quiz`, {
                method: 'GET',
                headers: { "Content-Type": "application/json",
                           'Authentication-Token' : localStorage.getItem("auth-token")
                 }
              })
              if (!response.ok) {
                  throw new Error("Failes to fetch Quiz")
              }
              const data = await response.json()
              state.quiz=data

          }catch (error) {
              state.mess= error.message
          }

        }
      const scheduling=computed(()=>{
        const now= new Date()
        const hrs=3*60*60*1000
        return  state.quiz.filter(q =>{
         const quizDate=new Date(q.date)
         const diff=now-quizDate
          return diff>=0 && diff<=hrs})
      })
      
      
        
    onMounted(quiz)
    const loadQuestion=async(qid)=>{
        router.push({ path: '/uquiz', query: { quizid:qid } })
    }

    return{state, quiz, loadQuestion,scheduling}
    },
    template: `
   <div class="container my-4">
  <h3 class="text-center mb-4">Available Quizzes</h3>

  <div v-if="state.mess" class="alert alert-danger text-center">
    {{ state.mess }}
  </div>
  <div class="vstack gap-3 col-md-8 mx-auto">
    <div v-if="scheduling.length > 0">
      <div
        v-for="(quiz, index) in scheduling"
        :key="index"
        class="card shadow-sm p-3 mb-3 bg-body rounded"
      >
        <div class="d-flex flex-wrap gap-4 align-items-center mb-3">
          <h5 class="mb-0 px-3 py-1 border rounded bg-warning-subtle text-dark fw-semibold">
            {{ quiz.quiz_name }}
          </h5>
          <span class="text-muted">
            <strong>Subject:</strong> {{ quiz.subject }}
          </span>
          <span class="text-muted">
            <strong>Chapter:</strong> {{  quiz.chapters.map(chap => chap.name).join(', ')  }}
          </span>
        </div>

        <div class="text-end d-flex gap-2 align-items-end flex-wrap mb-3">
          <span class="badge bg-warning">{{ quiz.time_duration }} Min</span>
          <span class="badge bg-success">{{ quiz.date }}</span>
          <span class="badge bg-primary">
            Total no Questions : {{ quiz.total_questions }}
          </span>
        </div>

        <div class="d-flex justify-content-end">
          <button
            class="btn btn-outline-success btn-sm"
            @click="loadQuestion(quiz.id)"
          >
            Start Quiz
          </button>
        </div>
      </div>
    </div>
  </div>
</div>


    `
}
