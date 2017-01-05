/**
 * @author Marcus-Bizal https://github.com/marcbizal
 *
 * This loader loads LWO2 files exported from LW6.
 *
 * Support
 *  - 
 */

( function() {

		THREE.LWOLoader = function( manager ) {

			this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

		};

		THREE.LWOLoader.prototype = {

			constructor: THREE.LWO2Loader,

			load: function( url, onLoad, onProgress, onError ) {

				var scope = this;

				var loader = new THREE.FileLoader( scope.manager );
					loader.setResponseType( 'arraybuffer' );
					loader.load( url, function( buffer ) {

						onLoad( scope.parse( buffer ) );

					}, onProgress, onError );

			},

			parse: function( data ) {

				var view = new DataView(data)

				function fourCCToInt32( value ) {

					return value.charCodeAt( 0 ) +
						( value.charCodeAt( 1 ) << 8 ) +
						( value.charCodeAt( 2 ) << 16 ) +
						( value.charCodeAt( 3 ) << 24 );

				}

				function int32ToFourCC( value ) {

					return String.fromCharCode(
						value & 0xff,
						( value >> 8 ) & 0xff,
						( value >> 16 ) & 0xff,
						( value >> 24 ) & 0xff
					);

				}

				// HEADER SPEC //

				const LWO_FORM = 0x464F524D; // "FORM"
				const OFF_FORM = 0;

				const OFF_SIZE = 4;

				const LWO_MAGIC = 0x4C574F32; // "LWO2"
				const LWO_MAGIC_LRR = 0x4C574F42; // "LWOB" - this is unique to LRR files.
				const OFF_MAGIC = 8;

				if ( view.getInt32( OFF_FORM ) !== LWO_FORM ) {
					console.error( 'THREE.LWO2Loader.parse: Cannot find header.' );
					return;
				}

				var chunkSize = view.getInt32( OFF_SIZE );
				if (chunkSize + 8 !== view.byteLength) {
					console.warn( 'THREE.LWO2Loader.parse: Discrepency between size in header (' + chunkSize + ' bytes) and actual size (' + view.byteLength + ' bytes).')
				}

				if ( view.getInt32( OFF_MAGIC ) !== LWO_MAGIC_LRR && view.getInt32( OFF_MAGIC ) !== LWO_MAGIC ) {
					var magic = new TextDecoder().decode(new Uint8Array(data, OFF_MAGIC, 4));
					console.error( 'THREE.LWO2Loader.parse: Invalid magic ID (' + magic + ') in LWO header.' );
					return;
				}

				// CHUNK TYPES //

				const LWO_LAYR = 0x4C415952;
				const LWO_PNTS = 0x504E5453;
				const LWO_VMAP = 0x564D4150;
				const LWO_POLS = 0x504F4C53;
				const LWO_TAGS = 0x54414753;
				const LWO_PTAG = 0x50544147;
				const LWO_VMAD = 0x564D4144;
				const LWO_VMPA = 0x564D5041;
				const LWO_ENVL = 0x454E564C;
				const LWO_CLIP = 0x434C4950;
				const LWO_SURF = 0x53555246;
				const LWO_BBOX = 0x42424F58;
				const LWO_DESC = 0x44455343;
				const LWO_TEXT = 0x54455854;
				const LWO_ICON = 0x49434F4E;

				var cursor = 12;
				while (cursor < view.byteLength) {
					// Skip null byte padding
					if ( view.getUint8( cursor ) === 0 ) {
						cursor++;
					} else {
						var chunkType = view.getInt32( cursor );
						var chunkSize = view.getInt32( cursor + 4 ) + 8;

						switch(chunkType) {
							case LWO_PNTS:
								console.log('Found PNTS chunk at ' + cursor);
								break;
							default:
							console.log('Found ' + new TextDecoder().decode(new Uint8Array(data, cursor, 4)) + ' chunk at ' + cursor);
						}

						cursor += chunkSize;
					}

				}
			}
		};

} )();