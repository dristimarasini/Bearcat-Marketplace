angular.module('emailController', ['userServices'])

    .controller('emailCtrl', function ($routeParams, User, $timeout, $location) {

        app = this;

        User.activeAccount($routeParams.token).then(function (data) {

            app.successMsg = false;
            app.errorMsg = false;

            if (data.data.success) {
                app.successMsg = data.data.message + '...Redirecting';
                $timeout(function () {
                    $location.path('/login');
                }, 2000);

            } else {
                app.errorMsg = data.data.message + '...Redirecting';
                $timeout(function () {
                    $location.path('/login');
                }, 2000);

            }
        })

    })

    .controller('resendCtrl', function (User) {

        app = this;

        app.checkCredentials = function (loginData) {
            app.errorMsg = false;
            app.successMsg = false;
            User.checkCredentials(app.loginData).then(function (data) {
                if (data.data.success) {
                    User.resendLink(app.loginData).then(function (data) {
                        if (data.data.success) {
                            app.successMsg = data.data.message;
                        }
                    });

                } else {
                    app.errorMsg = data.data.message

                }
            })

        };

    })


    .controller('usernameCtrl', function (User) {

        app = this;

        app.sendUsername = function (userData, valid) {
            app.errorMsg = false;
            app.loading = true;

            if (valid) {
                User.sendUsername(app.userData.email).then(function (data) {
                    app.loading = false;

                    if (data.data.success) {
                        app.successMsg = data.data.message;
                    } else {
                        app.errorMsg = data.data.message;
                    }
                })
            } else {
                app.loading = false;
                app.errorMsg = 'Please enter a valid email';
            }


        };

    })


    .controller('passwordCtrl', function (User) {

        app = this;

        app.sendPassword = function (resetData, valid) {
            app.errorMsg = false;
            app.loading = true;

            if (valid) {
                User.sendPassword(app.resetData).then(function (data) {
                    app.loading = false;

                    if (data.data.success) {
                        app.successMsg = data.data.message;
                    } else {
                        app.errorMsg = data.data.message;
                    }
                });
            } else {
                app.loading = false;
                app.errorMsg = 'Please enter a valid username';
            }


        }

    })

    .controller('resetCtrl', function (User, $routeParams, $scope) {

        app = this;
        app.hide = true;

        User.resetUser($routeParams.token).then(function (data) {
            if (data.data.success) {
                app.hide = false;
                //$scope.alert = 'alert alert-success'; // Set success message class
                app.successMsg = 'Please enter a new password'; // Let user know they can enter new password
                $scope.username = data.data.user.username; // Save username in scope for use in savePassword() function
            } else {
                //$scope.alert = 'alert alert-danger'; // Set success message class
                app.errorMsg = data.data.message; // Grab error message from JSON object
            }
        });

        // Function to save user's new password to database
        app.savePassword = function (regData, valid, confirmed) {
            app.errorMsg = false;
            app.loading = true;
            app.regData.username = $scope.username;

            if (valid && confirmed) {
                User.savePassword(app.regData).then(function (data) {
                    app.loading = false;
                    if (data.data.success) {
                        app.successMsg = data.data.message;
                        $timeout(function () {
                            $location.path('/login');
                        }, 2000);
                    } else {
                        app.loading = false;
                        app.errorMsg = data.data.message
                    }
                })

            } else {
                app.loading = false;
                app.errorMsg = 'Please ensure form is filled properly';
            }

        }

    });