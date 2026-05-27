export default{
    setup(){
    const { ref, reactive, onMounted } = Vue
    const state = reactive({ quiz: [], mess: '',review:null ,questions:[]})

    const loaddata=async()=>{
        try{
        const response=await fetch(`/api/showscore`, {
            method:'GET',
            headers:{
                "Content-Type":"application/json",
                'Authentication-Token':localStorage.getItem("auth-token")
            }

        })
        if(!response.ok) throw new Error("Failed to fetch Quiz")
        const data=await response.json()
        state.quiz=data
       }  
        catch(error){
            alert(error.message)
        }
    }
    onMounted(() => {
        loaddata()
    }) 
    const toggleReview = async (index, quizId) => {
        if (state.review === index) {
            state.review = null;
            state.questions = [];
            return;
        }

        try {
            const response = await fetch(`/api/getscore?id=${quizId}`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Authentication-Token": localStorage.getItem("auth-token")
            }
            });
            if (!response.ok) throw new Error("Failed to fetch review");
            const data = await response.json()

            state.questions = data.questions
            state.review = index;

        } catch (err) {
            alert(err.message);
        }
        }


    return { state,toggleReview }
    },
    template: `
       <div class="container my-4">
      <h3 class="text-center mb-4">Attempted Quizzes</h3>

      <div v-if="state.mess" class="alert alert-danger text-center">
        {{ state.mess }}
      </div>

      <div v-if="state.quiz.length === 0" class="text-center text-muted mt-5">
        <p>You haven't attempted any quizzes yet.</p>
      </div>

      <div class="vstack gap-3 col-md-8 mx-auto">
        <div v-for="(quiz, index) in state.quiz" :key="index" class="border rounded p-3 bg-light">
          
          <div class="d-flex flex-wrap justify-content-between align-items-center mb-2">
            <h5 class="mb-0 px-3 py-1 border rounded bg-warning-subtle text-dark fw-semibold">
              {{ quiz.quiz_name }}
            </h5>
            <span class="text-muted small"><strong>Subject:</strong> {{ quiz.subject }}</span>
          </div>

          <div class="d-flex gap-2 align-items-center mb-2">
            <span class="badge bg-secondary">Questions: {{ quiz.totalquestions }}</span>
            <span :class="['badge', quiz.score >= 75 ? 'bg-success' : quiz.score >= 40 ? 'bg-warning text-dark' : 'bg-danger']">Score: {{ Math.round(quiz.score) }}%</span>
          </div>

          <div class="d-flex justify-content-end">
            <button class="btn btn-outline-success btn-sm" @click="toggleReview(index, quiz.quiz_id)">
              {{ state.review === index ? 'Hide Review' : 'Review' }}
            </button>
          </div>

          <!-- Review Section -->
          <div v-if="state.review === index" class="mt-3">
            <div v-for="(q, i) in state.questions" :key="i" 
              :class="['border p-2 rounded mb-2', q.selected_op === q.correct_op ? 'bg-success-subtle' : 'bg-danger-subtle']">
              <p class="mb-1"><strong>Q{{ i + 1 }}:</strong> {{ q.statement }}</p>
              <p class="mb-1" :class="q.selected_op === q.correct_op ? 'text-success' : 'text-danger'">
                Your Answer: {{ q.selected_op ? q['option' + q.selected_op] : 'Not answered' }}
                <span v-if="q.selected_op === q.correct_op"> ✅</span>
                <span v-else> ❌</span>
              </p>
              <p class="mb-0 text-success" v-if="q.selected_op !== q.correct_op">
                Correct Answer: {{ q['option' + q.correct_op] }}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
`
}