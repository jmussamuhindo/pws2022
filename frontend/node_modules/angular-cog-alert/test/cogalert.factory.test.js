(function () {
    describe('Alerting', function () {
        var fac;
        var timeout;

        beforeEach(function () {
            module('cogAlert');

            inject(function (Alerting, $timeout) {
                fac = Alerting;
                timeout = $timeout;
                spyOn(fac, 'addAlert').and.callThrough();
            });
        });

        it('starts out with an empty list of alerts', function () {
            expect(fac.currentAlerts.length).toBe(0);
        });

        it('can add an alert of any type', function () {
            fac.addAlert('type', 'message');
            expect(fac.currentAlerts.length).toBe(1);
            expect(fac.currentAlerts[0].type).toEqual('type');
            expect(fac.currentAlerts[0].message).toEqual('message');
        });

        it('can add alerts of specific types', function () {
            fac.addWarning('message');
            fac.addDanger('message');
            fac.addInfo('message');
            fac.addSuccess('message');
            expect(fac.currentAlerts.length).toEqual(4);
            expect(fac.currentAlerts[0].type).toEqual('warning');
            expect(fac.currentAlerts[1].type).toEqual('danger');
            expect(fac.currentAlerts[2].type).toEqual('info');
            expect(fac.currentAlerts[3].type).toEqual('success');
        });

        it('hides the alert after 5 seconds and removes it after 10', function () {
            fac.addWarning('message');
            var alert = fac.currentAlerts[0];
            expect(alert.show).toBe(true);
            timeout.flush();
            expect(alert.show).toBe(false);
            expect(fac.currentAlerts.length).toBe(0);
        });

        it('returns an error handler function for catching errors that logs a danger message', function () {
            var handler = fac.errorHandler('message');
            handler();
            expect(fac.currentAlerts.length).toEqual(1);
        });

        it('will not change the array if an invalid alert is passed in to removeAlert', function () {
            fac.addAlert('type', 'message');
            expect(fac.currentAlerts.length).toBe(1);
            fac.removeAlert({type: 'bad', message: 'bad', show: true});
            expect(fac.currentAlerts.length).toBe(1);
        });
    });
})();
