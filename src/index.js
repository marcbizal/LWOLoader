/**
 * @author Marcus-Bizal https://github.com/marcbizal
 *
 * This loader loads LWOB files exported from LW6.
 *
 * Support
 *  - 
 */

import './definitions.js';

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

								material.reflectivity = reflection;
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
								material.specular = material.color.multiplyScalar(specular);
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
								var texturePath = new TextDecoder().decode(new Uint8Array(buffer, subchunkOffset+SUBCHUNK_HEADER_SIZE, subchunkSize));
								var textureName = getFilename(texturePath);
								var currentPath = getFilepath(this.path);

								// instantiate a loader
								var loader = new THREE.TextureLoader();
								var texture = loader.load( "LegoRR0/World/Shared/" + textureName );
								material.map = texture;
								material.map.wrapS = THREE.RepeatWrapping;
								material.map.wrapT = THREE.RepeatWrapping;

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

				if ( view.getInt32() !== LWO_FORM ) {
					console.error( 'THREE.LWO2Loader.parse: Cannot find header.' );
					return;
				}

				var fileSize = view.getInt32( ID4_SIZE );
				if (chunkSize + CHUNK_HEADER_SIZE !== view.byteLength) {
					console.warn( 'THREE.LWO2Loader.parse: Discrepency between size in header (' + chunkSize + ' bytes) and actual size (' + view.byteLength + ' bytes).')
				}

				let magicOffset = ID4_SIZE + I4_SIZE;
				if ( view.getInt32( magicOffset ) !== LWO_MAGIC ) {
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