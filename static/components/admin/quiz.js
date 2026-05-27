import { globalStore } from "../store.js"
export default{
    setup(){
        const{ref,reactive,onMounted,computed} = Vue
        const key=ref('')
        const option=ref('ref')
        const state=reactive({quiz:[],question:[],mess:'',subjects:[],chapters:[]})
        const newques = reactive({subject_id: '',chap_id: '',ques_statement: '',options: ['', '', '', ''],correct_op: null,quiz_id: null})
        const newQuiz = reactive({ subject_id: '', selectedChapters: [], quiz_name: '', time_duration: '' })
        const quizname=reactive({name:'',time_duration:'',chap_id:''})
        const invisible=ref(false)

        const  quiz= async()=>{
          try{
            console.log(localStorage.getItem("auth-token"))
            const response=await fetch('/api/quiz', {
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
        const question=async(id)=>{
          try{
            const response=await fetch(`/api/quizquestion/${id}`, {
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
      onMounted(quiz)
      const loadQuestion=async(id)=>{
           await question(id)
      }

      const deleteQuestion=async(id)=>{
        try{
          const response=await fetch(`/api/question/id/${id}`, {
              method: 'DELETE',
              headers: { "Content-Type": "application/json",
                        'Authentication-Token' : localStorage.getItem("auth-token")
              }
          })
          if (!response.ok) {
              throw new Error("Failes to delete question")
          }
           const updated = state.question.filter(q => q.question_id !== id)
            state.question = []
            setTimeout(() => {
              state.question = updated
            })
        }
        catch (error) {
          state.mess=error.message
        }
      }
      const changekey=async(id,quiz_id)=>{
        try{
          const response=await fetch(`/api/question/id/${id}`, {
              method: 'PATCH',
              headers: { "Content-Type": "application/json",
                        'Authentication-Token' : localStorage.getItem("auth-token")
              },
              body: JSON.stringify({correct_op: key.value})
          })
          if (!response.ok) {
              throw new Error("Failes to update question")
          }
          await question(quiz_id) 
          key.value=''
        }
        catch (error) {
          state.mess=error.message
        }
      }
      const editoption=async(id,index,option)=>{
        try{
          const response=await fetch(`/api/question/id/${id}`, {
              method: 'PATCH',
              headers: { "Content-Type": "application/json",
                        'Authentication-Token' : localStorage.getItem("auth-token")
              },
              body: JSON.stringify({["option"+(index + 1)]:option})
      })
      if (!response.ok) {
          throw new Error("Failes to update option")
      }

    }catch (error) {
        state.mess=error.message
    }
    }
     const  fetchsubjects= async()=>{
          try{
            console.log(localStorage.getItem("auth-token"))
            const response=await fetch('/api/subject', {
                method: 'GET',
                headers: { "Content-Type": "application/json",
                           'Authentication-Token' : localStorage.getItem("auth-token")
                 }
              })
              if (!response.ok) {
                  throw new Error("Failes to fetch subjects")
              }
              const data = await response.json()
              state.subjects=data

          }catch (error) {
              state.mess= error.message
          }

        }
      onMounted(fetchsubjects)
      const getChaptersForSubject = (subject_id) => {
          const subj = state.subjects.find(s => s.id === subject_id)
          return subj ? subj.chapters : []
        }

    const addQuestion = async () => {
              if (!newques.chap_id) { state.mess = 'Please select a chapter'; return }
              if (!newques.ques_statement.trim()) { state.mess = 'Question cannot be empty'; return }
              if (!newques.options[0].trim() || !newques.options[1].trim()) { state.mess = 'Option 1 and 2 are required'; return }
              if (!newques.correct_op || newques.correct_op < 1 || newques.correct_op > 4) { state.mess = 'Correct option must be 1-4'; return }
              try {
                const response = await fetch('/api/question', {
                  method: 'POST',
                  headers: {
                    "Content-Type": "application/json",
                    'Authentication-Token': localStorage.getItem("auth-token"),
                  },
                  body: JSON.stringify({
                    ques_statement: newques.ques_statement,
                    option1: newques.options[0],
                    option2: newques.options[1],
                    option3: newques.options[2],
                    option4: newques.options[3],
                    correct_op: newques.correct_op,
                    chap_id: newques.chap_id,
                  }),
                });

                if (!response.ok) throw new Error("Failed to add question");
                state.mess = 'Question added successfully!';
                newques.ques_statement = '';
                newques.options = ['', '', '', ''];
                newques.correct_op = null;
                newques.chap_id = null;
                newques.subject_id = '';
              } catch (err) {
                state.mess = err.message;
              }
            };

    const addQuiz=async()=>{
      if (!newQuiz.quiz_name.trim()) { state.mess = 'Quiz name is required'; return }
      if (!newQuiz.time_duration || newQuiz.time_duration < 1) { state.mess = 'Time duration must be at least 1 minute'; return }
      if (!newQuiz.selectedChapters.length) { state.mess = 'Please select at least one chapter'; return }
      try {
        const response = await fetch(`/api/quiz`, {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            'Authentication-Token': localStorage.getItem("auth-token")
          },
          body: JSON.stringify({
            quiz_name: newQuiz.quiz_name,
            time_duration: newQuiz.time_duration,
            chapter_ids: newQuiz.selectedChapters
          })
        });
        if (!response.ok) throw new Error("Failed to add Quiz")
        await quiz()
        newQuiz.quiz_name = ''
        newQuiz.time_duration = ''
        newQuiz.selectedChapters = []
        newQuiz.subject_id = ''
      } catch (err) {
        state.mess = err.message;
      }
    }
    const deleteQuiz=async(id)=>{
      try{
        const response=await fetch(`/api/quiz/${id}`, {
            method: 'DELETE',
            headers: { "Content-Type": "application/json",
                      'Authentication-Token' : localStorage.getItem("auth-token")
            }
        })
        if (!response.ok) {
            throw new Error("Failes to delete Quiz")
        }
        const updated=state.quiz.filter(q => q.id !== id)
        state.quiz=[]
        setTimeout(()=>{
          state.quiz=updated
        })
      }
      catch (error) {
        state.mess=error.message
      }
    }
    const Search = computed(() => {
      const key = globalStore.value.trim().toLowerCase();

      if (key.length === 0) {
        return state.quiz;
      } else {
        return state.quiz.filter(q => {
          const name = q.quiz_name?.toLowerCase() || '';
          const subject = q.subject?.toLowerCase() || '';
          return name.includes(key) || subject.includes(key);
        });
      }
    })
    return{state, key, option, newques, newQuiz, quizname,  invisible, quiz, question, loadQuestion, deleteQuestion, changekey, editoption, fetchsubjects, getChaptersForSubject,addQuestion, addQuiz, deleteQuiz, Search}
    },
    template: `
   <div class="container my-4">
  <h3 class="text-center mb-4">Available Quizzes</h3>

  <div v-if="state.mess" class="alert alert-danger text-center">
    {{ state.mess }}
  </div>

  <div class="vstack gap-3 col-md-8 mx-auto">
    <div
      v-for="(quiz, index) in (invisible ? state.quiz : Search)"
      :key="index"
      class="border rounded p-3 bg-light d-flex justify-content-between align-items-center"
    >
      <div class="d-flex flex-wrap gap-4 align-items-center">
        <h5 class="mb-0 px-3 py-1 border rounded bg-warning-subtle text-dark fw-semibold">
          {{ quiz.quiz_name }}
        </h5>
        <span class="text-muted"><strong>Subject:</strong> {{ quiz.subject }}</span>
        <span class="text-muted"><strong>Chapters:</strong> {{ quiz.chapters.map(chap => chap.name).join(', ') }}</span>
      </div>

      <div class="text-end d-flex flex-column align-items-end">
        <span class="badge bg-warning mb-2">{{ quiz.time_duration }} Min</span>
        <div class="d-flex gap-2">
          <button
            class="btn btn-outline-success btn-sm"
            data-bs-toggle="modal"
            data-bs-target="#editQuestionsModal"
            @click="loadQuestion(quiz.id)"
          >
            View/Edit Questions
          </button>
          <button class="btn btn-outline-danger btn-sm" @click="deleteQuiz(quiz.id)">Delete Quiz</button>
        </div>
      </div>
    </div>

    <div class="text-center mt-3">
      <button
        class="btn btn-outline-secondary btn-sm me-2"
        data-bs-toggle="modal"
        data-bs-target="#addQuizModal"
      >
        Add Quiz
      </button>
      <button
        class="btn btn-outline-primary btn-sm"
        data-bs-toggle="modal"
        data-bs-target="#addQuestionModal"
      >
        Add Question
      </button>
    </div>
  </div>
</div>

<!-- Add Question Modal -->
<div class="modal fade" id="addQuestionModal" tabindex="-1" aria-labelledby="addQuestionModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="addQuestionModalLabel">Add New Question</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>

      <div class="modal-body">
        <div class="mb-3">
          <label class="form-label">Subject</label>
          <select v-model="newques.subject_id" class="form-select" @change="newques.chap_id = null">
            <option value="" disabled>Select Subject</option>
            <option v-for="sub in state.subjects" :key="sub.id" :value="sub.id">{{ sub.name }}</option>
          </select>
        </div>

        <div class="mb-3">
          <label class="form-label">Chapter</label>
          <select v-model="newques.chap_id" class="form-select" :disabled="!newques.subject_id">
            <option value="" disabled>Select Chapter</option>
            <option v-for="chap in getChaptersForSubject(newques.subject_id)" :key="chap.id" :value="chap.id">{{ chap.name }}</option>
          </select>
        </div>

        <div class="mb-3">
          <label class="form-label">Question</label>
          <input type="text" class="form-control" v-model="newques.ques_statement" placeholder="Enter the question" />
        </div>

        <div class="mb-3" v-for="(opt, idx) in newques.options" :key="idx">
          <label class="form-label">Option {{ idx + 1 }}</label>
          <input type="text" class="form-control" v-model="newques.options[idx]" :placeholder="'Option ' + (idx + 1)" />
        </div>

        <div class="mb-3">
          <label class="form-label">Correct option (1-4)</label>
          <input type="number" class="form-control" v-model.number="newques.correct_op" min="1" max="4" />
        </div>

      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-primary" @click="addQuestion" data-bs-dismiss="modal">Add Question</button>
      </div>
    </div>
  </div>
</div>

<!-- Add Quiz Modal -->
<div class="modal fade" id="addQuizModal" tabindex="-1" aria-labelledby="addQuizModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="addQuizModalLabel">Create New Quiz</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>

      <div class="modal-body">
        <div class="mb-3">
          <label class="form-label">Subject</label>
          <select v-model="newQuiz.subject_id" class="form-select" @change="newQuiz.selectedChapters = []">
            <option value="" disabled>Select Subject</option>
            <option v-for="sub in state.subjects" :key="sub.id" :value="sub.id">{{ sub.name }}</option>
          </select>
        </div>

        <div class="mb-3">
          <label class="form-label">Chapters (select one or more)</label>
          <select v-model="newQuiz.selectedChapters" class="form-select" multiple :disabled="!newQuiz.subject_id">
            <option v-for="chap in getChaptersForSubject(newQuiz.subject_id)" :key="chap.id" :value="chap.id">{{ chap.name }}</option>
          </select>
        </div>

        <div class="mb-3">
          <label class="form-label">Quiz Name</label>
          <input type="text" class="form-control" v-model="newQuiz.quiz_name" placeholder="Enter quiz name" />
        </div>

        <div class="mb-3">
          <label class="form-label">Time Duration (minutes)</label>
          <input type="number" min="1" class="form-control" v-model.number="newQuiz.time_duration" placeholder="Enter time duration" />
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-primary" @click="addQuiz" data-bs-dismiss="modal">Create Quiz</button>
      </div>
    </div>
  </div>
</div>

<!-- Edit Questions Modal -->
<div class="modal fade" id="editQuestionsModal" tabindex="-1" aria-labelledby="editQuestionsModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-xl">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="editQuestionsModalLabel">Questions</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div id="carouselExample" class="carousel slide">
          <div class="carousel-inner">
            <div v-for="(question, index) in state.question" :key="index" class="carousel-item" :class="{ active: index === 0 }">
              <div class="d-flex flex-column align-items-center">
                <h5 class="mb-3">{{ question.ques_statement }}</h5>
                <div class="container" style="max-width: 700px;">
                  <div v-for="(option, index1) in question.options" :key="index1">
                    <div :class="['p-2 mb-2 d-flex justify-content-between align-items-center mt-3', index1 + 1 === question.correct_op ? 'bg-success-subtle' : '']">
                      <input type="text" class="form-control me-2" v-model="question.options[index1]" :placeholder="option" />
                      <button class="btn btn-outline-secondary btn-sm" @click="editoption(question.id,index1,option)">Edit</button>
                    </div>
                  </div>
                </div>
                <div class="d-flex justify-content-between mt-3" style="width: 100%; max-width: 700px;">
                  <button class="btn btn-sm btn-outline-danger" @click="deleteQuestion(question.id, question.quiz_id)">Delete</button>
                  <div class="input-group ms-3" style="max-width: 200px; flex-grow: 1;">
                    <input type="text" class="form-control" v-model="key" />
                    <button class="btn btn-outline-secondary" @click="changekey(question.id, question.quiz_id)">Change Key</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button class="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true" style="background-color:rgb(161, 131, 32);"></span>
            <span class="visually-hidden">Previous</span>
          </button>
          <button class="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true" style="background-color:rgb(161, 131, 32);"></span>
            <span class="visually-hidden">Next</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>


  `
    
}