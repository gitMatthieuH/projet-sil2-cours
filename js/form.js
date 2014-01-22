$(function() {

	/*-------------------------------------------------
		Ajoute un evenement au clique sur jour dispo
	-------------------------------------------------*/

	$( "#dialog-form" ).dialog({
		autoOpen: false,
		height: 375,
		width: 350,
		modal: true,
		buttons: {
		"Ajouter un RDV": function() {

			if ($('#formulaire')[0].checkValidity()) {
				var postData = $('#formulaire').serialize();
			    var formURL = "http://sil2.ouvaton.org/agenda/ajax/insertNewEvent.php";

			    $.ajax(
			    {
			        url : formURL,
			        type: "POST",
			        dataType : "jsonp",
			        data : postData,
			    });

                $(this).dialog('close');
            }
            else {
                // Si le formulaire n'est pas valide, on soumet le formulaire en js pour voir la validation html5
                $('#dialog-form input[type=submit]').click();
            };

			
		    
		},
		Annuler: function() {
			$( this ).dialog( "close" );
		}
		},
		close: function() {
		}
	});


	$( "#datepicker" ).datepicker({ dateFormat: 'yy-mm-dd' });


});