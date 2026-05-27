import { globalStore } from "../store.js"
export default {
  
    setup() {
        const {reactive,onMounted,ref,computed}= Vue
        const state=  reactive({subject:[],mess:''})
        const invisible=ref(false)
        const chapterName=ref('')
        const SubjectName=ref('')
        // fetching subjects
        const dashboard= async ()=>{
            try{
                console.log(localStorage.getItem("auth-token"))
                const response=await fetch('/api/subject', {
                    method: 'GET',
                    headers: { "Content-Type": "application/json",
                               'Authentication-Token' : localStorage.getItem("auth-token")
                     }
            })
            if (!response.ok) {
                throw new Error("Failes to fetch Subject")
            }
            const data = await response.json()
            state.subject=data

        }catch (error) {
            state.mess= error.message
        }
        }
        onMounted(()=>{
            dashboard()
        })
        // deleting chapter
        const deletechap=async(id)=>{
            try{
                const response=await fetch(`/api/chapter/${id}`, {
                    method: 'DELETE',
                    headers: { "Content-Type": "application/json",
                              'Authentication-Token' : localStorage.getItem("auth-token")
                    }
            })
            if (!response.ok) {
                throw new Error("Failes to delete chap")
            }
            await dashboard()
            }catch (error) {
              state.mess=error.message
            }
     
            }
        // editing chapter
        
        const editchap=async(chapter)=>{
            try{
                const response=await fetch(`/api/chapter/${chapter.id}`, {
                    method: 'PATCH',
                    headers: { "Content-Type": "application/json",
                              'Authentication-Token' : localStorage.getItem("auth-token")
                    },
                    body: JSON.stringify({name: chapter.name})
            })
            if (!response.ok) {
                throw new Error("Failes to update chap")
            }

          }catch (error) {
              state.mess=error.message
          }}
        
        const toggle=()=>{
            invisible.value=!invisible.value
        }
        const addchap=async(subectId)=>{
          if (chapterName.value.trim() === '') {
                state.mess = 'Chapter name cannot be empty';
                return;
            }
            try{
              const response=await fetch(`/api/chapter`,{
                method: 'POST',
                headers: { "Content-Type": "application/json",
                          'Authentication-Token' : localStorage.getItem("auth-token")
                },
                body: JSON.stringify({name: chapterName.value, subject_id: subectId})
              })
            
            if(!response.ok) {
                throw new Error("Failed to add chapter")
            }
            const data=await response.json()
            await dashboard()
            chapterName.value = ''
          } catch (error) {
            state.mess = error.message
          }}

        const addsub=async()=>{
          if (SubjectName.value.trim() === '') {
              state.mess = 'Subject name cannot be empty';
              return;
          }
          try{
            const response=await fetch(`/api/subject`,{
              method: 'POST',
              headers: { "Content-Type": "application/json",
                          'Authentication-Token' : localStorage.getItem("auth-token")
                },
                body: JSON.stringify({name: SubjectName.value})
            })
          
          if(!response.ok) {
              throw new Error("Failed to add subject")
          }
          await dashboard()
          SubjectName.value = ''
          
      
        } catch (error) {
          state.mess = error.message
        }}
        const deletesub=async(id)=>{
              try{
                  const response=await fetch(`/api/subject/${id}`, {
                      method: 'DELETE',
                      headers: { "Content-Type": "application/json",
                                'Authentication-Token' : localStorage.getItem("auth-token")
                      }
              })
              if (!response.ok) {
                  throw new Error("Failes to delete sub")
              }
              await dashboard()
              }           
              catch (error) {
                  state.mess=error.message
              }
          }
        
        //search
        const filteredsub=computed(()=>{
          const key=globalStore.value.trim().toLowerCase()
          if (key.length===0){
            return state.subject
          }
          else{
            return state.subject.filter(sub=>sub.name.toLowerCase().includes(key))
          }
        })
      return{state,deletechap,editchap,toggle,invisible,chapterName,addchap,addsub,SubjectName,deletesub,filteredsub,globalStore}
    },
    template:`<div class="container" style="margin-top: 80px">
  <p v-if="state.mess" class="alert alert-danger text-center">{{ state.mess }}</p>

  <div class="row">
    <div v-for="sub in (invisible ? filteredsub : filteredsub.slice(0, 3))" :key="sub.id" class="col-md-4 mb-4">
      <div class="card border-primary shadow-sm h-100">
        <div class="card-header bg-primary text-white text-center">
          <h5 class="mb-0">{{ sub.name }}</h5>
        </div>
        <div class="card-body">
          <h6 class="text-muted text-center mb-3">List of Chapters</h6>
          <ul class="list-group list-group-flush">
            <li v-for="chapter in sub.chapters" :key="chapter.id" class="list-group-item d-flex justify-content-between align-items-center">
              <input type="text" class="form-control me-2" v-model="chapter.name" :placeholder="chapter.name"/>
              <div class="btn-group ms-2">
                <button class="btn btn-sm btn-outline-danger" @click="deletechap(chapter.id)">Delete</button>
                <button class="btn btn-sm btn-outline-success" @click="editchap(chapter)">Edit</button>
              </div>
            </li>
          </ul>

          <div class="d-flex justify-content-between mt-3">
            <button type="button"class="btn btn-sm btn-warning"data-bs-toggle="modal":data-bs-target="'#addChapterModal' + sub.id">Add Chapter</button>
            <button class="btn btn-sm btn-outline-danger" @click="deletesub(sub.id)"> Delete Subject</button>
          </div>
        </div>
      </div>

      <!-- Chapter Modal -->
      <div class="modal fade" :id="'addChapterModal' + sub.id" tabindex="-1" aria-labelledby="addChapterModalLabel"aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5" id="addChapterModalLabel">Add Chapter to {{ sub.name }}</h1>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <input type="text" class="form-control" v-model="chapterName" placeholder="Please Enter Chapter Name"/>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button"class="btn btn-primary"data-bs-dismiss="modal"@click="addchap(sub.id)">
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
      <!-- End Chapter Modal -->
    </div>
  </div>

  <div class="text-center mt-4">
    <button @click="toggle" class="btn btn-primary me-2">
      {{ invisible ? 'Show Less Subjects' : 'Show All Subjects' }}
    </button>
    <button
      class="btn btn-secondary"data-bs-toggle="modal"data-bs-target="#addSubjectModal">Add Subject</button>
  </div>

  <!-- Subject Modal -->
  <div class="modal fade" id="addSubjectModal" tabindex="-1" aria-labelledby="addSubjectModalLabel"aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="addSubjectModalLabel">Add Subject</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <input type="text" class="form-control" v-model="SubjectName" placeholder="Please Enter Subject Name"/>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button type="button"class="btn btn-primary"data-bs-dismiss="modal"@click="addsub()">Submit</button>
        </div>
      </div>
    </div>
  </div>

</div>
`   
    
}
