const test = require('node:test');
const assert = require('node:assert/strict');

const {
  detectImageType
} = require('../src/middleware/uploadSecurity');




test('detectImageType detects JPEG signatures', () => {
  
  const jpeg = Buffer.from([
    0xff,
    0xd8,
    0xff,
    0xe0,
    0x00,
    0x10,
    0x4a,
    0x46,
    0x49,
    0x46
  ]);

  assert.equal(
    detectImageType(jpeg),
    'jpg'
  );
});

test('detectImageType detects alternate JPEG signatures', () => {
  const jpegExif = Buffer.from([
    0xff,
    0xd8,
    0xff,
    0xe1,
    0x45,
    0x78,
    0x69,
    0x66
  ]);

  assert.equal(
    detectImageType(jpegExif),
    'jpg'
  );
});



test('detectImageType detects PNG signature', () => {
  const png = Buffer.from([
    0x89,
    0x50,
    0x4e,
    0x47,
    0x0d,
    0x0a,
    0x1a,
    0x0a
  ]);

  assert.equal(
    detectImageType(png),
    'png'
  );
});



test('detectImageType detects GIF89a', () => {
  assert.equal(
    detectImageType(
      Buffer.from('GIF89a')
    ),
    'gif'
  );
});

test('detectImageType detects GIF87a', () => {
  assert.equal(
    detectImageType(
      Buffer.from('GIF87a')
    ),
    'gif'
  );
});


test('detectImageType rejects plain text disguised as an image', () => {
  const fakeImage = Buffer.from(
    'not really an image'
  );

  assert.equal(
    detectImageType(fakeImage),
    null
  );
});

test('detectImageType rejects JavaScript disguised as image content', () => {
  const maliciousFile = Buffer.from(
    '<script>alert("xss")</script>'
  );

  assert.equal(
    detectImageType(maliciousFile),
    null
  );
});

test('detectImageType rejects HTML content', () => {
  const html = Buffer.from(
    '<html><body>fake image</body></html>'
  );

  assert.equal(
    detectImageType(html),
    null
  );
});

test('detectImageType rejects executable-style signatures', () => {
  const executable = Buffer.from([
    0x4d,
    0x5a,
    0x90,
    0x00
  ]);

  assert.equal(
    detectImageType(executable),
    null
  );
});


test('detectImageType rejects incomplete JPEG signatures', () => {
  assert.equal(
    detectImageType(
      Buffer.from([
        0xff,
        0xd8
      ])
    ),
    null
  );
});

test('detectImageType rejects incomplete PNG signatures', () => {
  assert.equal(
    detectImageType(
      Buffer.from([
        0x89,
        0x50,
        0x4e,
        0x47
      ])
    ),
    null
  );
});

test('detectImageType rejects incomplete GIF signatures', () => {
  assert.equal(
    detectImageType(
      Buffer.from('GIF')
    ),
    null
  );
});


test('detectImageType rejects an empty buffer', () => {
  assert.equal(
    detectImageType(
      Buffer.alloc(0)
    ),
    null
  );
});

test('detectImageType rejects random short buffers', () => {
  const values = [
    Buffer.from([0xff]),
    Buffer.from([0x89]),
    Buffer.from([0x00]),
    Buffer.from([0x12, 0x34]),
    Buffer.from([0x50, 0x4e, 0x47])
  ];

  for (const value of values) {
    assert.equal(
      detectImageType(value),
      null
    );
  }
});



test('detectImageType checks actual file bytes instead of filename', () => {
 

  const fake = Buffer.from(
    'MZ executable content'
  );

  assert.equal(
    detectImageType(fake),
    null
  );
});