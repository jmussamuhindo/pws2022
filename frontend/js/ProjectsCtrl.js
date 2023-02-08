app.controller('ProjectsCtrl', [ '$http', 'common', function($http, common) {
    console.log('ProjectsCtrl started')
    let ctrl = this

    const endpoint = '/api/projects'

    ctrl.editedRow = -1
    ctrl.projects = []
    ctrl.projectsCount = 0
    ctrl.projectsFiltered = 0
    ctrl.project = {}
    ctrl.persons = []
    ctrl.limit = 5
    ctrl.filter = ''

    const clearProject = {
        name: '',
        manager: null,
        members: []
    }

    Object.assign(ctrl.project, clearProject)

    ctrl.refresh = function(withAlert = false) {
        $http.get(endpoint + '?limit=' + ctrl.limit + '&filter=' + ctrl.filter).then(
            function(res) {
                ctrl.projects = res.data.records
                ctrl.projectsCount = res.data.all
                ctrl.projectsFiltered = res.data.filtered
                if(withAlert) {
                    common.alert('View refreshed, ' + ctrl.projects.length + ' projects displayed')
                }
            },
            function(err) {
                common.alert('Error: ' + err.data.error, 'danger')
            }
        )
    }

    ctrl.edit = function(index) {
        ctrl.editedRow = index
        ctrl.project.name = ctrl.projects[index].name
        ctrl.project.manager = ctrl.projects[index].manager
        ctrl.project.members = ctrl.projects[index].members
    }

    ctrl.confirm = function(_id) {
        let projectToSend = {
            name: ctrl.project.name,
            manager: ctrl.project.manager ? ctrl.project.manager._id : null,
            members: ctrl.project.members ? ctrl.project.members.map(function(el) {
                return el._id
            }) : []
        }
        $http.put(endpoint + '?_id=' + _id, projectToSend).then(
            function(res) {
                ctrl.refresh()
                common.alert('Project updated')
            },
            function(err) {
                common.alert('Project cannot be updated: ' + err.data.error, 'danger')
            }   
        )
        ctrl.editedRow = -1
    }

    ctrl.delete = function(index) {
        common.simpleDialog('Delete project?', 'Are you sure to delete "' + ctrl.projects[index].name + "'?'",
            true, true, function(res) {
                if(res) {
                    let _id = ctrl.projects[index]._id
                    $http.delete(endpoint + '?_id=' + _id).then(
                        function(res) {
                            common.alert('Project deleted')
                            ctrl.refresh()
                        },
                        function(err) {
                            common.alert('Project cannot be deleted: ' + err.data.error, 'danger')
                        }
                    )          
                }
            })
    }

    ctrl.prepareToAdd = function() {
        Object.assign(ctrl.project, clearProject)
        ctrl.editedRow=ctrl.projects.length
    } 

    ctrl.add = function() {
        let projectToSend = {
            name: ctrl.project.name,
            manager: ctrl.project.manager ? ctrl.project.manager._id : null,
            members: ctrl.project.members ? ctrl.project.members.map(function(el) {
                return el._id
            }) : []
        }
        $http.post(endpoint, projectToSend).then(
            function(res) {
                ctrl.refresh()
                ctrl.editedRow = -1
                Object.assign(ctrl.project, clearProject)
                common.alert('Project added')
            },
            function(err) {
                common.alert('Project cannot be added: ' + err.data.error, 'danger')
            }
        )
    }

    ctrl.abbrevPerson = function(person) {
        return person ? person.firstName.substring(0,1) + '.' + person.lastName : null
    }

    ctrl.abbrevPersons = function(persons) {
        return persons.map(function(el) { return ctrl.abbrevPerson(el) }).join(' ')
    }

    $http.get('/api/persons').then(
        function(res) {
            ctrl.persons = res.data.records
        },
        function(err) {
            common.alert('Error: ' + err.data.error, 'danger')
        }
    )

    ctrl.refresh()
}])