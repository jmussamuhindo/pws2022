const app = angular.module('pws2022', [ 'ngRoute', 'ngSanitize', 'ngAnimate', 'ui.bootstrap', 'httpLoadingInterceptor', 'cogAlert', 'ct-ui.select' ])

// router

app.constant('routes', [
    { route: '/', templateUrl: 'home.html', controller: 'HomeCtrl', controllerAs: 'ctrl', menu: '<i class="fa fa-lg fa-home"></i>'},
    { route: '/persons', templateUrl: 'persons.html', controller: 'PersonsCtrl', controllerAs: 'ctrl', menu: 'Persons' },
    { route: '/projects', templateUrl: 'projects.html', controller: 'ProjectsCtrl', controllerAs: 'ctrl', menu: 'Projects' },
    { route: '/tasks', templateUrl: 'tasks.html', controller: 'TasksCtrl', controllerAs: 'ctrl', menu: 'Tasks' },
    { route: '/allTasks', templateUrl: 'allTasks.html', controller: 'AllTasksCtrl', controllerAs: 'ctrl', menu: 'All Tasks' }
])

app.config(['$routeProvider', '$locationProvider', 'routes', function($routeProvider, $locationProvider, routes) {
    $locationProvider.hashPrefix('')
	for(let route of routes) {
		$routeProvider.when(route.route, route)
	}
	$routeProvider.otherwise({ redirectTo: '/' })
}])

// common functions

app.service('common', [ '$uibModal', 'Alerting', function($uibModal, Alerting) {
    let common = this

    // general modal dialog
    common.dialog = function(template, templateUrl, controller, options, nextTick) {

        let modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title-top',
            ariaDescribedBy: 'modal-body-top',
            template: template,
            templateUrl: templateUrl,
            controller: controller,
            controllerAs: 'ctrl',
            resolve: { options: function () { return options } }
        })

        modalInstance.result.then(
            function(answer) { nextTick(answer) },
            function() { nextTick(null) }
        )
    }
    
    // confirmation dialog function
    common.simpleDialog = function(title, body, ok, cancel, nextTick) {
        let options = { title, body, ok, cancel }
        common.dialog(`
        <form>

            <div class="modal-header">
                <h3 class="modal-title" id="modal-title" ng-bind="ctrl.options.title"></h3>
            </div>
            <div class="modal-body" id="modal-body" ng-bind-html="ctrl.options.body"></div>
            <div class="modal-footer">
                <button class="btn btn-success fa fa-check" type="button" ng-click="ctrl.dialog.close(true)" ng-if="ctrl.options.ok"></button>
                <button class="btn btn-danger fa fa-times" type="button" ng-click="ctrl.dialog.dismiss()" ng-if="ctrl.options.cancel"></button>
            </div>
    
        </form>        
        `, null, [ '$uibModalInstance', 'options', function($uibModalInstance, options) {
            this.options = options
            this.dialog = $uibModalInstance
        } ], options, nextTick)
    }

    common.alert = function(text, type = 'success') {
        Alerting.addAlert(type, text)
        console.log('alert[' + type + ']:', text)
    }
}])

// main controller

app.controller('MainCtrl', [ '$http', '$location', '$scope', 'routes', 'common', function($http, $location, $scope, routes, common) {
    console.log('MainCtrl started')
    let ctrl = this

    // auth handling

    ctrl.loggedUser = null
    ctrl.creds = { username: '', password: '' }

    ctrl.doLogin = function() {
        $http.post('/auth', ctrl.creds).then(
            function(res) {
                ctrl.loggedUser = res.data
                rebuildMenu()
                common.alert('Welcome, ' + ctrl.loggedUser.username)
            },
            function(err) {
                common.alert('Login failed', 'danger')
            }
        )
    }

    ctrl.doLogout = function() {
        $http.delete('/auth').then(
            function(res) {
                ctrl.loggedUser = res.data
                rebuildMenu()
                common.alert('You are logged out')
            },
            function(err) {}
        )
    }

    // menu handling

    ctrl.menu = []

    const rebuildMenu = function() {
        ctrl.menu.length = 0
		for(let route of routes) {
            if(route.route == '/' || ctrl.loggedUser.username) {
                if (ctrl.loggedUser.username == 'admin' && (route.route == '/tasks' || route.route == '/allTasks')) {
                    ctrl.menu.push({ route: route.route, title: route.menu })
                // }else if (ctrl.loggedUser.username == 'nonadmin' && (route.route == '/persons' || route.route == '/projects')) {
                }else {
                    ctrl.menu.push({ route: route.route, title: route.menu })
                }
            }
		}
        $location.path("/")
    }

    ctrl.isCollapsed = true
    $scope.$on('$routeChangeSuccess', function () {
        ctrl.isCollapsed = true
    })
    
    ctrl.navClass = function(page) {
        return page === $location.path() ? 'active' : ''
    }     

    // whoami - once on the start
    
    $http.get('/auth').then(
        function(res) {
            ctrl.loggedUser = res.data
            rebuildMenu()
        },
        function(err) { common.alert('Whoami failed, cannot continue', 'danger') }
    )    
}])