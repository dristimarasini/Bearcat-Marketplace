angular.module('mainController', ['authServices'])

    .controller('mainCtrl', function (Auth, $timeout, $location, $rootScope) {
        var app = this;

        app.loadme = false;

        $rootScope.$on('$routeChangeStart', function () {

            if (Auth.isLoggedIn()) {
                console.log('Success: User is logged in');
                app.isLoggedIn = true;
                Auth.getUser().then(function (data) {

                    app.username = data.data.username;
                    app.useremail = data.data.email;
                    app.loadme = true;
                })
            } else {

                app.isLoggedIn = false;
                app.username = '';
                app.loadme = true;
            }

        });



        this.doLogin = function (loginData) {
            app.loading = true;
            app.errorMsg = false;
            app.expired = false;
            app.disabled = true;

            Auth.login(app.loginData).then(function (data) {
                console.log(data.data.success);
                console.log(data.data.message);
                if (data.data.success) {
                    app.loading = false;
                    //create success message and redirect to home
                    app.successMsg = data.data.message + '...Redirecting';
                    $timeout(function () {
                        $location.path('/about');
                        app.loginData = '';
                        app.successMsg = false;
                    }, 2000);

                } else {
                    if (data.data.expired) {
                        app.expired = true;
                        app.loading = false;
                        app.errorMsg = data.data.message;
                    } else {
                        app.loading = false;
                        app.disabled = true;
                        app.errorMsg = data.data.message;
                    }
                }
            })
        };

        this.logout = function () {
            Auth.logout();
            $location.path('/logout');
            $timeout(function () {
                $location.path('/');
            }, 2000);
        }
    });