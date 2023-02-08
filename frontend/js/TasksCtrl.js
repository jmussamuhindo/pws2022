app.controller('TasksCtrl', [ '$http', 'common', function($http, common) {
    console.log('TasksCtrl started')
    let ctrl = this
    ctrl.tasks = []
    ctrl.allTasks = []
    ctrl.projects = []
    ctrl.task = {
        name: '',
        creator: null,
        project: null,
        status: "available",
        creationTime: Date.now(),
        category: "1"
    }
    ctrl.permission = false
    ctrl.takeOverPermission = false
    ctrl.member = null
    const endpoint = '/api/tasks'
    ctrl.findManager = function(){
        for(let i=0; i < ctrl.projects.length; i++){
            if(ctrl.projects[i]._id == ctrl.task.project){
                ctrl.manager = ctrl.projects[i].manager._id
                if(ctrl.manager == ctrl.user_id){
                    ctrl.permission = true
                }
                else {
                    return;
                }
            }
        }
    }
    ctrl.findMembers = function(){
        for(let i=0; i < ctrl.projects.length; i++){
            if(ctrl.projects[i]._id == ctrl.task.project){
                for(let j=0; j < ctrl.projects[i].members.length; j++){
                    //console.log(ctrl.projects[i].members[j]._id)
                    if(ctrl.projects[i].members[j]._id == ctrl.user_id){
                        ctrl.member = ctrl.user_id
                        ctrl.takeOverPermission = true
                        break;
                    }
                    else{
                        ctrl.takeOverPermission = false
                    }
                }
                
            }
        }
    }
    ctrl.loadTasks = function() {
        let json = JSON.stringify({status: '', project: ctrl.task.project, name: '', firstName: '', lastName: ''})
        $http.get(endpoint + '?filter=' + json).then(
            function(res) {
                ctrl.tasks = res.data.records
                //ctrl.findManager()
                //ctrl.findMembers()
            },
            function(err) { common.alert('Cannot retrieve tasks', 'danger') }
        )            
    }
    ctrl.user_id = null
    $http.get('/auth').then(
        function(res){
            ctrl.user_id = res.data._id
            ctrl.firstName = res.data.firstName
            ctrl.lastName = res.data.lastName
        }
    )    
    
    ctrl.addTask = function() {
        ctrl.task.creator = ctrl.user_id
        ctrl.findManager()
        if (ctrl.permission) {
            $http.post(endpoint, ctrl.task).then(
                function(res) {           
                    ctrl.loadTasks()
                },
                function(err) { common.alert('Cannot add the task', 'danger') }
            )
        }else {
            common.alert('Cannot add the task')
        }
    }
    ctrl.takeOver = function(task_id){
        
        const data = {
            responsible: ctrl.user_id,
            firstName: ctrl.firstName,
            lastName: ctrl.lastName,
            status: "in progress"
        }
        ctrl.findMembers()
        if(ctrl.takeOverPermission) {
        $http.put(endpoint + '?_id=' + task_id, data).then(
            function(res) {         
                ctrl.loadTasks()
            },
            function(err) { common.alert('Cannot take over the task', 'danger') }
        )
        }
        else {
            common.alert('Cannot take over the task')
        }
    }
    ctrl.done = function(task_id){
        const data = {
            done: Date.now(),
            status: "done"
        }
        $http.put(endpoint + '?_id=' + task_id, data).then(
            function(res) {         
                ctrl.loadTasks()
            },
            function(err) { common.alert('Cannot take over the task', 'danger') }
        )
    }
    $http.get('/api/projects').then(
        function(res) {
        
            ctrl.projects = res.data.records
            ctrl.task.project = ctrl.projects.length > 0 ? ctrl.projects[0]._id : null
           
            ctrl.loadTasks()
        },
        function(err) { common.alert('Cannot retrieve projects', 'danger') }
    )
    $http.get('/api/tasks').then(
        function(res) {
            let allTasks = res.data.records
            ctrl.loadTasks()
        },
        function(err) { common.alert('Cannot retrieve projects', 'danger') }
    )
    /*
    $http.get('/api/allTasks').then(
        function(res) {
            ctrl.loadAllTasks()
        },
        function(err) { common.alert('Cannot retrieve projects', 'danger') }
    )
    ctrl.loadAllTasks()
    */
   ctrl.loadTasks()
}])