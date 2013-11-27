(function($){
        
	acf.validation = {
		
		active	: 1,
		ignore	: 0,
		
		$trigger : null,
		
		init : function(){
			
			// bail early if disabled
			if( this.active == 0 )
			{
				return;
			}
			
			
			// add events
			this.add_events();
		},
		
		add_error : function( $field, message ){
			
			// add class
			$field.addClass('error');
			
			
			// add message
			if( message !== undefined )
			{
				$field.children('.acf-input').children('.acf-validation-error').remove();
				$field.children('.acf-input').prepend('<div class="acf-validation-error"><p>' + message + '</p></div>');
			}
			
			
			// hook for 3rd party customization
			acf.trigger('add_field_error', [ $field ]);
		},
		
		remove_error : function( $field ){
			
			// remove class
			$field.removeClass('error');
			
			
			// remove message
			setTimeout(function(){
				
				acf.helpers.remove_el( $field.children('.acf-input').children('.acf-validation-error') );
				
			}, 250);
			
			
			// hook for 3rd party customization
			acf.trigger('remove_field_error', [ $field ]);
		},
		
		fetch : function( $form ){
			
			// reference
			var _this = this;
			
			
			// vars
			var data = acf.helpers.serialize_form( $form );
				
			
			// append AJAX action		
			data.action = 'acf/validate_save_post';
			
				
			// ajax
			$.ajax({
				url			: acf.get('ajaxurl'),
				data		: data,
				type		: 'post',
				dataType	: 'json',
				success		: function( json ){
					
					_this.complete( $form, json );
					
				}
			});
			
		},
		
		complete : function( $form, json ){
			
			// reference
			var _this = this;
			
			
			// validate json
			if( !json || json.result == 1)
			{
				// remove hidden postboxes (this will stop them from being posted to save)
				$form.find('.acf-postbox:hidden').remove();
					
					
				// bypass JS and submit form
				this.active = 0;
				
				
				// submit form again
				if( this.$trigger )
				{
					this.$trigger.click();
				}
				else
				{
					$form.submit();
				}
				
				
				// end function
				return;
			}
			
			
			// hide ajax stuff on submit button
			if( $('#submitdiv').exists() )
			{
				$('#save-post').removeClass('button-disabled');
				$('#publish').removeClass('button-primary-disabled');
				$('#ajax-loading').removeAttr('style');
				$('#publishing-action .spinner').hide();
			}
			
			
			// show error message
			$form.children('.acf-validation-error').remove();
			$form.prepend('<div class="acf-validation-error"><p>' + json.message + '</p></div>');
			
			
			// show field error messages
			$.each( json.errors, function( k, v ){
				
				var $field = $('.acf-field[data-key="' + k + '"]');
				
				_this.add_error( $field, v );
				
			});
						
			
		},
		
		add_events : function(){
			
			var _this = this;
			
			
			// focus
			$(document).on('focus click', '.acf-field.required input, .acf-field.required textarea, .acf-field.required select', function( e ){
				
				_this.remove_error( $(this).closest('.acf-field') );
				
			});
			
			
			// click save
			$(document).on('click', '#save-post', function(){
				
				_this.ignore = 1;
				_this.$trigger = $(this);
				
			});
			
			
			// click publish
			$(document).on('click', '#publish', function(){
				
				_this.$trigger = $(this);
				
			});
			
			
			// submit
			$(document).on('submit', 'form', function( e ){
				
				// bail early if this form does not contain ACF data
				if( ! $(this).find('#acf-form-data').exists() )
				{
					return true;
				}
				
				
				// ignore this submit?
				if( _this.ignore == 1 )
				{
					_this.ignore = 0;
					return true;
				}
				
				
				// bail early if disabled
				if( _this.active == 0 )
				{
					return true;
				}
				
				
				// prevent default
				e.preventDefault();
				
				
				// run validation
				_this.fetch( $(this) );
								
			});
			
		}
		
	};
	
	
	acf.on('ready', function(){
		
		acf.validation.init();
		
	});
	

})(jQuery);