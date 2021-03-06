/**
 * @author Kai Salmen / www.kaisalmen.de
 */

'use strict';

if ( THREE.examples === undefined ) {
	THREE.examples = {};
}
if ( THREE.examples.apps === undefined ) {
	THREE.examples.apps = {};
}

THREE.examples.apps.ZipTools = (function () {

	function ZipTools( path ) {
		this.zip = new JSZip();

		this.xhrLoader = new THREE.XHRLoader();
		this.xhrLoader.setPath( path );
		this.xhrLoader.setResponseType( 'arraybuffer' );

		this.zipContent = null;
	}

	ZipTools.prototype.load = function ( filename, callbacks ) {
		var scope = this;
		var refPercentComplete = 0;
		var percentComplete = 0;

		var onSuccess = function ( zipDataFromXHR ) {
			scope.zip.loadAsync( zipDataFromXHR )
			.then( function ( zip ) {

				scope.zipContent = zip;
				callbacks.success();

			} );
		};

		var onProgress = function ( event ) {
			if ( event.lengthComputable ) {

				percentComplete = Math.round( event.loaded / event.total * 100 );

				if ( percentComplete > refPercentComplete ) {

					refPercentComplete = percentComplete;
					var output = 'Download of "' + filename + '": ' + percentComplete + '%';
					console.log( output );
					if ( callbacks.progress !== null && callbacks.progress !== undefined ) {

						callbacks.progress( output );

					}

				}
			}
		};

		var onError = function ( event ) {
			var output = 'Error of type "' + event.type + '" occurred when trying to load: ' + filename;
			console.error( output );
			callbacks.error( output );
		};

		console.log( 'Starting download: ' + filename );
		this.xhrLoader.load( filename, onSuccess, onProgress, onError );
	};

	ZipTools.prototype.unpackAsUint8Array = function ( filename, callback ) {

		if ( JSZip.support.uint8array ) {

			this.zipContent.file( filename ).async( 'uint8array' )
			.then( function ( dataAsUint8Array ) {

				callback( dataAsUint8Array );

			} );

		} else {

			this.zipContent.file( filename ).async( 'base64' )
			.then( function ( data64 ) {

				callback( new TextEncoder( 'utf-8' ).encode( data64 ) );

			} );

		}
	};

	ZipTools.prototype.unpackAsString = function ( filename, callback ) {
		this.zipContent.file( filename ).async( 'string' )
		.then( function ( dataAsString ) {

			callback( dataAsString );

		} );
	};

	return ZipTools;
})();