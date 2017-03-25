/**
 * Created by jeremyzunino on 25/03/2017.
 */

var FieldManager = function() {
    this.types = new Object();

    this.addType( "upper", {
        format: function( val ) { return val.toUpperCase(); }
    } );

    this.addType( "lower", {
        format: function( val ) { return val.toLowerCase(); }
    } );

    this.addType( "ucfirst", {
        format: function( val ) { return val.substr(0,1).toUpperCase() + val.substr(1).toLowerCase(); }
    } );
};


FieldManager.prototype.findElements = function( type ) {
    type = type.toLowerCase().trim();
    return document.querySelectorAll('[data-field-'+ type +']');
};

FieldManager.prototype.run = function() {
    var self = this;
    // Foreach defined type
    for( var key in this.types ) {
        var type = this.types[key];
        // Get elements with this type
        var elements = this.findElements( key );
        // For each element of this type
        for( var element_key in elements ) {
            // Get element
            var element = elements[element_key];
            if( element.tagName && element.tagName.toLowerCase() == "input" ) { // if element is an input
                // Apply now
                element.value = type.getFormat( element.value );
                // Event application
                ( function(_type) {
                    element.addEventListener("input", function() { this.value = _type.getFormat( this.value ) }, false);
                } )(type);
            }
        }
    }
};

FieldManager.prototype.addType = function( typeName, actions ) {
    this.types[ typeName ] = new FieldManagerType( this, typeName, actions );
};








var FieldManagerType = function( manager, typeName, actions ) {
    this.manager = manager;
    this.type = typeName;
    this.format = actions.format != null ? actions.format : function(val) { return val };
};

FieldManagerType.prototype.getFormat = function( val ) {
    return this.format( val );
};