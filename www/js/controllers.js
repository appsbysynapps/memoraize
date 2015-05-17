angular.module('starter.controllers', ["firebase"])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, Camera, $firebaseArray, NewOCRAPI) {
    // Form data for the login modal
    $scope.loginData = {};

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function() {
        $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function() {
        $scope.modal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function() {
        console.log('Doing login', $scope.loginData);

        // Simulate a login delay. Remove this and replace with your login
        // code if using a login system
        $timeout(function() {
            $scope.closeLogin();
        }, 1000);
    };

    $ionicModal.fromTemplateUrl('templates/newDeck.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.newDeckModal = modal;
    });


    $scope.newDeck = function() {
        $scope.newDeckModal.show();
    };

    $scope.closeNewDeck = function() {
        $scope.newDeckModal.hide();
    };
    
    $scope.cooltext = 'Placeholder.';
    
    $scope.getPhoto = function() {
        console.log('Getting camera');
        Camera.getPicture({
            quality: 75,
            //targetWidth: 320,
            //targetHeight: 320,
            //encodingType: Camera.EncodingType.JPEG,
            saveToPhotoAlbum: false
        }).then(function(imageURI) {
            console.log(imageURI);
            $scope.lastPhoto = imageURI;
            $scope.cooltext = JSON.stringify(NewOCRAPI.getTextFromPhoto(imageURI));
            alert($scope.cooltext);
        }, function(err) {
            alert(JSON.stringify(err));
        });
    };
    
    var ref = new Firebase("https://memoraize.firebaseio.com/decks");
    $scope.decks = $firebaseArray(ref);
    
    $scope.deck = {};
    $scope.cards = {};
    
    $scope.saveDeck = function() {
        
        console.log($scope.deck.name);
        
        var deck= $scope.deck;
        
        $scope.decks.$add({
            name: $scope.deck.name,
            cards: {}
        }).then(function(ref2){
            $scope.cards = $firebaseArray(ref2.child("cards"));
            console.log($scope.deck.term);
            console.log($scope.deck.sentence);
            $scope.cards.$add({
                front: $scope.deck.term,
                back: $scope.deck.sentence
            });
        });
    }
})

.controller('PlaylistsCtrl', function($scope) {
    
    /*$scope.decks = [{
        title: 'Reggae',
        id: 1
    }, {
        title: 'Chill',
        id: 2
    }, {
        title: 'Dubstep',
        id: 3
    }, {
        title: 'Indie',
        id: 4
    }, {
        title: 'Rap',
        id: 5
    }, {
        title: 'Cowbell',
        id: 6
    }];*/
    
    
    //console.log($scope.decks);
    
})

.controller('PlaylistCtrl', function($scope, $stateParams) {})

.controller('NewDeckCtrl', function($scope, Camera) {

});