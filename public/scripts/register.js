/// <reference path="C:/Users/clark/Documents/GitHub/VoxRO-Website/typings/tsd.d.ts" />
var app = angular.module('VoxROApp.Register', []);
app.controller('RegisterPageController', ['$scope', '$http', function ($scope, $http) {
        var regCtrl = this;
        this.password = "";
        this.confirmPassword = "";
        this.username = "";
        this.email = "";
        this.gender = "0";
        this.checkCaptcha = function () {
        };
        this.submitForm = function (e) {
            $http.post('/api/accounts/check_ue', { 'email': regCtrl.email, 'username': regCtrl.username }).success(function (data) {
                if (data.count > 0) {
                    alert('Username or Email already exists!');
                    return false;
                }
                if (regCtrl.password != regCtrl.confirmPassword) {
                    alert('Passwords must match!');
                    grecaptcha.reset();
                    return false;
                }
                else if (new Date(regCtrl.birthday).getFullYear() > new Date().getFullYear() - 7) {
                    alert('You must be atleast 8 years old to register!');
                    grecaptcha.reset();
                    return false;
                }
                else {
                    regCtrl.doRegistration();
                }
            });
        };
        this.doRegistration = function () {
            var data = {};
            data.username = regCtrl.username;
            data.password = regCtrl.password;
            data.email = regCtrl.email;
            data.gender = regCtrl.gender;
            data.birthday = regCtrl.birthday;
            data.captchaValue = document.getElementById("g-recaptcha-response").value;
            $http.post('/api/accounts/create', data).success(function (result) {
                if (result.success) {
                    regCtrl.username = "";
                    regCtrl.password = "";
                    regCtrl.email = "";
                    regCtrl.confirmPassword = "";
                    alert('Congratulations, You are now registered!');
                    grecaptcha.reset();
                }
                else {
                    alert(result.message);
                    grecaptcha.reset();
                }
            });
        };
    }]);
//# sourceMappingURL=register.js.map