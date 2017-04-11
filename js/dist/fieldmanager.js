/**
 * Created by jeremyzunino on 25/03/2017.
 */

var FieldManager = function( options ) {
    var self = this;
    this.types = new Object();

    // OPTIONS
    if( options != null ) {
        if( typeof options.validTest == "function" ) this.onValidTest = options.validTest;
    }

    // PREDEFINEDS INFORMATIONS
    this.addType( "upper", {
        format: function( val ) { return val.toUpperCase(); }
    } );

    this.addType( "lower", {
        format: function( val ) { return val.toLowerCase(); }
    } );

    this.addType( "ucfirst", {
        format: function( val ) { return val.substr(0,1).toUpperCase() + val.substr(1).toLowerCase(); }
    } );

    this.addType( "required", {
        test: function( val ) { return val.trim().length > 0; }
    } );

    this.addType( "phone", {
        format: function( val ) {
            if( val.trim().charAt(0) == "+" ) {
                var value = self.max( self.onlyNumber( self.spaceless(val) ), 11 );
                return "+" + self.autoSeparator( value, [2,4,6,8] );
            } else {
                var value = self.max( self.onlyNumber( self.spaceless(val) ), 10 );
                return self.autoSeparator( value, [1,3,5,7] );
            }
        },
        test: function( val ) {
            if( val.trim().charAt(0) == "+" ) return self.spaceless(val).length == 12;
            else                              return self.spaceless(val).length == 10;
        }
    } );
};


FieldManager.prototype.spaceless = function( val ) {
    return val.replace(/ /g, '');
};

FieldManager.prototype.autoSeparator = function( content, lengths, separator ) {
    if( separator == null ) separator = " ";
    var result = "";
    content = content.trim().replace(/ /g, '');
    for( var i = 0; i < content.length; i++ ) {
        result += content.charAt(i);
        if( i < content.length - 1 && lengths.indexOf(i) > -1 ) result += separator;
    }
    return result;
};

FieldManager.prototype.max = function( value, max ) {
    return value.substr(0, max);
};

FieldManager.prototype.onlyNumber = function( value ) {
    var result = "";
    for( var i in value ) if( !isNaN(value.charAt(i)) ) result += value.charAt(i).toString();
    return result;
    // return value;
};


FieldManager.prototype.onValidTest = function( valid, input ) {
    var self = this;
    if( valid ) {
        while( input.className.indexOf("alert-danger") > 0 ) input.className = input.className.replace("alert-danger", "");
        while( input.className.indexOf("alert-warning") > 0 ) input.className = input.className.replace("alert-warning", "");
    }
    else {
        input.className = input.className + ( self.isRequired(input) ? " alert-danger" : " alert-warning" );
    }
};

FieldManager.prototype.        isRequired = function( input ) {
    return input.hasAttribute('required');
};


FieldManager.prototype.addType = function( typeName, actions ) {
    this.types[ typeName ] = new FieldManagerType( this, typeName, actions );
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
                type.getFormat( element ).getTest( element );
                // Event application
                ( function(_type) {
                    element.addEventListener("input", function() {
                        _type.getFormat( this ) // Format
                            .getTest( this ); // Test
                    }, false);
                } )(type);
            }
        }
    }
};








var FieldManagerType = function( manager, typeName, actions ) {
    this.manager = manager;
    this.type = typeName;
    this.format = actions.format != null ? actions.format : function(val) { return val };
    this.test   = actions.test   != null ? actions.test   : function(val) { return true };
};

FieldManagerType.prototype.getFormat = function( input ) {
    input.value = this.format( input.value );
    return this;
};

FieldManagerType.prototype.getTest = function( input ) {
    this.manager.onValidTest( this.test(input.value), input );
    return this;
};