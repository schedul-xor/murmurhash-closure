goog.provide('garycourt.MurmurHash');

goog.require('goog.asserts');



/**
 * Murmur hash class.
 * @author gary.court@gmail.com (Gary Court)
 * @see http://github.com/garycourt/murmurhash-js
 * @author aappleby@gmail.com (Austin Appleby)
 * @see http://sites.google.com/site/murmurhash/
 * @constructor
 * @license
Copyright (c) 2011 Gary Court

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use, copy,
modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT.  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
 */
garycourt.MurmurHash = function() {
  this.targetKey_ = [];
};
goog.addSingletonGetter(garycourt.MurmurHash);


/**
 * UTF16 string will be separated into upper 8 bits and lower 8 bits.
 * 'saitama' => [ 0, 115, 0, 97, 0, 105, 0, 116, 0, 97, 0, 109, 0, 97 ]
 * '荻窪' => [131, 123, 122, 170]
 *
 * @param {!string} string
 * @param {!number} seed Positive integer only
 * @return {!number} 32-bit positive integer hash
 */
garycourt.MurmurHash.prototype.mh3forString = function(string, seed) {
  goog.asserts.assert(goog.isDefAndNotNull(string));
  goog.asserts.assertString(string);
  goog.asserts.assert(goog.isDefAndNotNull(seed));
  goog.asserts.assertNumber(seed);

  this.targetKey_.length = 0;
  for (var i = 0; i < string.length; i++) {
    var code = string.charCodeAt(i);
    var upper = (code & 0xff00) >> 8;
    var lower = code & 0xff;
    this.targetKey_.push(upper);
    this.targetKey_.push(lower);
  }
  return this.calculateMh3_(seed);
};


/**
 * @param {!Array.<!number>} int32s
 * @param {!number} seed Positive integer only
 * @return {!number} 32-bit positive integer hash
 */
garycourt.MurmurHash.prototype.mh3forInt32s = function(int32s, seed) {
  goog.asserts.assert(goog.isDefAndNotNull(int32s));
  goog.asserts.assertArray(int32s);
  goog.asserts.assert(goog.isDefAndNotNull(seed));
  goog.asserts.assertNumber(seed);

  this.targetKey_.length = 0;
  for (var i = 0; i < int32s.length; i++) {
    var code = int32s[i];
    var i3 = (code & 0xff000000) >> 24;
    var i2 = (code & 0xff0000) >> 16;
    var i1 = (code & 0xff00) >> 8;
    var i0 = (code & 0xff);
    if (i3 < 0) {
      i3 += 256;
    }
    this.targetKey_.push(i3);
    this.targetKey_.push(i2);
    this.targetKey_.push(i1);
    this.targetKey_.push(i0);
  }
  return this.calculateMh3_(seed);
};


/**
 * JS Implementation of MurmurHash3 (r136) (as of May 20, 2011)
 *
 * @private
 * @param {!number} seed Positive integer only
 * @return {!number} 32-bit positive integer hash
 */
garycourt.MurmurHash.prototype.calculateMh3_ = function(seed) {
  var remainder, bytes, h1, h1b, c1, c1b, c2, c2b, k1, i;

  remainder = this.targetKey_.length & 3; // key.length % 4
  bytes = this.targetKey_.length - remainder;
  h1 = seed;
  c1 = 0xcc9e2d51;
  c2 = 0x1b873593;
  i = 0;

  while (i < bytes) {
    k1 =
        ((this.targetKey_[i] & 0xff)) |
        ((this.targetKey_[++i] & 0xff) << 8) |
        ((this.targetKey_[++i] & 0xff) << 16) |
        ((this.targetKey_[++i] & 0xff) << 24);
    ++i;

    k1 = ((((k1 & 0xffff) * c1) +
           ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = ((((k1 & 0xffff) * c2) +
           ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;

    h1 ^= k1;
    h1 = (h1 << 13) | (h1 >>> 19);
    h1b = ((((h1 & 0xffff) * 5) +
            ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
    h1 = (((h1b & 0xffff) + 0x6b64) +
          ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
  }

  k1 = 0;

  switch (remainder) {
    case 3: k1 ^= (this.targetKey_[i + 2] & 0xff) << 16;
    case 2: k1 ^= (this.targetKey_[i + 1] & 0xff) << 8;
    case 1: k1 ^= (this.targetKey_[i] & 0xff);

    k1 = (((k1 & 0xffff) * c1) +
          ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = (((k1 & 0xffff) * c2) +
          ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
    h1 ^= k1;
  }

  h1 ^= this.targetKey_.length;

  h1 ^= h1 >>> 16;
  h1 = (((h1 & 0xffff) * 0x85ebca6b) +
        ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
  h1 ^= h1 >>> 13;
  h1 = ((((h1 & 0xffff) * 0xc2b2ae35) +
         ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
  h1 ^= h1 >>> 16;

  return h1 >>> 0;
};


/**
 * JS Implementation of MurmurHash2
 *
 * @param {string} str ASCII only
 * @param {number} seed Positive integer only
 * @return {number} 32-bit positive integer hash
 */
garycourt.MurmurHash.prototype.mh2 = function(str, seed) {
  var
      l = str.length,
      h = seed ^ l,
      i = 0,
      k;

  while (l >= 4) {
    k =
        ((str.charCodeAt(i) & 0xff)) |
        ((str.charCodeAt(++i) & 0xff) << 8) |
        ((str.charCodeAt(++i) & 0xff) << 16) |
        ((str.charCodeAt(++i) & 0xff) << 24);

    k = (((k & 0xffff) * 0x5bd1e995) +
         ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16));
    k ^= k >>> 24;
    k = (((k & 0xffff) * 0x5bd1e995) +
         ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16));

    h = (((h & 0xffff) * 0x5bd1e995) +
         ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16)) ^ k;

    l -= 4;
    ++i;
  }

  switch (l) {
    case 3: h ^= (str.charCodeAt(i + 2) & 0xff) << 16;
    case 2: h ^= (str.charCodeAt(i + 1) & 0xff) << 8;
    case 1: h ^= (str.charCodeAt(i) & 0xff);
    h = (((h & 0xffff) * 0x5bd1e995) +
         ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16));
  }

  h ^= h >>> 13;
  h = (((h & 0xffff) * 0x5bd1e995) +
       ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16));
  h ^= h >>> 15;

  return h >>> 0;
};
