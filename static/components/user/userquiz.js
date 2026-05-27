import router from '../../router.js'
export default {
  setup() {
    
    const route = VueRouter.useRoute()
    const qid = route.query.quizid
    const { ref, reactive, onMounted, onBeforeUnmount ,computed} = Vue
    const state = reactive({ question: [], mess: '' })
    const qiz_dur = ref(0)
    const displaytime = ref("00:00")
    const timerId = ref(null)
    const answers = reactive({})

   const load=async()=>{
          try{
            const response=await fetch(`/api/quizquestion/${qid}`, {
                method: 'GET',
                headers: { "Content-Type": "application/json",
                           'Authentication-Token' : localStorage.getItem("auth-token")
                 }
              })
              if (!response.ok) {
                  throw new Error("Failes to fetch Quiz")
              }
              const data = await response.json()
              state.question=data

          }catch (error) {
              state.mess= error.message
          }
        }

    const time = async () => {
      try {
        const response = await fetch(`/api/quiz/${qid}`, {
          method: 'GET',
          headers: {
            "Content-Type": "application/json",
            'Authentication-Token': localStorage.getItem("auth-token")
          }
        })
        if (!response.ok) throw new Error("Failed to fetch Quiz")
        const data = await response.json()
        qiz_dur.value = data.time_duration * 60

        startTimer() 
      } catch (error) {
        state.mess = error.message
      }
    }

    const startTimer = () => {
      if (!localStorage.getItem('quiz-endTime')) {
        const endTime = Date.now() + qiz_dur.value * 1000
        localStorage.setItem('quiz-endTime', endTime)
      }

      updateRemainingTime()

      timerId.value = setInterval(() => {
        updateRemainingTime()
      }, 1000)
    }

    const updateRemainingTime = () => {
      const endTime = parseInt(localStorage.getItem('quiz-endTime'))
      const now = Date.now()
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000))
      qiz_dur.value = remaining
      displaytime.value = formatTime(remaining)

      if (remaining <= 0) {
        clearInterval(timerId.value)
        localStorage.removeItem('quiz-endTime')
        submitAnswers()
        submitscores()
      }
    }

    const formatTime = (seconds) => {
      const min = Math.floor(seconds / 60)
      const sec = seconds % 60
      return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
    }

    onMounted(async () => {
      await load()
      await time()
    })

    onBeforeUnmount(() => {
      clearInterval(timerId.value)
   
    })
  const submitAnswers = async () => {
      const formattedAnswers = Object.entries(answers).map(([question_id, answer]) => ({
        question_id: Number(question_id),
        answer: Number(answer)
      }))

      const payload = {
        quiz_id: Number(qid),
        answers: formattedAnswers,
      }

      try {
        const res = await fetch(`/api/submitanswer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('auth-token')
          },
          body: JSON.stringify(payload)
        })
        if (!res.ok) throw new Error('Failed to submit answers')
        alert('Answers submitted successfully!')
        clearInterval(timerId.value)
        localStorage.removeItem('quiz-endTime')
        router.push({ path: '/udashboard' })
      } catch (err) {
        alert(err.message)

      }

    }
   const scores = computed(() => {
      let count = 0
      for (const q of state.question) {
        if (parseInt(answers[q.question_id]) === parseInt(q.correct_op)) {
          count++
        }
      }
      return state.question.length > 0 ? Math.round((count / state.question.length) * 100) : 0
    })

    const submitscores=async()=>{
      try{
        const res = await fetch(`/api/savescores`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('auth-token')
          },
          body: JSON.stringify({ quiz_id: Number(qid), score: scores.value })
        })
        if (!res.ok) throw new Error('Failed to submit score')
        
       
    } catch (err) {
        alert(err.message)
      }
    }

    

    return { state, displaytime, qiz_dur, answers, load, time, formatTime,submitAnswers, scores, submitscores }
  },

  template: `
    <div class="container-fluid py-4" style="min-height: 90vh;">
    
     
      
      <!-- Carousel -->
      <div id="sampleCarousel" class="carousel slide px-4">
        <div class="carousel-inner" style="height: 500px;">
          <div v-for="(question, index) in state.question" 
               :key="index" 
               class="carousel-item" 
               :class="{ active: index === 0 }">
            <div class="d-flex justify-content-between align-items-center mb-5 px-4">
              <div><strong>Q No: {{index + 1}} / {{state.question.length}}</strong></div>
              <div><strong>Timer:</strong> {{ displaytime }}</div>
            </div>

            <div class="bg-light p-4 rounded shadow" style="max-width: 800px; margin: auto;">
              <h5 class="mb-4">{{ question.ques_statement }}</h5>

              <div class="d-flex flex-column gap-3">
                <div v-for="(option, i) in question.options" :key="i" class="form-check">
                  <input 
                    class="form-check-input" 
                    type="radio" 
                    :name="'option' + question.question_id" 
                    :id="'option' + question.question_id + i"
                    :value="i+1"
                    v-model="answers[question.question_id]">
                  <label 
                    class="form-check-label" 
                    :for="'option' + question.id + i">
                    {{ option }}
                  </label>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Carousel Controls -->
        <button class="carousel-control-prev" type="button" data-bs-target="#sampleCarousel" data-bs-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true" style="background-color: black;"></span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#sampleCarousel" data-bs-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true" style="background-color: black;"></span>
        </button>
      </div>
    </div>
    <div class="text-center my-4">
      <button class="btn btn-primary" @click="submitAnswers();submitscores()">Submit Answers</button>
    </div>
  `

}
