function initialiserStats() {
	// Variables globales
	idIntervenant = "matthieu.hostache@iut2.upmf-grenoble.fr" ;
	var dateCourante = new Date();  // Récupération de la date courante
	annee = dateCourante.getFullYear() ;
	mois = dateCourante.getMonth() + 1 ;

	mettreAJourStats();
}

/* ----------------------------------------------------------------------------------------------------------------------
  	Appel au serveur pour récupérer les stats
   ---------------------------------------------------------------------------------------------------------------------- */
function mettreAJourStats() {
	var url = "http://sil2.ouvaton.org/agenda/ajax/getStatNumbers.php?idIntervenant=" + idIntervenant;
    $.ajax({
		type: 'GET',
		url: url,
		dataType: 'jsonp',
	});
}

/* ----------------------------------------------------------------------------------------------------------------------
   Traite le json reçu du serveur, qui contient les stats
   ---------------------------------------------------------------------------------------------------------------------- */
function afficherGraphique(data){

	displayStats(data,annee);

	var minYear = +data["min.year"];
	var maxYear = +data["max.year"];
	
	for (var year = minYear; year <= maxYear ; year++) {
		$("#selectedYear").append("<option value='"+year+"'>"+year+"</option>")
	}

	$("option[value='" + annee + "']").prop("selected", true);

	$("#selectedYear").change(function() {
		var selectedYear = +$( "#selectedYear option:selected" ).text();
		displayStats(data,selectedYear);
	});

}


/* ----------------------------------------------------------------------------------------------------------------------
   Affiche les stats à l'aide du framework KineticJS
   ---------------------------------------------------------------------------------------------------------------------- */
function displayStats(data, year) {

	/* Défini la longueur entre le haut du canvas et la bas des barres */
	var barDistance = data["max.value"] * 10 + 50;

	/* Création du conteneur */
	var graph = new Kinetic.Stage({
		container: "graph",
		width: 940,
		height: barDistance + 50
	});

	/* On instancit les claques */
	var calque = new Kinetic.Layer();
	var tooltipLayer = new Kinetic.Layer();

	/* Couleurs que l'on fera varier à l'aide d'un modulo */
 	var colors = ["#4A4D50", "#d04526"];
 	/* Différents mois de l'année */
 	var months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
 	
 	/* Liste des mois de l'année ayant des stats */
 	var monthsWithStats = $.map( data.numbers, function( value, index ) {
 		if (value.year == year)
 			return value.month;
 	});

	/* Boucle sur chaque mois */
	$.each( months, function( key, value ) {

		var barW = 16;
		var textW = 78;

		/* On vérifie si le mois en cours à des stats en récupérant son index */
		var index = $.inArray((key+1).toString(),monthsWithStats);
		
		/* Si cet index vaut -1 il n'existe pas de stat sinon il en existe une */
		if(index != -1) {
			var elem = data.numbers[index];
			var nbRDV = elem.number * 10;
		} else {
			var nbRDV = 1; // On met le nb de RDV à 1 afin de voir un léger trait
		}

		/* Texte du nomre de rendez-vous */
		var tooltip = new Kinetic.Text({
            text: "",
            fontFamily: "Open Sans",
            fontSize: 12,
            textFill: "#4A4D50",
            alpha: 0.75,
            visible: false,
            align: "center",
            width: barW,
        });
        tooltipLayer.add(tooltip);

		/* Ajout de la barre */
		var bar = new Kinetic.Rect({
			x: (textW*key)+(textW-barW)/2, // On place la barre au centre du texte
			y: barDistance,
			width: barW,
			height: -nbRDV,
			fill: colors[key%2]
		});
		/* Evenement au survol de la barre */
		bar.on("mouseover", function() {
			tooltip.setPosition( (textW*key)+(textW-barW)/2 , barDistance - (nbRDV+18) );
			tooltip.setText((index != -1) ? elem.number : 0);
			tooltip.setFill(colors[key%2]);
            tooltip.show();
            tooltipLayer.draw();
		});
		/* Evenement au survol en dehors de la barre */
		bar.on("mouseout", function(){
            tooltip.hide();
            tooltipLayer.draw();
        });
		calque.add(bar);	

		/* Ajout du texte */
		var text = new Kinetic.Text({
			x: textW*key,
			y: barDistance + 5,
			text: value,
			fontSize: 15,
			fontFamily: "Open Sans",
			fill: colors[key%2],
			align: "center",
			width: textW, // On centre le texte sur la largeur de son élément Kinetic.Text
		});
		/* Evenement au survol du texte */
		text.on("mouseover", function() {
			tooltip.setPosition((textW*key)+(textW-barW)/2, barDistance - (nbRDV+18) );
			tooltip.setText((index != -1) ? elem.number : 0);
			tooltip.setFill(colors[key%2]);
            tooltip.show();
            tooltipLayer.draw();
		});
		/* Evenement au survol en dehors du texte */
		text.on("mouseout", function(){
            tooltip.hide();
            tooltipLayer.draw();
        });
		calque.add(text);


	});

	
	/* Ajout du calque */
	graph.add(calque);
	graph.add(tooltipLayer);
}

