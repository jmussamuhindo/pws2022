(function () {
    describe('Alert Directive', function () {
        var element;
        var scope;
        var alert;
        var compile;

        beforeEach(function () {
            alert = {type: 'danger', message: 'message', show: true};
            module('cogAlert', function ($provide) {
                $provide.value('Alerting', {currentAlerts: [alert]});
            });

            inject(function ($rootScope, $compile) {
                scope = $rootScope.$new();
                compile = $compile;

                element = '<cog-alerts></cog-alerts>';
            });
        });

        it('shows the alerts in the new element', function () {
            element = compile(element)(scope);
            scope.$digest();
            var elm = angular.element(element[0].querySelector('div.alert'));
            expect(elm.length).toEqual(1);
        });

        it('hides the alert when show is set to false', function () {
            alert.show = false;
            element = compile(element)(scope);
            scope.$digest();
            var elm = angular.element(element[0].querySelector('div.alert'));
            expect(elm.length).toEqual(0);
        });
    });
})();
