var formBuilder = {
	value: '',
  makeField: function(field_obj, field_value) {
	  //console.log(field_obj,field_value)
	  formBuilder.value = '';
	  
	  if(field_value){
		formBuilder.value = field_value;  
	  }
	  var fo = field_obj.meta_value;
	  if(!fo.label)
    field_obj.meta_value = JSON.parse(fo);
    switch(field_obj.meta_value.field_type){
      case 'text':
        return formBuilder.textField(field_obj);
      break;
      case 'textarea':
        return formBuilder.textAreaField(field_obj);
      break;
      case 'checkbox':
        return formBuilder.checkboxField(field_obj);
      break;
      case 'checkbox_group':
        return formBuilder.checkboxGroupField(field_obj);
      break;
      case 'radio_buttons':
        return formBuilder.radioButtonField(field_obj);
      break;
      case 'dropdown':
        return formBuilder.dropdownField(field_obj);
      break;
    }
  },
  textField: function(field) {
    var classOutput = "";
    if (field.meta_value.required == 'required') {
      classOutput = 'validate[required]';
    }
		return '<label class="item item-input item-stacked-label"><span class="input-label">'+field.meta_value.label+'</span><input type="text" class="' + classOutput + '" name="form_values[field_'+field.meta_id+']" data-field="true" id="field_'+field.meta_id+'" value="'+formBuilder.value+'" placeholder="'+field.meta_value.placeholder+'"></label>';
  },
  textAreaField: function(field) {
    var classOutput = "";
    if (field.meta_value.required == 'required') {
      classOutput = 'validate[required]';
    }    
	var fieldClass = "";
	
	if(field.meta_value.label === 'Signature') {
		var $img = '';
		if(formBuilder.value !== ''){
			$img = '<div class="signatureImage col col-100" style="text-align:center;"><img width="400" src="'+formBuilder.value+'" /></div>';
		}else{
			fieldClass = ' hidden';
		}
		// always hide the input
		classOutput+= ' hidden';
		
		return '<label class="item item-input item-stacked-label'+fieldClass+'"><span class="input-label">'+field.meta_value.label+'</span>'+$img+'<input type="text" class="' + classOutput + '" name="form_values[field_'+field.meta_id+']" data-field="true" id="field_'+field.meta_id+'" value="'+formBuilder.value+'" placeholder="'+field.meta_value.placeholder+'"></label>';

	}
    return '<label class="item item-input item-stacked-label'+fieldClass+'">'+field.meta_value.label+'<textarea class="' + classOutput + '" name="form_values[field_'+field.meta_id+']" id="field_'+field.meta_id+'" data-field="true"  placeholder="'+field.meta_value.placeholder+'" ng-model="checkinData.field_'+field.meta_id+'">'+formBuilder.value+'</textarea></label>';
  },
  checkboxField: function(field) {
    var classOutput = "";
    if (field.meta_value.required == 'required') {
      classOutput = 'validate[required]';
    }
    return '<ul class="list"><li class="item item-toggle">'+field.meta_value.label+'<label for="field_'+field.meta_id+'" class="toggle"><input name="form_values[field_'+field.meta_id+']" class="' + classOutput + '" type="checkbox" data-field="true"  value="'+field.meta_value.value+'" id="field_'+field.meta_id+'" ng-model="checkinData.field_'+field.meta_id+'"><div class="track"><div class="handle"></div></div></label></li></ul>';
  },
  checkboxGroupField: function(field) {
	var output;
	output = '<div class="checkbox-title">'+field.meta_value.label+'</div><ul class="list">';
	var i = 0;
	var value = formBuilder.value;
	for(var key in field.meta_value.options){
		 var option = field.meta_value.options[key];
		 //console.log(value);
		 var checked = '';
		 if( option.value == value ) checked = 'checked="checked"';
		output += '<li class="item item-toggle">'+option.label+'<label for="field_'+field.meta_id+'_'+i+'" class="toggle"><input name="form_values[field_'+field.meta_id+'['+i+']]" type="checkbox" '+checked+' value="'+option.value+'" data-field="true"  id="field_'+field.meta_id+'_'+i+'" ng-model="checkinData.field_'+field.meta_id+'_'+i+'"><div class="track"><div class="handle"></div></div></label></li>';
		i++;
	}
	output+= '</ul></div>';
	
    return output;
  },
  radioButtonField: function(field) {
	var output;
	var classOutput = "";
	var value = formBuilder.value;
	if (field.meta_value.required == 'required') {
	  classOutput = 'validate[required]';
	}	
	output = '<div class="form-field checkbox-group"><div class="checkbox-title">'+field.meta_value.label+'</div>';
	for(var key in field.meta_value.options){
		 var option = field.meta_value.options[key];
		 var checked = '';
		 if( option.value == value ) checked = 'checked="checked"';
		output += '<label for="field_'+field.meta_id+'[]">'+option.label+'<input name="form_values[field_'+field.meta_id+'[]]" class="' + classOutput + '" '+checked+' type="radio" data-field="true"  value="'+option.value+'" id="field_'+field.meta_id+'_'+i+'" ng-model="checkinData.field_'+field.meta_id+'_'+i+'"></label>';
	}
	output+= '</div>';
	
    return output;
  },
  dropdownField: function(field) {
    var classOutput = "";
	var value = formBuilder.value;
    if (field.meta_value.required == 'required') {
      classOutput = 'validate[required]';
    }	
    var out = '<div class="form-field"><label class="item item-input item-select" for="field_'+field.meta_id+'">'+field.meta_value.label;
    out += '<select data-field="true"  class="' + classOutput + '"  ng-model="checkinData.field_'+field.meta_id+'" name="form_values[field_'+field.meta_id+']" id="field_'+field.meta_id+'">';
    for(var key in field.meta_value.options) {
        var option = field.meta_value.options[key];
		 var selected = '';
		 if( option.value == value ) selected = 'selected="selected"';
        out += '<option value="'+option.value+'" '+selected+'>'+option.label+'</option>';
    }
    out += '</select></label></div>';
    return out;
  }
};