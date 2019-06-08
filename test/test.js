const test = require('tape');
const jsnik = require('../lib');

test('layer, single style', function(t) {
  const map = jsnik
    .createMap({})
    .layer('1', { type: 'geojson' });
  const expected =
    '<Map>' +
      '<Layer>' +
        '<StyleName>1</StyleName>' +
        '<Datasource>' +
          '<Parameter name="type">geojson</Parameter>' +
        '</Datasource>' +
      '</Layer>' +
    '</Map>';
  t.equal(map.stringify(), expected);
  t.end();
});

test('layer, multiple styles', (t) => {
  const map = jsnik
  .createMap({})
  .layer(['1', '2', '3'], {}, { cacheFeatures: true });
  const expected =
    '<Map>' +
      '<Layer cache-features="true">' +
        '<StyleName>1</StyleName>' +
        '<StyleName>2</StyleName>' +
        '<StyleName>3</StyleName>' +
        '<Datasource/>' +
      '</Layer>' +
    '</Map>';
  t.equal(map.stringify(), expected);
  t.end();
});

// FIXME sqlLayer moved to extension (https://github.com/FreemapSlovakia/freemap-mapnik/blob/69600c5287d3b7131046c83ce7922a9e66372938/style/jsnikExtensions.js#L63)
// test('sqlLayer, single style', (t) => {
//   const map = jsnik
//     .createMap({})
//     .sqlLayer('1', 'select * from table');
//   const expected =
//     '<Map>' +
//       '<Layer>' +
//         '<StyleName>1</StyleName>' +
//         '<Datasource base="db">' +
//           '<Parameter name="table">(select * from table) as foo</Parameter>' +
//         '</Datasource>' +
//       '</Layer>' +
//     '</Map>';
//   t.equal(map.stringify(), expected);
//   t.end();
// });

// test('sqlLayer, multiple styles', (t) => {
//   const map = jsnik
//     .createMap({})
//     .sqlLayer(['1', '2', '3'], 'select * from table', { cacheFeatures: true });
//   const expected =
//     '<Map>' +
//       '<Layer cache-features="true">' +
//         '<StyleName>1</StyleName>' +
//         '<StyleName>2</StyleName>' +
//         '<StyleName>3</StyleName>' +
//         '<Datasource base="db">' +
//           '<Parameter name="table">(select * from table) as foo</Parameter>' +
//         '</Datasource>' +
//       '</Layer>' +
//     '</Map>';
//   t.equal(map.stringify(), expected);
//   t.end();
// });
