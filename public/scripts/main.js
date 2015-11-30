/// <reference path="C:/Users/clark/Documents/GitHub/VoxRO-Website/typings/tsd.d.ts" />
var app = angular.module('VoxROApp', []);
app.controller('MainPageController', ['$scope', '$http', function ($scope, $http) {
        var mpCtrl = this;
        this.news = [];
        this.newsNo = 1;
        $http.get('/api/news/latest').success(function (data) {
            mpCtrl.news = data;
            mpCtrl.sortNewsByTimestamp();
        });
        this.nextNews = function () {
            mpCtrl.newsNo++;
            if (mpCtrl.newsNo >= mpCtrl.news.length)
                mpCtrl.newsNo = mpCtrl.news.length;
            mpCtrl.updateNews();
        };
        this.prevNews = function () {
            mpCtrl.newsNo--;
            if (mpCtrl.newsNo <= 1)
                mpCtrl.newsNo = 1;
            mpCtrl.updateNews();
        };
        this.updateNews = function () {
            var articles = document.querySelectorAll(".articleItem");
            TweenMax.to(articles, 0.2, { opacity: 0, onComplete: function () {
                    for (var i in articles) {
                        if (articles[i].style)
                            articles[i].style.display = 'none';
                    }
                    var currentArticle = document.querySelector(".articleItem[data-index='" + (mpCtrl.newsNo - 1) + "']");
                    console.log(currentArticle);
                    currentArticle.style.display = 'inline-block';
                    TweenMax.to(currentArticle, 0.2, { opacity: 1 });
                } });
        };
        this.sortNewsByTimestamp = function () {
            mpCtrl.news.sort(function (a, b) {
                return a.timestamp < b.timestamp;
            });
        };
    }]);
//# sourceMappingURL=main.js.map