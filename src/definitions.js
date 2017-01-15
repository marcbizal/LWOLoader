
// HEADER SPEC //

const LWO_MAGIC = 0x4C574F32; // "LWO2"
const LWO_MAGIC_LRR = 0x4C574F42; // "LWOB" - this is unique to LRR files.
const OFF_MAGIC = 8;

/********************/
/* TYPE SIZES START */
/********************/

const ID4_SIZE 		= 4;
const I1_SIZE 		= 1;
const I2_SIZE 		= 2;
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