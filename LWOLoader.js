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
			this.materials = [];
			this.geometry = new THREE.BufferGeometry();

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

			parse: function( buffer ) {
				var view = new DataView(buffer);

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

				// TYPE SIZES IN BYTES
				// NOTE: These are only for the sake of code clarity
				const ID4_SIZE 		= 4;
				const I1_SIZE 		= 1;
				const I2_SIZE 		= 2;
				const F4_SIZE 		= 4;

				const COL4_SIZE 	= 4;
				const VEC12_SIZE 	= 12;
				const IP2_SIZE 		= 2;
				const FP4_SIZE 		= 4;
				const DEG4_SIZE 	= 4;


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
					var magic = new TextDecoder().decode(new Uint8Array(buffer, OFF_MAGIC, 4));
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

				const CHUNK_HEADER_SIZE = 8;
				const SUBCHUNK_HEADER_SIZE = 6;

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

						cursor += CHUNK_HEADER_SIZE;

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

								this.geometry.addAttribute( 'position', new THREE.BufferAttribute( points, 3 ) );

								//var _geometry = new THREE.Geometry().fromBufferGeometry( this.geometry );
								//console.log(geometry);
								this.geometry.clearGroups();
								console.log(points);

								break;
							case LWO_SFRS:
								var textChunk = new TextDecoder().decode(new Uint8Array(buffer, cursor, chunkSize));
								var surfaceNames = textChunk.split('\0').filter(function(s) { return s != ''; });

								for (i = 0; i < surfaceNames.length; i++) { 
									var new_material = new THREE.MeshBasicMaterial();
									new_material.name = surfaceNames[i];
									this.materials.push(new_material);
								}

								break;
							case LWO_POLS:

								// Gather some initial data so that we can get the proper size 
								var totalNumIndices = 0;
								var offset = 0;
								while (offset < chunkSize) {
									var numIndices = view.getInt16( cursor + offset );
									var materialIndex = view.getInt16( cursor + offset + 2 + (numIndices * 2));

									this.geometry.addGroup(totalNumIndices, (numIndices - 2) * 3, materialIndex-1);

									totalNumIndices += (numIndices - 2) * 3;
									offset += 4 + (numIndices * 2);		
								}

								offset = 0;
								var currentIndex = 0;
								var allIndices = new Uint16Array(totalNumIndices);
								while (offset < chunkSize) {
									var numIndices = view.getInt16( cursor + offset );

									console.log(numIndices)
									console.log( cursor + offset )

									offset += 2;

									var faceIndices = new Int16Array(numIndices);
									for (var i = 0; i <= numIndices; i++) {
										faceIndices[i] = view.getInt16( cursor + offset + (i*2) );
									}

									console.log(faceIndices);

									for (var i = 0; i < numIndices-2; i++) {
										allIndices[currentIndex++] = faceIndices[0];
										allIndices[currentIndex++] = faceIndices[i+1];
										allIndices[currentIndex++] = faceIndices[i+2];

										// NOTE: 	This could work if we were using a standard Geometry rather than BufferGeometry.
										// 			Although BufferGeometry takes a bit of extra time to parse, it is more efficient to render.
										/*
										var face = new THREE.Face3( indices[0], indices[i+1], indices[i+2], null, null, materialIndex );
										this.geometry.faces.push( face );
										*/
									}

									offset += 2 + (numIndices * 2);		
								}

								console.log(allIndices);

								this.geometry.setIndex(new THREE.BufferAttribute(allIndices, 1));
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

								/*****************************/
								/* TEXTURE DEFINITIONS START */
								/*****************************/

								// Start of Definition
								const SURF_CTEX = 0x43544558;
								const SURF_DTEX = 0x44544558;
								const SURF_STEX = 0x53544558;
								const SURF_RTEX = 0x52544558;
								const SURF_TTEX = 0x54544558;
								const SURF_LTEX = 0x4C544558;
								const SURF_BTEX = 0x42544558;

								// Flags
								const SURF_TFLG = 0x54464C47;

								// Location and Size
								const SURF_TSIZ = 0x5453495A;
								const SURF_TCTR = 0x54435452;
								const SURF_TFAL = 0x5446414C;
								const SURF_TVEL = 0x5456454C;

								// Color
								const SURF_TCLR = 0x54434C52;

								// Value
								const SURF_TVAL = 0x54434C52;

								// Bump Amplitude
								const SURF_TAMP = 0x54414D50;

								// Image Map
								const SURF_TIMG = 0x54494D47;

								// Image Alpha
								const SURF_TALP = 0x54414C50;

								// Image Wrap Options
								const SURF_TWRP = 0x54575250;

								// Antialiasing Strength
								const SURF_TAAS = 0x54414153;

								// Texture Opacity
								const SURF_TOPC = 0x544F5043;

								/*****************************/
								/*  TEXTURE DEFINITIONS END  */
								/*****************************/

								var offset = 0;
								while ( view.getUint8( cursor + offset ) !== 0 ) offset++;
								var materialName = new TextDecoder().decode(new Uint8Array(buffer, cursor, offset));
								var material = null;

								for (var m of this.materials) {
									if (m.name == materialName) material = m;
								}

								if (!material) {
									console.error( 'THREE.LWO2Loader.parse: Surface in SURF chunk does not exist in SRFS' );
									return;
								}
								
								var texture = null;

								while (offset < chunkSize) {
									var subchunkOffset = cursor + offset;
									if ( view.getUint8( subchunkOffset ) === 0 ) {
										offset++;
									} else {
										var subchunkType = view.getInt32( subchunkOffset );
										var subchunkSize = view.getInt32( subchunkOffset + 4 );

										offset += SUBCHUNK_HEADER_SIZE;

										switch (subchunkType) {
											case SURF_COLR:
												var colorArray = [];
												for (var i = 0; i < 4; i++) {
													colorArray.push(view.getUint8(subchunkOffset+6+i) / 255);
												}
												console.log(new TextDecoder().decode(new Uint8Array(buffer, subchunkOffset+6, 6)));
												console.log(colorArray)

												var color_ = new THREE.Color().fromArray(colorArray);

												material.color = color_;

												break;
											case SURF_FLAG:
												break;

											case SURF_LUMI:
												var luminosity = view.getInt16(subchunkOffset) / 255;
												break;
											case SURF_DIFF:
												var diffuse = view.getInt16(subchunkOffset) / 255;
												break;
											case SURF_SPEC:
												var specular = view.getInt16(subchunkOffset) / 255;
												break;
											case SURF_REFL:
												var reflection = view.getInt16(subchunkOffset) / 255;
												break;
											case SURF_TRAN:
												var transparency = view.getInt16(subchunkOffset) / 255;
												break;

											case SURF_VLUM:
												var luminosity = view.getFloat32(subchunkOffset);
												break;
											case SURF_VDIF:
												var diffuse = view.getFloat32(subchunkOffset);
												break;
											case SURF_VSPC:
												var specular = view.getFloat32(subchunkOffset);
												break;
											case SURF_VRFL:
												var reflection = view.getFloat32(subchunkOffset);
												break;
											case SURF_VTRN:
												var transparency = view.getFloat32(subchunkOffset);
												break;

											case SURF_GLOS:
												break;
											case SURF_RFLT:
												break;
											case SURF_RIMG:
												break;
											case SURF_RIND:
												break;
											case SURF_EDGE:
												break;
											case SURF_SMAN:
												break;
											default:
											console.warn('Found unrecognised subchunk type ' + new TextDecoder().decode(new Uint8Array(buffer, subchunkOffset-SUBCHUNK_HEADER_SIZE, 4)) + ' at ' + subchunkOffset);
										}

										offset += subchunkSize;
									}
								}

								break;
							default:
							console.warn('Found unrecognised chunk type ' + new TextDecoder().decode(new Uint8Array(buffer, cursor-8, 4)) + ' at ' + cursor);
						}

						cursor += chunkSize;
					}

				}

				return new THREE.Mesh(this.geometry, new THREE.MultiMaterial( this.materials ));
			}
		};

} )();