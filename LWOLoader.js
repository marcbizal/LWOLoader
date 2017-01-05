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

				const LWO_PNTS = 0x504E5453;
				const LWO_SFRS = 0x53524653;
				const LWO_POLS = 0x504F4C53;
				const LWO_CRVS = 0x43525653;
				const LWO_PCHS = 0x50434853;
				const LWO_SURF = 0x53555246;

				const HEADER_SIZE = 8;

				var geometry = new THREE.BufferGeometry();
				var vertices = null;

				var cursor = 12;
				while (cursor < view.byteLength) {
					// Skip null byte padding
					if ( view.getUint8( cursor ) === 0 ) {
						cursor++;
					} else {
						var chunkType = view.getInt32( cursor );
						var chunkSize = view.getInt32( cursor + 4 );

						cursor += HEADER_SIZE;

						switch(chunkType) {
							case LWO_PNTS:
								if ( chunkSize % 12 !== 0 ) {
									console.error( 'THREE.LWO2Loader.parse: F12 does not evenly divide into chunk size ('+chunkSize+'). Possible corruption.' );
									return;
								}

								var numPoints = chunkSize / 4;
								var points = new Float32Array( numPoints );

								for ( var i = 0; i < numPoints; i++ ) {
									points[i] = view.getFloat32( cursor + (i * 4) );
								}

								var geometry = new THREE.BufferGeometry();
								geometry.addAttribute( 'position', new THREE.BufferAttribute( points, 3 ) );

								console.dir(geometry);
								console.dir(points);

								break;
							case LWO_SFRS:
								var textChunk = new TextDecoder().decode(new Uint8Array(data, cursor, chunkSize));
								var surfaceNames = textChunk.split('\0').filter(function(s) { return s != ''; });

								console.log(surfaceNames);

								break;
							case LWO_POLS:
								var offset = 0;
								while (offset < chunkSize) {
									var numVert = view.getInt16( cursor + offset );
									var indices = new Int16Array(numVert);

									for (var i = 0; i <= numVert; i++) {
										indices[i] = view.getInt16( cursor + offset + (i*2) );
									}			

									var triFanIndices = [];
									for (var i = 0; i < numVert-2; i++) {
										triFanIndices.push(indices[0]);
										triFanIndices.push(indices[i+1]);
										triFanIndices.push(indices[i+2]);
									}

									console.log(triFanIndices);
									console.log(indices);

									offset += 4 + (numVert * 2);		
								}
								break;
							case LWO_SURF:

								/**************************/
								/* SURF DEFINITIONS START */
								/**************************/

								const SURF_COLR = 0x434F4C52;
								const SURF_FLAG = 0x464C4147;

								// Base Shading Values (Fixed Point)
								const SURF_LUMI = 0x4C554D49;
								const SURF_DIFF = 0x44494646;
								const SURF_SPEC = 0x53504543;
								const SURF_REFL = 0x5245464C;
								const SURF_TRAN = 0x5452414E;

								// Base Shading Values (Floating Point)
								const SURF_VLUM = 0x564C554D;
								const SURF_VDIF = 0x56444946;
								const SURF_VSPC = 0x56535043;
								const SURF_VRFL = 0x5646524C;
								const SURF_VTRN = 0x5654524E;

								const SURF_GLOS = 0x474C4F53;
								const SURF_RFLT = 0x52464C54;
								const SURF_RIMG = 0x52494D47;
								const SURF_RIND = 0x52494E44;
								const SURF_EDGE = 0x45444745;
								const SURF_SMAN = 0x534D414E;

								/**************************/
								/*  SURF DEFINITIONS END  */
								/**************************/

								var offset = 0;
								while ( view.getInt16( cursor + offset ) !== 0 ) offset++;
								var name = new TextDecoder().decode(new Uint8Array(data, cursor, offset));

								while (offset < chunkSize) {

								}

								console.log('Surface name: ' + name);


								break;
							default:
							console.warn('Found unrecognised chunk type ' + new TextDecoder().decode(new Uint8Array(data, cursor-8, 4)) + ' at ' + cursor);
						}

						cursor += chunkSize;
					}

				}
			}
		};

} )();