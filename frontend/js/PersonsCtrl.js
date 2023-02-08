app.controller('PersonsCtrl', [ '$http', 'common', function($http, common) {
    console.log('PersonsCtrl started')
    let ctrl = this

    const endpoint = '/api/persons'

    ctrl.editedRow = -1
    ctrl.persons = []
    ctrl.personsCount = 0
    ctrl.personsFiltered = 0
    ctrl.person = {}
    ctrl.limit = 5
    ctrl.filter = ''

    const clearPerson = {
        firstName: '',
        lastName: '',
        yearOfBirth: 2000,
        email: ''
    }

    Object.assign(ctrl.person, clearPerson)

    ctrl.refresh = function(withAlert = false) {
        $http.get(endpoint + '?limit=' + ctrl.limit + '&filter=' + ctrl.filter).then(
            function(res) {
                ctrl.persons = res.data.records
                ctrl.personsCount = res.data.all
                ctrl.personsFiltered = res.data.filtered
                if(withAlert) {
                    common.alert('View refreshed, ' + ctrl.persons.length + ' persons displayed')
                }
            },
            function(err) {
                common.alert('Error: ' + err.data.error, 'danger')
            }
        )
    }

    ctrl.edit = function(index) {
        ctrl.editedRow = index
        ctrl.person.firstName = ctrl.persons[index].firstName
        ctrl.person.lastName = ctrl.persons[index].lastName
        ctrl.person.yearOfBirth = ctrl.persons[index].yearOfBirth
        ctrl.person.email = ctrl.persons[index].email
    }

    ctrl.confirm = function(_id) {
        $http.put(endpoint + '?_id=' + _id, ctrl.person).then(
            function(res) {
               ctrl.refresh()
               common.alert('Person updated')
            },
            function(err) {
                common.alert('Person cannot be updated: ' + err.data.error, 'danger')
            }   
        )
        ctrl.editedRow = -1
    }

    ctrl.delete = function(index) {
        common.simpleDialog('Delete person?', 'Are you sure to delete "' + ctrl.persons[index].firstName + ' ' + ctrl.persons[index].lastName + '"?',
            true, true, function(res) {
                if(res) {
                    let _id = ctrl.persons[index]._id
                    $http.delete(endpoint + '?_id=' + _id).then(
                        function(res) {
                            common.alert('Person deleted')
                            ctrl.refresh()
                        },
                        function(err) {
                            common.alert('Person cannot be deleted: ' + err.data.error, 'danger')
                        }
                    )          
                }
            })
    }

    ctrl.prepareToAdd = function() {
        Object.assign(ctrl.person, clearPerson)
        ctrl.editedRow=ctrl.persons.length
    } 

    ctrl.add = function() {
        $http.post(endpoint, ctrl.person).then(
            function(res) {
                ctrl.refresh()
                ctrl.editedRow = -1
                Object.assign(ctrl.person, clearPerson)
                common.alert('Person added')
            },
            function(err) {
                common.alert('Person cannot be added: ' + err.data.error, 'danger')
            }
        )
    }

    ctrl.refresh()
}])