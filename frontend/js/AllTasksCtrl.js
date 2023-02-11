app.controller('AllTasksCtrl', [ '$http', 'common',function($http, common) {
    console.log('AllTasksCtrl started');
    let ctrl = this
    ctrl.tasks = []
    ctrl.projects = []
    ctrl.tasksFiltered = 0
    ctrl.taskName=''
    ctrl.task = {
        name: '',
        creator: null,
        project: null,
        status: "free",
        creationTime: Date.now(),
        category: "1"
    }
    const endpoint = '/api/tasks'
    
    ctrl.loadAllTasks = function(withAlert = false) {
        if(ctrl.task.project == null){
        
        let json = JSON.stringify({status: ctrl.task.status, project: null,  category: "1", name: ctrl.taskName, firstName: ctrl.taskName, lastName: ctrl.taskName})
        console.log(json)
        $http.get(endpoint + "?filter=" + json).then(
            function(res) {
                ctrl.tasks = res.data.records
                
            },
            function(err) {common.alert('Cannot retrieve tasks', 'danger')}
        )        
        }
        else {
        let json = JSON.stringify({status: ctrl.task.status, project: ctrl.task.project, name: ctrl.taskName, firstName: ctrl.taskName, lastName: ctrl.taskName})
        console.log(json)
        $http.get(endpoint + "?filter=" + json).then(
            function(res) {
                ctrl.tasks = res.data.records
            },
            function(err) {common.alert('Cannot retrieve tasks', 'danger')}
        )
        }      
    }
    ctrl.user_id = null
    ctrl.firstName = null
    ctrl.lastName = null
    $http.get('/auth').then(
        function(res){
            console.log(res.data._id)
            ctrl.user_id = res.data._id
            ctrl.firstName = res.data.firstName
            ctrl.lastName = res.data.lastName
        }
    )    
    
    ctrl.addTask = function() {
        ctrl.task.creator = ctrl.user_id
        $http.post(endpoint, ctrl.task).then(
            function(res) {           
                ctrl.loadAllTasks()
            },
            function(err) { common.alert('Cannot add the task', 'danger') }
        )
    }
    ctrl.takeOver = function(task_id){
        const data = {
            responsible: ctrl.user_id,
            firstName: ctrl.firstName,
            lastName: ctrl.lastName,
            status: "in progress"
        }
        $http.put(endpoint + '?_id=' + task_id, data).then(
            function(res) {         
                ctrl.loadAllTasks()
            },
            function(err) { common.alert('Cannot take over the task', 'danger') }
        )
    }
    ctrl.done = function(task_id){
        const data = {
            done: Date.now(),
            status: "done"
        }
        $http.put(endpoint + '?_id=' + task_id, data).then(
            function(res) {         
                ctrl.loadAllTasks()
            },
            function(err) { common.alert('Cannot take over the task', 'danger') }
        )
    }
    
    $http.get('/api/projects').then(
        function(res) {
            ctrl.projects = res.data.records
            ctrl.task.project = ctrl.projects.length > 0 ? ctrl.projects[0]._id : null
            ctrl.loadAllTasks()
        },
        function(err) { common.alert('Cannot retrieve projects', 'danger') }
    )
    
    ctrl.loadAllTasks()
}])
