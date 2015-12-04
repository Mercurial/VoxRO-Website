/// <reference path="C:/Users/clark/Documents/GitHub/VoxRO-Website/typings/tsd.d.ts" />

var app = angular.module('VoxROApp', ['VoxROApp.Register']);

app.controller('MainPageController',['$scope', '$http','$sce', function($scope:  angular.IScope, $http: angular.IHttpService, $sce: angular.ISCEService) { 
	
	var mpCtrl = this;
	var updateIntId;
	var updateNewsIntId;
	var updateInterval = 10;
	
	this.news = [];
	this.newsNo = 1;
	this.playersOnline = 0;
	this.peakPlayers = 0;
	this.serverStatus = 'OFF';

	
	
	this.getNews = function() {
		$http.get('/api/news/latest?nonce=' + getCurrentTimestamp()).success(function(data){ 
			mpCtrl.news = data;
			mpCtrl.sortNewsByTimestamp();
			mpCtrl.applyNewsMarkDown();
		});	
	};
	
	this.nextNews = function() {
		mpCtrl.newsNo++;
		
		if(mpCtrl.newsNo >= mpCtrl.news.length)
			mpCtrl.newsNo = mpCtrl.news.length;
		
		mpCtrl.updateNews();
	};
	
	this.prevNews  = function() {
		mpCtrl.newsNo--;
		
		if(mpCtrl.newsNo <= 1)
			mpCtrl.newsNo = 1;
		
		mpCtrl.updateNews();
	};
	
	this.updateNews = function() {
		var articles = document.querySelectorAll(".articleItem");
		TweenMax.to(articles,0.2,{ opacity: 0, onComplete: function() {
			
			for(var i in articles)
			{
				if(articles[i].style)
					articles[i].style.display = 'none';
			}
			
			var currentArticle = document.querySelector(".articleItem[data-index='" + (mpCtrl.newsNo - 1) + "']");
		
			currentArticle.style.display = 'inline-block';
			TweenMax.to(currentArticle,0.2,{ opacity: 1 });
			
		}});
	};
	
	this.sortNewsByTimestamp = function() {
		mpCtrl.news.sort(function(a, b){
			return a.timestamp < b.timestamp;
		});
	};
	
	this.applyNewsMarkDown = function() {
		for(var i in mpCtrl.news)
		{
			mpCtrl.news[i].content = $sce.trustAsHtml(marked(mpCtrl.news[i].content)); 
		}
	};
	
	
	this.updatePlayersOnline = function() {
		$http.get('/api/server/players_online?nonce=' + getCurrentTimestamp() ).success(function (data) {
			mpCtrl.playersOnline = data.count;
			mpCtrl.peakPlayers = data.peak;
		});
	};
	
	this.updateServerStatus = function() {
		$http.get('/api/server/status?nonce=' + getCurrentTimestamp()).success(function (data) {
			mpCtrl.serverStatus = data.online ? "ON" : "OFF";
		});
	};
	
	updateIntId = setInterval(function() {
		mpCtrl.updatePlayersOnline();
		mpCtrl.updateServerStatus();
		//mpCtrl.getNews();
	}, updateInterval * 1000);
	
	/*updateNewsIntId = setInterval(function() {
		mpCtrl.getNews();
	},5000);*/
	
	
	
	mpCtrl.updatePlayersOnline();
	mpCtrl.updateServerStatus();
	mpCtrl.getNews();
}]);
