var myPositon = new google.maps.LatLng(45.18209,5.70567);
var map


/* ----------------------------------------------------------------------------------------------------------------------
  	Initialisation de la map Google
   ---------------------------------------------------------------------------------------------------------------------- */
function initialize() {
	/* Options de la map : zoom sur l'endroit ou je vie */
    var mapOptions = {
      center: myPositon,
      zoom: 14
    };

    /* On définit la map en variable globale avec les options ci-dessus */
    map = new google.maps.Map(document.getElementById("map"),
        mapOptions);

    if(navigator.geolocation) { // Si le navigateur est compatible
		
    	var options = {
		  enableHighAccuracy: true,
		  timeout: 5000,
		  maximumAge: 0
		};

		navigator.geolocation.getCurrentPosition(function(position) {

			/* Définit un itinéraire */
			var direction = new google.maps.DirectionsRenderer({
			    map   : map, // emaplcement du tracé de l'itinéraire
			    panel : panel // emplacement du panel avec étapes du parcours
			});

			/* Position de la personne sur le site */
			var pos = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);

			/* Requête d'itinéraire */
			var request = {
	            origin      : pos, // adresse de départ
	            destination : "75 rue ampère Grenoble France", // adresse de destination
	            travelMode  : google.maps.DirectionsTravelMode.DRIVING // Type de transport
	        }

	        var directionsService = new google.maps.DirectionsService(); // Service de calcul d'itinéraire
	        directionsService.route(request, function(response, status){ // Envoie de la requête pour calculer le parcours
	            if(status == google.maps.DirectionsStatus.OK){
	                direction.setDirections(response); // Trace l'itinéraire sur la carte et les différentes étapes du parcours
	            }
	        });

		}, error, options);
	} else {
		/* Définit un marqueur sur le lieu ou j'habite si le navigateur n'est pas compatible avec la géolocalisation */
		var marker = new google.maps.Marker({
			position: myPositon,
			map: map,
			title: "Matthieu Hostache"
		});
	}
}

/* fonction qui ajoute un popup avec un message d'erreur ainsi qu'un marqueur sur la map 
	Cette fonction est appelée si le navigateur est commpatible mais qu'une erreur intervient
*/
function error(err) {
	console.warn('ERROR(' + err.code + '): ' + err.message);

  	/* Définit un marqueur sur le lieu ou j'habite */
	var marker = new google.maps.Marker({
		position: myPositon,
		map: map,
		title: "Matthieu Hostache"
	});

	/* Défninit le message d'erreur et affiche le popup */
	$( "#error-message" ).append("<p>"+err.message+"</p>");
	$( "#error-message" ).dialog({
      modal: true,
      buttons: {
        Ok: function() {
          $( this ).dialog( "close" );
        }
      }
    });
};




/* Ajoute un évenement au chargement du document */
google.maps.event.addDomListener(window, 'load', initialize);