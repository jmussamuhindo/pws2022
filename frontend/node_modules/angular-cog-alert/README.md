![travis](https://travis-ci.org/bodiddlie/angular-cog-alert.svg?branch=master)
#Angular-CoG-Alert
A simple alerting directive/factory for AngularJS.

Demo
-----------
[angular-cog-alert](http://bodiddlie.github.io/angular-cog-alert)

Getting Started
-----------

###Installation
Downlaod the source as a [zip file](https://github.com/bodiddlie/angular-cog-alert/archive/master.zip) above or install via **Bower**.
```
bower install --save angular-cog-alert
```

Add references to `angular-cog-alert.css` &amp;  `angular-cog-alert.js`.
```html
<link rel="stylesheet" href="css/angular-cog-alert.css">
<script src="js/angular-cog-alert.js"></script>
```

Add dependency to your angular module.
```javascript
var myApp = angular.module('app', ['cogAlert']);
```

Add the `cog-alerts` directive to your page.
```html
<cog-alerts></cog-alerts>
```

Inject the `Alerting` factory anywhere you want to add alerts, and then add them as necessary.
```javascript
myApp.controller('myController', function ($scope, Alerting) {
    $scope.doSomething = function () {
        //do something
        Alerting.addDanger('Danger Will Robinson!');
    };
});
```

Error Handling
---------

Use the `errorHandler` function on the Alerting factory to gracefully handle exceptions from rejected promsises.
```javascript
myApp.controller('serviceController', function ($scope, someService, Alerting) {
    $scope.callService = function () {
        someService.getSomePromise().then(function () {
            //it worked!!
            Alerting.addSuccess('Hooray for not sucking!');
        })
        .catch(Alerting.errorHandler('A promise has been broken and I have died a little inside.'));
    };
});
```

Styling &amp; Animations
----------

The alerts all have the bootstrap `alert-*` classes applied to them. You can use custom class names by using the `addAlert()` method on the Alerting factory, which will result in `alert-[type]`
classes being applied.

For animations, you can use whatever method you please. The demo uses ngAnimate and [animate.css](http://daneden.github.io/animate.css/) to apply the flipInY/flipOutY animations when alerts are
shown/hidden. The demo applies the animation to `.alert.ng-enter` and `.alert.ng-leave`.

API
---------
+ **Alerting Factory**
  + `addAlert(type, message)`

    Add an alert of the given type to the list with the given message. Will apply the class `.alert-[type]` to the alert.
  + `addInfo(message)`

    Add an info alert with the given message to the list. Uses the bootstrap class `.alert-info`.
  + `addSuccess(message)`

    Add an success alert with the given message to the list. Uses the bootstrap class `.alert-success`.
  + `addWarning(message)`

    Add an warning alert with the given message to the list. Uses the bootstrap class `.alert-warning`.
  + `addDanger(message)`

    Add an info alert with the given message to the list. Uses the bootstrap class `.alert-danger`.
  + `errorHandler(message)`
    Returns a function that can be consumed by the catch method of a **$q** promise. Will add the given message as a danger alert.

#### [Guidelines for contributors](https://github.com/bodiddlie/angular-cog-alert/blob/master/contributing.md)

#### MIT &copy; [bodiddlie](https://twitter.com/bodiddlie)
