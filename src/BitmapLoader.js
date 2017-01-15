/**
 * @author Marcus-Bizal https://github.com/marcbizal
 *
 * This loader loads LWO2 files exported from LW6.
 *
 * Support
 *  - 
 */

( function() {

		THREE.BitmapLoader = function( manager ) {

			this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

		};

		THREE.BitmapLoader.prototype = {

			LITTLE_ENDIAN: true,

			constructor: THREE.LWO2Loader,

			load: function( url, onLoad, onProgress, onError ) {

				var scope = this;

				var loader = new THREE.FileLoader( scope.manager );
					loader.setResponseType( 'arraybuffer' );
					loader.load( url, function( buffer ) {

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
					console.error("THREE.BitMapLoader.parse: File is not a BMP!")
					return;
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

				let pixelOffset = 0;
				for (let y = 0; y < imageHeader.biHeight; y++) {
					for (let x = 0; x < imageHeader.biWidth; x++) {
						pixelOffset = (y * imageHeader.biWidth)-1 + x;

						var index = view.getUint8(cursor+pixelOffset);
						if (index == 0) {
							imageData[(pixelOffset*4) + 3] = 0;
						} else {
							var colorOffset = colorTable[index];

							imageData[pixelOffset*4] 		= colorTable[index*3];
							imageData[(pixelOffset*4) + 1] 	= colorTable[(index*3) + 1];
							imageData[(pixelOffset*4) + 2] 	= colorTable[(index*3) + 2];
							imageData[(pixelOffset*4) + 3] 	= 255;
						}
					}
				}

				var texture = new THREE.DataTexture(imageData, imageHeader.biHeight, imageHeader.biWidth, THREE.RGBAFormat, THREE.UnsignedByteType, THREE.UVMapping);
					texture.needsUpdate = true;

				console.timeEnd('BMP Parse');
				return texture;
			}

		};

} )();