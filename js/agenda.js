
function initialiserAgenda() {
	// Création du "tableau" des heures
	var agenda = $('#agenda') ;

	// Ligne de titres
	var ligne = document.createElement("div") ;
	ligne.className = "ligne" ;

	// Cellule en haut à gauche (vide)
	var cellule = document.createElement("div") ;
	cellule.className = "cellule nepasafficher" ;
	ligne.appendChild(cellule) ;
	for (var numDay = 1 ; numDay <= 31; numDay++) {
		cellule = document.createElement("div") ;
		cellule.className = "enteteColonne" ;
		cellule.id = "jour" + numDay ;
		cellule.innerHTML = numDay;
		cellule.addEventListener("mouseenter", coloriserColonne, false);
		cellule.addEventListener("mouseleave", decoloriserColonne, false);
		ligne.appendChild(cellule) ;
	}
	agenda.append(ligne) ;

	for (var numHour = 0; numHour<=23; numHour++) {
		ligne = document.createElement("div") ;
		ligne.className = "ligne" ;
		ligne.id = "ligne_heure" + numHour ;
		
		cellule = document.createElement("div") ;
		cellule.className = "enteteLigne" ;
		cellule.id = "heure" + numHour ;
		cellule.innerHTML = (numHour < 10 ? "0" : "") + numHour + ":00";
		cellule.addEventListener("mouseenter", coloriserLigne, false);
		cellule.addEventListener("mouseleave", decoloriserLigne, false);
		ligne.appendChild(cellule) ;
		
		for (var numDay = 1 ; numDay <= 31; numDay++) {
			cellule = document.createElement("div") ;
			cellule.className = "cellule " ;
			cellule.setAttribute("jour", numDay) ;
			cellule.setAttribute("heure", numHour) ;
			cellule.id = "heure" + numHour + "_jour" + numDay ;
			cellule.innerHTML = "&nbsp;";
			ligne.appendChild(cellule) ;
		}

		agenda.append(ligne) ;
	}
	
	// Variables globales
	idIntervenant = "matthieu.hostache@iut2.upmf-grenoble.fr" ;
	var dateCourante = new Date(); 
	year = dateCourante.getFullYear() ;
	month = dateCourante.getMonth() + 1 ;
	months = ["Non défini", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
	$('#dateAffichee').html(months[month] + ' ' + year);
	jour = 0 ;
	heure = 0 ;

	document.getElementById("wait").style.display = "none";
	document.getElementById("calendar").style.display = "block";

	/* Evenement au clique sur le bouton mois précédent */
	$( "#prevMonth" ).unbind('click').click(function() {
		if (month > 1) {
			month -= 1;
		} else {
			month = 12;
			year -= 1;
		}
		$('#dateAffichee').html(months[month] + ' ' + year);
		mettreAJourAgenda();
	});
	/* Evenement au clique sur le bouton mois suivant */
	$( "#nextMonth" ).unbind('click').click(function() {
		if (month < 12) {
			month = +month + 1;
		} else {
			month = 1;
			year = +year + 1;
		}
		$('#dateAffichee').html(months[month] + ' ' + year);
		mettreAJourAgenda();
	});
	
	// Remplir l'agenda
	mettreAJourAgenda() ;
}

function showRDV(date,hd,hf) {
	$("[name='date']").val(date);
	$("[name='startTime']").val(hd);
	$("[name='endTime']").val(hf);
}


// ----------------------------------------------------------------------------------------------------------------------
// Réinitialise l'agenda
// Appel au serveur pour récupérer les propriétés des jours du mois et les rendez-vous
// ----------------------------------------------------------------------------------------------------------------------
function mettreAJourAgenda() {

    var url = "http://sil2.ouvaton.org/agenda/ajax/getListCalendars.php?idIntervenant=" + idIntervenant + "&annee=" + year + "&mois=" + month;
    $.ajax({
		type: 'GET',
		url: url,
		dataType: 'jsonp',
		cache: false
	});
}

/* ----------------------------------------------------------------------------------------------------------------------
   Traite le json reçu du serveur, qui contient le nom de la personne, ses horaires de travail, ses rendez-vous...
   ---------------------------------------------------------------------------------------------------------------------- */
function traiterJsonAgenda(data) {
	if (data.erreur) {
		alert(data.message) ;
	} else {

		month = data.data.agenda[0].date.split('-')[1];
		year = data.data.agenda[0].date.split('-')[0];

		$('.cellule').removeAttr("activite");
		$('.enteteColonne').removeAttr("activite");
		
		for (var numDay = 0 ; numDay <= 30 ; numDay++) {
			var gd = numDay + 1;
			var minWorkedTime;
			var maxWorkedTime;

			$('#jour'+gd).show();

			if (data.data.agenda[numDay] == undefined) {
				/*-------------------------------------------------
					Retire les jours non présents dans le mois	
				-------------------------------------------------*/

				if ( $('#jour'+gd) != null )
					$('#jour'+gd).hide();

				var cellules = $('.cellule[jour="'+gd+'"]');
				cellules.hide();

				
			} else if (data.data.agenda[numDay].aprem_a == undefined) {
				/*-------------------------------------------------
					Colorise les jours fériés & jours non travaillés
				-------------------------------------------------*/

				var cellules = $('.cellule[jour="'+gd+'"]');
				$('.cellule').show();
				cellules.attr("activite", "repos");


			} else {
				/*-------------------------------------------------
				Colorise les heures en dehors des heures de travail 
				-------------------------------------------------*/

				var $cellule = $('.cellule');

				debut_matin = parseInt(data.data.agenda[numDay].matin_de.split(':')[0],10);
				fin_matin = parseInt(data.data.agenda[numDay].matin_a.split(':')[0],10);
				debut_aprem = parseInt(data.data.agenda[numDay].aprem_de.split(':')[0],10);
				fin_aprem = parseInt(data.data.agenda[numDay].aprem_a.split(':')[0],10);

				if (debut_matin < minWorkedTime || minWorkedTime == undefined)
					minWorkedTime = debut_matin;

				if (fin_aprem > maxWorkedTime || maxWorkedTime == undefined)
					maxWorkedTime = fin_aprem;

				$cellule.each(function( index ) {
					if(typeof $cellule.eq(index) == 'object') {
						var heure = parseInt($cellule.eq(index).attr("heure"),10);
						if(heure > fin_aprem  || (heure >= fin_matin && heure < debut_aprem) || heure < debut_matin) {
							$cellule.eq(index).attr("activite", "repos");
						}
					}
				});
			}
		}

		bindRDVDialog();

	}

	/*-------------------------------------------------
	Cache les premières et les dernières heures non travaillées
	-------------------------------------------------*/

	for (var hour = 0 ; hour <= 23 ; hour++) {
		if(hour<minWorkedTime || hour>maxWorkedTime) {
			$('#ligne_heure'+hour).hide();
		} else {
			$('#ligne_heure'+hour).show();
		}
	}

	/*-------------------------------------------------
					Affichage des RDV 
	-------------------------------------------------*/

	for (var rdv in data.data.rendezvous) {

		date = +data.data.rendezvous[rdv].date.split('-')[2];
		startTime = +data.data.rendezvous[rdv].startTime.split(':')[0];
		endTime = +data.data.rendezvous[rdv].endTime.split(':')[0];

		for(var time=startTime; time <= endTime; time++) {
			elem = $('#heure'+time+'_jour'+date);
			if(elem.attr("activite") != "repos") {
				elem.attr("activite", "travail");
				elem.attr("data-rdv", rdv);
				elem.unbind( "click" );
			}
		}
	}

	/*-------------------------------------------------
		Colorise la colonne du jour courant 
	-------------------------------------------------*/

	var toDay = new Date();
	var actualMonth = +toDay.getMonth() + 1;

	$('.enteteColonne').removeAttr("toDay");
	$('.cellule').removeAttr("toDay", "");
	if (month == actualMonth && year == toDay.getFullYear()) {
		var lignes = $('.cellule[jour="'+toDay.getDate()+'"]');
		lignes.attr("toDay", "");
		
		$('.enteteColonne').eq(toDay.getDate()-1).attr("toDay", "");
	}


	/*-------------------------------------------------
		Afficher les détails d'un RDV
	-------------------------------------------------*/

	$('.cellule[activite="travail"]').click(function(){
		var idrdv = $(this).data("rdv");
		var rdv = data.data.rendezvous[idrdv];
		var finRdv = +rdv.endTime.split(':')[0] + 1;
		$( "#rdv-details" ).attr("title", rdv.date + " de " + rdv.startTime.split(':')[0] + "h à " + finRdv +"h");
		var deleteLink = "<a class='delEvent'><b>Supprimer RDV</b></a>";

		$( "#rdv-details" ).html("Nom : " + rdv.identity +"<br/>Objet : " + rdv.object +"<br/>Tel : " + rdv.phone +"<br/>Mail : " + rdv.mail +"<br/>"+ deleteLink);
		
		/* Evenement déclencher pour supprimer un RDV */
		$('.delEvent').click(function(){
			var idMeeting = rdv.idMeeting;

			var url = "http://sil2.ouvaton.org/agenda/ajax/deleteEvent.php?idIntervenant=" + idIntervenant + "&idMeeting=" + idMeeting;
		    $.ajax({
				type: 'GET',
				url: url,
				dataType: 'jsonp',
				callback: supprimeRDV(rdv),
				cache: false
			});
		});

		$( "#rdv-details" ).dialog({
			width: 350,
	    	height: 200,
	    	modal: true
	    });
	});


}


/* ----------------------------------------------------------------------------------------------------------------------
   Colorise toutes les cellules d'une colonne (rollover sur entête de colonne)
   ---------------------------------------------------------------------------------------------------------------------- */
function coloriserColonne(event) {
	var day = +this.id.split('jour')[1];
	var lignes = $('[jour="'+day+'"]');
	
	lignes.attr("color", "colorcolonne");
	$('.enteteColonne[id=jour'+day+']').attr("color", "colorcolonne");
}

/* ----------------------------------------------------------------------------------------------------------------------
   décolorise toutes les cellules d'une colonne (rollover sur entête de colonne)
   ---------------------------------------------------------------------------------------------------------------------- */
function decoloriserColonne(event) {
	var day = +this.id.split('jour')[1];
	var lignes = $('[jour="'+day+'"]');
	
	lignes.removeAttr("color");
	$('.enteteColonne[id=jour'+day+']').removeAttr("color");
}

/* ----------------------------------------------------------------------------------------------------------------------
   Colorise toutes les cellules d'une ligne (rollover sur entête de ligne)
   ---------------------------------------------------------------------------------------------------------------------- */
function coloriserLigne(event) {
	var hour = event.currentTarget.id;
	$('#ligne_'+hour).attr("color", "colorligne");
}

/* ----------------------------------------------------------------------------------------------------------------------
   décolorise toutes les cellules d'une ligne (rollover sur entête de ligne)
   ---------------------------------------------------------------------------------------------------------------------- */
function decoloriserLigne(event) {
	var hour = event.currentTarget.id;
	$('#ligne_'+hour).removeAttr("color")
}

/* ----------------------------------------------------------------------------------------------------------------------
   Affichage d'un rendez-vous
   ---------------------------------------------------------------------------------------------------------------------- */
function afficherNouveauRDV(data) {
	var rdv = data.newEvent;
	date = +rdv.date.split('-')[2];
	startTime = +rdv.startTime.split(':')[0];
	endTime = +rdv.endTime.split(':')[0];

	for(var time=startTime; time <= endTime; time++) {
		var elem = $('#heure'+time+'_jour'+date);
		elem.attr("activite","travail");
		elem.unbind("click");
		elem.click(function(){
			var finRdv = +rdv.endTime.split(':')[0] + 1;
			$( "#rdv-details" ).attr("title", rdv.date + " de " + rdv.startTime.split(':')[0] + "h à " + finRdv +"h");
			var deleteLink = "<a  class='delEvent'><b>Supprimer RDV</b></a>";

			$( "#rdv-details" ).html("Nom : " + rdv.identity +"<br/>Objet : " + rdv.object +"<br/>Tel : " + rdv.phone +"<br/>Mail : " + rdv.mail +"<br/>"+ deleteLink);
			
			/* Evenement déclencher pour supprimer un RDV */
			$('.delEvent').click(function(){
				var idMeeting = rdv.idMeeting;

				var url = "http://sil2.ouvaton.org/agenda/ajax/deleteEvent.php?idIntervenant=" + idIntervenant + "&idMeeting=" + idMeeting;
			    $.ajax({
					type: 'GET',
					url: url,
					dataType: 'jsonp',
					callback: supprimeRDV(rdv),
					cache: false
				});
			});

			$( "#rdv-details" ).dialog({
				width: 350,
		    	height: 200,
		    	modal: true
		    });
		});

	}

	$( "#dialog-form" ).dialog('close');
}

/* ----------------------------------------------------------------------------------------------------------------------
   Supprime un rendez-vous
   ---------------------------------------------------------------------------------------------------------------------- */
function supprimeRDV(rdv) {
	date = +rdv.date.split('-')[2];
	startTime = +rdv.startTime.split(':')[0];
	endTime = +rdv.endTime.split(':')[0];

	for(var time=startTime; time <= endTime; time++) {
		var elem = $('#heure'+time+'_jour'+date);
		elem.removeAttr("activite");
		elem.removeAttr("data-rdv");
		elem.unbind("click");
		bindRDVDialog();
	}

	$( "#rdv-details" ).dialog('close');
}

/* ----------------------------------------------------------------------------------------------------------------------
   Ajoute une gestion de l'évenement pour ouvrir le formulaire d'ajout de RDV
   ---------------------------------------------------------------------------------------------------------------------- */
function bindRDVDialog() {

	$(".cellule:not([activite='repos'], [activite='travail'])").click(function(){
		var date = year + '-' + month +'-' + $(this).attr('jour');
		var heure = $(this).attr('heure');
		var hd = heure + ':00';
		var hf = heure + ':59';
	    showRDV(date,hd,hf);
	    $( "#dialog-form" ).dialog( "open" );
	});
}
