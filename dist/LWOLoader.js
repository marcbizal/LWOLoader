/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @author Marcus-Bizal https://github.com/marcbizal
	 *
	 * This loader loads LWOB files exported from LW6.
	 *
	 * Support
	 *  - 
	 */

	// HEADER SPEC //
	const LWO_MAGIC = 0x4C574F42; // "LWOB"
	const OFF_MAGIC = 8;

	/********************/
	/* TYPE SIZES START */
	/********************/

	const ID4_SIZE 		= 4;
	const I1_SIZE 		= 1;
	const I2_SIZE 		= 2;
	const I4_SIZE 		= 4;
	const F4_SIZE 		= 4;

	const COL4_SIZE 	= 4;
	const VEC12_SIZE 	= 12;
	const IP2_SIZE 		= 2;
	const FP4_SIZE 		= 4;
	const DEG4_SIZE 	= 4;

	/********************/
	/*  TYPE SIZES END  */
	/********************/

	/*********************/
	/* CHUNK TYPES START */
	/*********************/

	const LWO_FORM = 0x464F524D;
	const LWO_PNTS = 0x504E5453;
	const LWO_SFRS = 0x53524653;
	const LWO_POLS = 0x504F4C53;
	const LWO_CRVS = 0x43525653;
	const LWO_PCHS = 0x50434853;
	const LWO_SURF = 0x53555246;

	const CHUNK_HEADER_SIZE = 8;
	const SUBCHUNK_HEADER_SIZE = 6;

	/*********************/
	/*  CHUNK TYPES END  */
	/*********************/

	/**************************/
	/* SURF DEFINITIONS START */
	/**************************/

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

	__webpack_require__(1);

	function getVector3AtOffset(view, offset) {
		let vector = new THREE.Vector3();
		vector.x = view.getFloat32( offset );
		vector.y = view.getFloat32( offset + F4_SIZE );
		vector.z = view.getFloat32( offset + (F4_SIZE * 2) );

		return vector;
	}

	function getVector3AtIndex(vertices, index) {
		return THREE.Vector3( vertices[vertexIndex], vertices[vertexIndex]+1, vertices[vertexIndex]+2 );
	}

	function decimalToBinary(dec){
	    return (dec >>> 0).toString(2);
	}

	function getFilename( path ) {
		return path.substring(path.lastIndexOf('\\')+1);
	}

	function getFilepath( path ) {
		return path.substring(0, path.lastIndexOf('\\')+1);
	}

	function planarMapUVS(geometry, vertices, uvs, indices, materialIndex, size, center, flags) {
		// Check to ensure that one of the flags is set, if not throw an error.
		var mask = XAXIS_BIT | YAXIS_BIT | ZAXIS_BIT;
		if (flags & mask) {
			for (let group of geometry.groups) {
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

	(function() {

			THREE.LWOLoader = function( manager ) {

				this.manager = manager !== undefined ? manager : THREE.DefaultLoadingManager;
				this.path = "";
				this.materials = new Array();
				this.geometry = new THREE.BufferGeometry();
				this.vertices = null;
				this.indices = null;
				this.uvs = null;

			};

			THREE.LWOLoader.prototype = {

				COUNTER_CLOCKWISE: false,

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

				parsePoints: function(view, chunkOffset, chunkSize) {
					if ( chunkSize % VEC12_SIZE !== 0 ) {
						console.error( 'THREE.LWO2Loader.parse: F12 does not evenly divide into chunk size (' + chunkSize + '). Possible corruption.' );
						return;
					}

					let numVertices = (chunkSize / F4_SIZE) / 3;
					this.vertices = new Float32Array( numVertices * 3 );
					this.uvs      = new Float32Array( numVertices * 2 );

					for ( let i = 0; i < numVertices; i++ ) {
						let vertexIndex = i * 3;
						let vertexOffset = vertexIndex * F4_SIZE;
						this.vertices[vertexIndex] = view.getFloat32( chunkOffset + vertexOffset ); 				// x
						this.vertices[vertexIndex+1] = view.getFloat32( chunkOffset + vertexOffset + F4_SIZE ); 	// y
						this.vertices[vertexIndex+2] = view.getFloat32( chunkOffset + vertexOffset + (F4_SIZE*2)); 	// z
					}
				},

				parseSurfaceNames: function(buffer, chunkOffset, chunkSize) {
					let textChunk = new TextDecoder().decode(new Uint8Array(buffer, chunkOffset, chunkSize));
					let surfaceNames = textChunk.split('\0').filter(function(s) { return s != ''; });

					for ( let i = 0; i < surfaceNames.length; i++ ) { 
						let new_material = new THREE.MeshPhongMaterial();
							new_material.name = surfaceNames[i];

						this.materials.push(new_material);
					}

				},

				parsePolygons: function(view, chunkOffset, chunkSize) {
					// Gather some initial data so that we can get the proper size 
					let totalNumIndices = 0;
					let offset = 0;
					while (offset < chunkSize) {
						var numIndices = view.getInt16( chunkOffset + offset );
						var materialIndex = view.getInt16( chunkOffset + offset + 2 + (numIndices * 2));

						this.geometry.addGroup(totalNumIndices, (numIndices - 2) * 3, materialIndex-1);

						totalNumIndices += (numIndices - 2) * 3;
						offset += 4 + (numIndices * 2);		
					}

					offset = 0;
					let currentIndex = 0;
					this.indices = new Uint16Array(totalNumIndices);
					while (offset < chunkSize) {
						let numIndices = view.getInt16( chunkOffset + offset );

						offset += 2;

						let faceIndices = new Int16Array(numIndices);
						for (let i = 0; i <= numIndices; i++) {
							faceIndices[i] = view.getInt16( chunkOffset + offset + (i*2) );
						}

						for (let i = 0; i < numIndices-2; i++) {
							if (this.COUNTER_CLOCKWISE) {
								this.indices[currentIndex++] = faceIndices[0];
								this.indices[currentIndex++] = faceIndices[i+2];
								this.indices[currentIndex++] = faceIndices[i+1];
							} else {
								this.indices[currentIndex++] = faceIndices[0];
								this.indices[currentIndex++] = faceIndices[i+1];
								this.indices[currentIndex++] = faceIndices[i+2];
							}
						}

						offset += 2 + (numIndices * 2);		
					}
				},

				parseSurface(view, buffer, chunkOffset, chunkSize) {
					let offset = 0;
					while ( view.getUint8( chunkOffset + offset ) !== 0 ) offset++;

					let materialName = new TextDecoder().decode(new Uint8Array(buffer, chunkOffset, offset));
					let materialIndex = -1;
					let material = null;

					let textureFlags = 0;
					let textureSize = new THREE.Vector3( 0, 0, 0 );
					let textureCenter = new THREE.Vector3( 0, 0, 0 );
					let textureFalloff = new THREE.Vector3( 0, 0, 0 );
					let textureVelocity = new THREE.Vector3( 0, 0, 0 );

					for (let i = 0; i < this.materials.length; i++) { 
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
						var subchunkOffset = chunkOffset + offset;
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
									var flags = view.getUint16(subchunkOffset+SUBCHUNK_HEADER_SIZE);
									break;

								case SURF_LUMI:
									var luminosity = view.getInt16(subchunkOffset+SUBCHUNK_HEADER_SIZE) / 255;
									break;
								case SURF_DIFF:
									var diffuse = view.getInt16(subchunkOffset+SUBCHUNK_HEADER_SIZE) / 255;
									break;
								case SURF_SPEC:
									var specular = view.getInt16(subchunkOffset+SUBCHUNK_HEADER_SIZE) / 255;
									material.specular = material.color.multiplyScalar(specular);
									break;
								case SURF_REFL:
									var reflection = 0;
									if (reflection == SURF_VRFL) {
										reflection = view.getFloat32(subchunkOffset+SUBCHUNK_HEADER_SIZE);
									} else {
										reflection = view.getInt16(subchunkOffset+SUBCHUNK_HEADER_SIZE) / 255;
									}

									// material.reflectivity = reflection;
									break;
								case SURF_TRAN:
								case SURF_VTRN:
									var transparency = 0;
									if (subchunkType == SURF_VTRN) {
										transparency = view.getFloat32(subchunkOffset+SUBCHUNK_HEADER_SIZE);
									} else {
										transparency = view.getInt16(subchunkOffset+SUBCHUNK_HEADER_SIZE) / 255;
									}

									material.opacity = 1 - transparency;
									if (transparency > 0) material.transparent = true;

									break;

								case SURF_VLUM:
									var luminosity = view.getFloat32(subchunkOffset+SUBCHUNK_HEADER_SIZE);
									break;
								case SURF_VDIF:
									var diffuse = view.getFloat32(subchunkOffset+SUBCHUNK_HEADER_SIZE);
									break;
								case SURF_VSPC:
									var specular = view.getFloat32(subchunkOffset+SUBCHUNK_HEADER_SIZE);
									// material.specular = material.color.multiplyScalar(specular);
									break;

								case SURF_TFLG:
									textureFlags = view.getUint16(subchunkOffset+SUBCHUNK_HEADER_SIZE);
									break;
								case SURF_TSIZ:
									textureSize = getVector3AtOffset(view, subchunkOffset + SUBCHUNK_HEADER_SIZE);												break;
								case SURF_TCTR:
									textureCenter = getVector3AtOffset(view, subchunkOffset + SUBCHUNK_HEADER_SIZE);
									break;
								case SURF_TIMG:
									let texturePath = new TextDecoder().decode(new Uint8Array(buffer, subchunkOffset+SUBCHUNK_HEADER_SIZE, subchunkSize));
									let textureName = getFilename(texturePath);
									let currentPath = getFilepath(this.path);

									// instantiate a loader
									let loader = new THREE.BitmapLoader();
									console.log(textureName);

									function onTextureLoad(texture) {
										if (textureName[0] == 'A') {
											material.transparent = true;
											material.alphaTest = 0.5;
										}

										material.color = new THREE.Color( 0xffffff );
										material.map = texture;
										material.map.wrapS = THREE.RepeatWrapping;
										material.map.wrapT = THREE.RepeatWrapping;
										material.map.minFilter = THREE.NearestFilter;
										material.map.magFilter = THREE.NearestFilter;
										material.needsUpdate = true;
									}

									let texture = loader.load( getFilepath(this.path) + textureName, onTextureLoad, null, function onError() {
										loader.load( "LegoRR0/World/Shared/" + textureName, onTextureLoad);
									});

									break;
								default:
								console.warn('Found unrecognised SURF subchunk type ' + new TextDecoder().decode(new Uint8Array(buffer, subchunkOffset, ID4_SIZE)) + ' at ' + subchunkOffset);
							}

							offset += SUBCHUNK_HEADER_SIZE + subchunkSize;
						}
					}

					planarMapUVS(this.geometry, this.vertices, this.uvs, this.indices, materialIndex, textureSize, textureCenter, textureFlags);
				},

				parse: function( buffer ) {
					var view = new DataView(buffer);

					if ( view.getUint32() !== LWO_FORM ) {
						console.error( 'THREE.LWO2Loader.parse: Cannot find header.' );
						return;
					}

					var fileSize = view.getUint32( ID4_SIZE );
					if (chunkSize + CHUNK_HEADER_SIZE !== view.byteLength) {
						console.warn( 'THREE.LWO2Loader.parse: Discrepency between size in header (' + chunkSize + ' bytes) and actual size (' + view.byteLength + ' bytes).')
					}

					let magicOffset = ID4_SIZE + I4_SIZE;
					if ( view.getUint32( magicOffset ) !== LWO_MAGIC ) {
						var magic = new TextDecoder().decode(new Uint8Array(buffer, magicOffset, ID4_SIZE));
						console.error( 'THREE.LWO2Loader.parse: Invalid magic ID (' + magic + ') in LWO header.' );
						return;
					}

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
									this.parsePoints(view, cursor, chunkSize);
									break;
								case LWO_SFRS:
									this.parseSurfaceNames(buffer, cursor, chunkSize);
									break;
								case LWO_POLS:
									this.parsePolygons(view, cursor, chunkSize);
									break;
								case LWO_SURF:
									this.parseSurface(view, buffer, cursor, chunkSize);
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
					this.geometry.computeVertexNormals();

					return new THREE.Mesh(this.geometry, new THREE.MultiMaterial( this.materials ));
				}
			};

	})();

/***/ },
/* 1 */
/***/ function(module, exports) {

	/**
	 * @author Marcus-Bizal https://github.com/marcbizal
	 *
	 * This loader loads LWO2 files exported from LW6.
	 *
	 * Support
	 *  - 
	 */

	 function fixPath(path) {
	 	return path.replace(/\//g, "\\"); // convert forward slashes to backslashes.
	 }

	 function getFilename( path ) {
		return path.substring(path.lastIndexOf('\\')+1);
	}


	( function() {

			THREE.BitmapLoader = function( manager ) {

				this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

				this.path = "";

			};

			THREE.BitmapLoader.prototype = {

				LITTLE_ENDIAN: true,

				constructor: THREE.LWO2Loader,

				load: function( path, onLoad, onProgress, onError ) {
					this.path = fixPath(path);

					var scope = this;

					var loader = new THREE.FileLoader( scope.manager );
						loader.setResponseType( 'arraybuffer' );
						loader.load( path, function( buffer ) {

							onLoad( scope.parse( buffer ) );

						}, onProgress, onError );

				},

				parseHeader( view, cursor, definition ) {
					var header = {};
					for (let i = 0; i < definition.length; i++) {
						let field = definition[i];
						switch(field.size) {
							case 2:
								header[field.name] = view.getUint16(cursor, this.LITTLE_ENDIAN);
								break;
							case 4:
								header[field.name] = view.getUint32(cursor, this.LITTLE_ENDIAN);
								break;
							default:
								console.error("THREE.BitmapLoader.parseHeader: Field size of " + field.size + " is not supported at this time.");
								return null;
						}
						cursor += field.size;
					}

					return header;
				},

				parse: function( buffer ) {
					console.time('BMP Parse');
					var view = new DataView(buffer);
					var cursor = 0;

					const BM_MAGIC = 0x4D42;

					const BMP_FILEHEADER_SIZE = 14;
					const BMP_FILEHEADER = [
						{ name: "bfType", 		size: 2 },
						{ name: "bfSize", 		size: 4 },
						{ name: "bfReserved1", 	size: 2 },
						{ name: "bfReserved2", 	size: 2 },
						{ name: "bfOffBits", 	size: 4 }
					];

					const BMP_IMAGEHEADER_SIZE = 40;
					const BMP_IMAGEHEADER = [
						{ name: "biSize", 			size: 4 },
						{ name: "biWidth", 			size: 4 },
						{ name: "biHeight", 		size: 4 },
						{ name: "biPlanes", 		size: 2 },
						{ name: "biBitCount", 		size: 2 },
						{ name: "biCompression", 	size: 4 },
						{ name: "biSizeImage", 		size: 4 },
						{ name: "biXPelsPerMeter", 	size: 4 },
						{ name: "biYPelsPerMeter", 	size: 4 },
						{ name: "biClrUsed", 		size: 4 },
						{ name: "biClrImportant", 	size: 4 },
					];


					var fileHeader = this.parseHeader(view, cursor, BMP_FILEHEADER);
					cursor += BMP_FILEHEADER_SIZE;
					
					if (fileHeader.bfType !== BM_MAGIC) {
						console.warn("THREE.BitMapLoader.parse: File is not supported; Falling back...");
						let fallback = new THREE.TextureLoader();

						return fallback.load(this.path);
					}

					if ( getFilename( this.path )[0] !== 'A' ) {
						console.warn("THREE.BitMapLoader.parse: BitMap has no alpha; Falling back...");
						let fallback = new THREE.TextureLoader();

						return fallback.load(this.path);
					}

					var imageHeader = this.parseHeader(view, cursor, BMP_IMAGEHEADER);
					cursor += BMP_IMAGEHEADER_SIZE;

					var colorTable = new Uint8Array(imageHeader.biClrUsed*3);

					let dataOffset = 0;
					let tableOffset = 0;
					for (let i = 0; i <= imageHeader.biClrUsed; i++) {
						dataOffset = i * 4;
						tableOffset = i * 3;

						let b = view.getUint8(cursor + dataOffset);
						let g = view.getUint8(cursor + dataOffset + 1);
						let r = view.getUint8(cursor + dataOffset + 2);

						//console.log("rgb(" + r + ", " + g + ", " + b + ")");

						colorTable[tableOffset] = r;
						colorTable[tableOffset + 1] = g;
						colorTable[tableOffset + 2] = b;
					}

					cursor += imageHeader.biClrUsed * 4;

					var imageData = new Uint8Array(imageHeader.biHeight*imageHeader.biWidth*4);
					var key = getFilename( this.path ).substring(1, 4);
					console.log(key);

					let pixelOffset = 0;
					for (let y = 0; y < imageHeader.biHeight; y++) {
						for (let x = 0; x < imageHeader.biWidth; x++) {
							pixelOffset = (y * imageHeader.biWidth)-1 + x;

							var index = view.getUint8(cursor+pixelOffset);

							if (index == key) {
								imageData[(pixelOffset*4) + 3] = 0;
							} else {

								imageData[pixelOffset*4] 		= colorTable[index*3];
								imageData[(pixelOffset*4) + 1] 	= colorTable[(index*3) + 1];
								imageData[(pixelOffset*4) + 2] 	= colorTable[(index*3) + 2];
								imageData[(pixelOffset*4) + 3] 	= 255;
							}
						}
					}

					var texture = new THREE.DataTexture(imageData, imageHeader.biWidth, imageHeader.biHeight, THREE.RGBAFormat, THREE.UnsignedByteType, THREE.UVMapping);
						texture.needsUpdate = true;

					console.timeEnd('BMP Parse');
					return texture;
				}

			};

	} )();

/***/ }
/******/ ]);