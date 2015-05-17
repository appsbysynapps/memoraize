angular.module('starter.controllers', ["firebase", "ngCordova"])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, Camera, $firebaseArray, NewOCRAPI, Decks, $cordovaImagePicker) {
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

    $scope.deck = {};

    $scope.createDeck = function() {
        Decks.newDeck($scope.deck, function(ref2) {
            var cards = [Decks.generateCard($scope.deck.term, $scope.deck.sentence)];
            Decks.addCards(ref2, cards);
            $scope.deck.term = "";
            $scope.deck.term = "";
            $scope.deck.sentence = "";
        });
    }

    $scope.cooltext = '';

    $scope.getPhoto = function() {
        console.log('Getting camera');
        Camera.getPicture({
            quality: 75,
            //targetWidth: 320,
            //targetHeight: 320,
            //encodingType: Camera.EncodingType.JPEG,
            saveToPhotoAlbum: false
        }).then(function(imageURI) {
            $scope.cooltext = 'Processing...';
            NewOCRAPI.getTextFromPhoto(imageURI, function(x) {
                $scope.cooltext = x;
            });
        }, function(err) {
            alert(JSON.stringify(err));
        });
    };

    $scope.getExistingPhoto = function() {
        //alert('Existing photo?');
        console.log('existing photo?');
        var options = {
            maximumImagesCount: 10,
            width: 800,
            height: 800,
            quality: 80
        };

        $cordovaImagePicker.getPictures(options)
            .then(function(results) {
                for (var i = 0; i < results.length; i++) {
                    console.log('Image URI: ' + results[i]);
                }
            }, function(error) {
                // error getting photos
            });
        //            Camera.getPicture({
        //                quality: 75,
        //                sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
        //                destinationType: Camera.DestinationType.FILE_URI,
        //                //targetWidth: 320,
        //                //targetHeight: 320,
        //                //encodingType: Camera.EncodingType.JPEG,
        //                saveToPhotoAlbum: false
        //                
        //            }).then(function(imageURI) {
        //                alert('yay?');
        //                console.log('yay?');
        //                $scope.cooltext = 'Processing...';
        //                NewOCRAPI.getTextFromPhoto(imageURI, function(x){
        //                    $scope.cooltext=x;
        //                });
        //            }, function(err) {
        //                console.log('oh no...');
        //                alert('oh no...');
        //                alert(JSON.stringify(err));
        //            });
    };

    $scope.decks = Decks.decks;

    $scope.deck = {};
    $scope.cards = {};

    $scope.saveDeck = function() {

        console.log($scope.deck.name);

        var deck = $scope.deck;

        $scope.decks.$add({
            name: $scope.deck.name,
            cards: {}
        }).then();
    };
})

.controller('CardsCtrl', function($scope, $stateParams, Decks) {
    $scope.cards = Decks.getCards($stateParams.deckId);
    console.log($scope.cards);
})

.controller('NewDeckCtrl', function($scope, Camera) {

});