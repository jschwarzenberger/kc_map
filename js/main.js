'use strict';

var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 39.076268, lng: -94.590043},
      zoom: 13
  });

  setMarkers(places);
}

function setMarkers(places) {
  for (var i = 0; i < places.length; i++) {
    places[i].holdMarker = new google.maps.Marker({
      position: new google.maps.LatLng(places[i].lat, places[i].long),
      title: places[i].name,
      map: map
    });
  };
}

function setAllMap() {
  for (var i=0; i < places.length; i++) {
    if (places[i].boolTest === true) {
      places[i].holdMarker.setMap(map);
    }
    else {
      places[i].holdMarker.setMap(null);
    }
  }
}

var viewModel = {
  query: ko.observable(''),
};

viewModel.places = ko.dependentObservable(function() {
  var self = this;
  var search = self.query().toLowerCase();
  return ko.utils.arrayFilter(places, function(place) {
    if (place.name.toLowerCase().indexOf(search) >=0) {
      place.boolTest = true;
      return place.visible(true);
    }
    else {
      place.boolTest = false;
      setAllMap();
      return place.visible(false);
    }
  });
}, viewModel);

ko.applyBindings(viewModel);

$("#input").keyup(function() {
  setAllMap();
});

