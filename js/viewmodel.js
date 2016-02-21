'use strict';

//define map, center and zoom to KC
var initMap = function(){
  this.map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 39.076268, lng: -94.590043},
    zoom: 13,
    mapTypeControlOptions: {
      position: google.maps.ControlPosition.BOTTOM_CENTER
    }
  });
};

var viewModel = function(){

  var self = this; 

  //constructor for each place with a click eventlistener
  self.place = function(name, lat, long) {
    this.name = name;
    this.lat = ko.observable(lat);
    this.long = ko.observable(long);
    this.marker = new google.maps.Marker({
      position: new google.maps.LatLng(lat, long),
      title: name,
      map: self.initMap.map,
    });
    google.maps.event.addListener(this.marker, 'click', function() {
      self.selectPlace(this);
    }.bind(this));
  };

  //animate marker, set content of infowindow
  self.selectPlace = function(place) {
    var x = place.marker;
    x.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
      x.setAnimation(null);
    }, 2100);
    self.foursquare(place);
    self.infowindow.setContent('<div>loading</div>');
    self.infowindow.open(self.initMap.map, x);
    setTimeout(function() {
      self.infowindow.setContent('<div>' + self.jsonContent + '</div>');
      self.infowindow.open(self.initMap.map, x);
    }, 1000);
  }; 

  //updates visibility of each place
  self.updatePlaces = function(){
    var i;
    var placesLength = self.places().length;
    for (i = 0; i < placesLength; i++) {
      var thisPlace = self.places()[i];
      thisPlace.marker.setVisible(false);
    }
    for (i = 0; i < placesLength; i++) {
      var thisPlace = self.visiblePlaces()[i];
      if (thisPlace) {
        thisPlace.marker.setVisible(true);
      }
    }
  };

  //error handler if google is broken
  if (typeof google !== 'object' || typeof google.maps !== 'object'){
    $('.error').text("Sorry! There was a problem loading Google Maps Api");
    $('.hamburger').css('display','none');
    $('.sidebar').css('display','none');
    $('header').css('background-color','red');
    return;
  }

  //track visibility of menu items in the DOM
  self.ul = ko.observable(true);

  //initialize map within viewmodel
  self.initMap = new initMap();

  //track the value of the searchbox input
  self.searchBox = ko.observable('');

  //the model
  self.places = ko.observableArray([
    new self.place('801 Chop House', 39.096980, -94.582418),
    new self.place('Grinders', 39.091405, -94.578115),
    new self.place('Jack Stack Barbecue', 39.087237, -94.585817),
    new self.place('Beer Kitchen', 39.052808, -94.591287),
    new self.place('The Farmhouse', 39.109373, -94.584818)
  ]);

  //the api call
  this.foursquare = function(place){

    var url = 'https://api.foursquare.com/v2/venues/search?ll='
      + place.lat()
      + ',' 
      + place.long()
      + '&client_id=' 
      + 'CTMPH2WR0Z3U2DKN33AV0LEGI1RQBM5SCLZBOSHKOVAY4SUA'
      + '&client_secret='
      + '2QGAAF3EERLHRTMLOLK5OAHSMGOJNAI1KFYYYHEECO2L0XEU'
      + '&v=20160219';

    $.getJSON(url).done(function(response) {

      var venue = response.response.venues[0];

      self.jsonContent = "<p><strong>" + venue.name + "</strong></p>"
      + "<p>" + venue.location.address + "</p>"
      + "<p>" + venue.contact.formattedPhone + "</p>";

      if (venue.menu.url) {
        self.jsonContent += "<a href='" + venue.menu.url + "'>Menu</a>";
      }

      if (venue.menu.url && venue.reservations.url) {
        self.jsonContent += " | ";
      }

      if (venue.reservations.url) {
        self.jsonContent += "<a href='" + venue.reservations.url + "'>Reserve</a>";
      }

    });

  };

  //create container for infowindows
  self.infowindow = new google.maps.InfoWindow();

  //filter all the places that match any input characters in the search box
  self.visiblePlaces = ko.computed(function() {
    return ko.utils.arrayFilter(self.places(), function(place) {
      return (
        place.name.toLowerCase().indexOf(self.searchBox().toLowerCase()) >= 0
      );
    });
  }, self);

  //when visible places is updated, update the markers as well
  self.visiblePlaces.subscribe(function() {
    self.updatePlaces();
  });

  //return visible places to the side menu
  self.placeMenu = ko.computed(function(){
    return self.visiblePlaces();
  });

  //track the visibility of the sidemenu
  self.showMenu = ko.observable(true);

  //toggle the visibility of the sidemenu
  self.toggleMenu = function() {
    self.showMenu(!self.showMenu());
  };
};

//BAMF!
ko.applyBindings(new viewModel());
