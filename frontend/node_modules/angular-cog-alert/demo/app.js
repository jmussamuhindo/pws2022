(function () {
    angular.module('app', ['cogAlert', 'ngAnimate'])
    .controller('myController', myController);

    function myController(Alerting, $scope) {
        $scope.addWarning = function () {
            Alerting.addWarning('Warning message');
        };

        $scope.addDanger = function () {
            Alerting.addDanger('Danger message');
        };

        $scope.addInfo = function () {
            Alerting.addInfo('Info message');
        };

        $scope.addSuccess = function () {
            Alerting.addSuccess('Success message');
        };
    }
})();
