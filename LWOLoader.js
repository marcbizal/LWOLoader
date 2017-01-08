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
			this.path = "";
			this.materials = new Array();
			this.geometry = new THREE.BufferGeometry();
			this.vertices = null;
			this.indices = null;
			this.uvs = null;

		};

		THREE.LWOLoader.prototype = {

			constructor: THREE.LWO2Loader,

			load: function( url, onLoad, onProgress, onError ) {
				this.path = url.replace(/\//g, "\\"); // convert forward slashes to backslashes.

				var scope = this;

				var loader = new THREE.FileLoader( scope.manager );
					loader.setResponseType( 'arraybuffer' );
					loader.load( url, function( buffer ) {

						onLoad( scope.parse( buffer ) );

					}, onProgress, onError );

			},

			parse: function( buffer ) {
				var view = new DataView(buffer);

				function decimalToBinary(dec){
				    return (dec >>> 0).toString(2);
				}

				function getFilename( path ) {
					return path.substring(path.lastIndexOf('\\')+1);
				}

				function getFilepath( path ) {
					return path.substring(0, path.lastIndexOf('\\')+1);
				}

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

				const COUNTER_CLOCKWISE = false;

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
						var chunkSize = view.getInt32( cursor + ID4_SIZE );

						cursor += CHUNK_HEADER_SIZE;

						switch(chunkType) {
							case LWO_PNTS:
								if ( chunkSize % VEC12_SIZE !== 0 ) {
									console.error( 'THREE.LWO2Loader.parse: F12 does not evenly divide into chunk size ('+chunkSize+'). Possible corruption.' );
									return;
								}

								var numVertices = (chunkSize / F4_SIZE) / 3;
								this.vertices = new Float32Array( numVertices * 3 );
								this.uvs      = new Float32Array( numVertices * 2 );

								for ( var i = 0; i < numVertices; i++ ) {
									var vertexIndex = (i * 3);
									var vertexOffset = vertexIndex * F4_SIZE;
									this.vertices[vertexIndex] = view.getFloat32( cursor + vertexOffset ); 					// x
									this.vertices[vertexIndex+1] = view.getFloat32( cursor + vertexOffset + F4_SIZE ); 		// y
									this.vertices[vertexIndex+2] = view.getFloat32( cursor + vertexOffset + (F4_SIZE*2)); 	// z
								}

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
								this.indices = new Uint16Array(totalNumIndices);
								while (offset < chunkSize) {
									var numIndices = view.getInt16( cursor + offset );

									offset += 2;

									var faceIndices = new Int16Array(numIndices);
									for (var i = 0; i <= numIndices; i++) {
										faceIndices[i] = view.getInt16( cursor + offset + (i*2) );
									}

									for (var i = 0; i < numIndices-2; i++) {
										if (COUNTER_CLOCKWISE) {
											this.indices[currentIndex++] = faceIndices[0];
											this.indices[currentIndex++] = faceIndices[i+2];
											this.indices[currentIndex++] = faceIndices[i+1];
										} else {
											this.indices[currentIndex++] = faceIndices[0];
											this.indices[currentIndex++] = faceIndices[i+1];
											this.indices[currentIndex++] = faceIndices[i+2];
										}

										// NOTE: 	This could work if we were using a standard Geometry rather than BufferGeometry.
										// 			Although BufferGeometry takes a bit of extra time to parse, it is more efficient to render.
										/*
										var face = new THREE.Face3( indices[0], indices[i+1], indices[i+2], null, null, materialIndex );
										this.geometry.faces.push( face );
										*/
									}

									offset += 2 + (numIndices * 2);		
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

								/*************************/
								/* FLAG DEFINITION START */
								/*************************/

								const LUMINOUS_BIT 			= 1;
								const OUTLINE_BIT 			= 2;
								const SMOOTHING_BIT 		= 4;
								const COLORHIGHLIGHTS_BIT 	= 8;
								const COLORFILTER_BIT		= 16;
								const OPAQUEEDGE_BIT		= 32;
								const TRANSPARENTEDGE_BIT	= 64;
								const SHARPTERMINATOR_BIT	= 128;
								const DOUBLESIDED_BIT		= 256;
								const ADDITIVE_BIT			= 512;
								const SHADOWALPHA_BIT		= 1024;

								/*************************/
								/*  FLAG DEFINITION END  */
								/*************************/

								/*************************/
								/* TFLG DEFINITION START */
								/*************************/

								const XAXIS_BIT 			= 1;
								const YAXIS_BIT 			= 2;
								const ZAXIS_BIT 			= 4;
								const WORLDCOORDS_BIT 		= 8;
								const NEGATIVEIMAGE_BIT		= 16;
								const PIXELBLENDING_BIT		= 32;
								const ANTIALIASING_BIT		= 64;

								/*************************/
								/*  TFLG DEFINITION END  */
								/*************************/

								function getVector3AtIndex(vertices, index) {
									return THREE.Vector3( vertices[vertexIndex], vertices[vertexIndex]+1, vertices[vertexIndex]+2 );
								}

								function planarMapUVS(geometry, vertices, uvs, indices, materialIndex, size, center, flags) {

									console.log(flags.toString(2))
									console.log(size);
									console.log(center);
									// Check to ensure that one of the flags is set, if not throw an error.
									var mask = XAXIS_BIT | YAXIS_BIT | ZAXIS_BIT;
									console.log(flags & mask);
									if (flags & mask) {
										for (var group of geometry.groups) {
											if (group.materialIndex != materialIndex) continue;

											for (let i = group.start; i < group.start+group.count; i++) {

												let vertexIndex = indices[i] * 3;
												let x = vertices[vertexIndex] 	- center.x;
												let y = vertices[vertexIndex+1] - center.y;
												let z = vertices[vertexIndex+2] - center.z;

												let uvIndex = indices[i] * 2;
												let u = 0;
												let v = 0;

												if (flags & XAXIS_BIT) {
													u = z/size.z + 0.5;
													v = y/size.y + 0.5;
												} else if (flags & YAXIS_BIT) {
													u = x/size.x + 0.5;
													v = z/size.z + 0.5;
												} else if (flags & ZAXIS_BIT) {
													u = x/size.x + 0.5;
													v = y/size.y + 0.5;
												}

												uvs[uvIndex] = u;
												uvs[uvIndex+1] = v;
											}
										}
									} else {
										console.warn("THREE.LWO2Loader.planarMapUVS: No axis bit is set!");
										return;
									}

								}

								var offset = 0;
								while ( view.getUint8( cursor + offset ) !== 0 ) offset++;
								var materialName = new TextDecoder().decode(new Uint8Array(buffer, cursor, offset));
								var materialIndex = -1;
								var material = null;
								var textureFlags = 0;
								var textureSize = new THREE.Vector3( 0, 0, 0 );
								var textureCenter = new THREE.Vector3( 0, 0, 0 );
								var textureFalloff = new THREE.Vector3( 0, 0, 0 );
								var textureVelocity = new THREE.Vector3( 0, 0, 0 );

								for (i = 0; i < this.materials.length; i++) { 
									if (this.materials[i].name == materialName) {
										materialIndex = i;
										material = this.materials[i];
									}
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
										var subchunkSize = view.getInt16( subchunkOffset + ID4_SIZE );

										switch (subchunkType) {
											case SURF_COLR:
												var colorArray = [];
												for (var i = 0; i < 4; i++) {
													colorArray.push(view.getUint8(subchunkOffset+SUBCHUNK_HEADER_SIZE+i) / 255);
												}

												var color_ = new THREE.Color().fromArray(colorArray);

												material.color = color_;

												break;
											case SURF_FLAG:
												var binaryString = view.getUint16(subchunkOffset+SUBCHUNK_HEADER_SIZE);
												// console.log(binaryString);
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
											case SURF_TFLG:
												textureFlags = view.getUint16(subchunkOffset+SUBCHUNK_HEADER_SIZE);
												break;
											case SURF_TSIZ:
												textureSize.x = view.getFloat32( subchunkOffset + SUBCHUNK_HEADER_SIZE );
												textureSize.y = view.getFloat32( subchunkOffset + SUBCHUNK_HEADER_SIZE + F4_SIZE );
												textureSize.z = view.getFloat32( subchunkOffset + SUBCHUNK_HEADER_SIZE + (F4_SIZE * 2) );												break;
											case SURF_TCTR:
												textureCenter.x = view.getFloat32( subchunkOffset + SUBCHUNK_HEADER_SIZE );
												textureCenter.y = view.getFloat32( subchunkOffset + SUBCHUNK_HEADER_SIZE + F4_SIZE );
												textureCenter.z = view.getFloat32( subchunkOffset + SUBCHUNK_HEADER_SIZE + (F4_SIZE * 2) );
												break;
											case SURF_TIMG:
												var texturePath = new TextDecoder().decode(new Uint8Array(buffer, subchunkOffset+SUBCHUNK_HEADER_SIZE, subchunkSize));
												var textureName = getFilename(texturePath);
												var currentPath = getFilepath(this.path);

												// instantiate a loader
												var loader = new THREE.TextureLoader();
												material.map = loader.load( "LegoRR0/World/Shared/" + textureName );
												material.map.wrapS = THREE.RepeatWrapping;
												material.map.wrapT = THREE.RepeatWrapping;
												//material.map.repeat.set( 4, 4 );
												var scope = this;

												// load a resource
												/*
												loader.load(
													"LegoRR0/World/Shared/" + textureName,
													function ( texture ) {
														scope.materials[materialIndex].map = texture;
													},
													// Function called when download progresses
													function ( xhr ) {
														console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
													},
													// Function called when download errors
													function ( xhr ) {
														console.log( 'An error happened' );
													}
												);
												*/

												break;
											default:
											console.warn('Found unrecognised SURF subchunk type ' + new TextDecoder().decode(new Uint8Array(buffer, subchunkOffset, ID4_SIZE)) + ' at ' + subchunkOffset);
										}

										offset += SUBCHUNK_HEADER_SIZE + subchunkSize;
									}
								}

								planarMapUVS(this.geometry, this.vertices, this.uvs, this.indices, materialIndex, textureSize, textureCenter, textureFlags);
								console.log(this.uvs)
								break;
							default:
							console.warn('Found unrecognised chunk type ' + new TextDecoder().decode(new Uint8Array(buffer, cursor-CHUNK_HEADER_SIZE, ID4_SIZE)) + ' at ' + cursor);
						}

						cursor += chunkSize;
					}

				}

				this.geometry.addAttribute( 'position', new THREE.BufferAttribute( this.vertices, 3 ) );
				this.geometry.addAttribute( 'uv', new THREE.BufferAttribute( this.uvs, 2 ) );
				this.geometry.setIndex( new THREE.BufferAttribute( this.indices, 1 ) );

				return new THREE.Mesh(this.geometry, new THREE.MultiMaterial( this.materials ));
			}
		};

} )();