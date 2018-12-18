const builder = require('xmlbuilder');

function sanitizeAtts(obj) {
  const res = {};
  Object.keys(obj).filter(key => obj[key] !== undefined).forEach((key) => {
    res[key.replace(/[A-Z]/g, (x) => '-' + x.toLowerCase())] = obj[key];
  });
  return res;
}

function sanitizeLayerAtts(obj) {
  const atts = { ...obj };
  if ('minZoom' in atts) {
    atts.maximumScaleDenominator = zoomDenoms[atts.minZoom];
    delete atts.minZoom;
  }
  if ('maxZoom' in atts) {
    atts.minimumScaleDenominator = zoomDenoms[atts.maxZoom + 1];
    delete atts.maxZoom;
  }

  return sanitizeAtts(atts);
}

const zoomDenoms = [
  1000000000,
  500000000,
  200000000,
  100000000,
  50000000,
  25000000,
  12500000,
  6500000,
  3000000,
  1500000,
  750000, // 10
  400000,
  200000,
  100000,
  50000,
  25000,
  12500,
  5000,
  2500,
  1500,
  750, // 20
  500,
  250,
  100,
  50,
  25,
  12.5,
];

function createMap(atts, { dbParams } = {}) {
  const mapEle = builder.begin().ele('Map', sanitizeAtts(atts));

  if (dbParams) {
    const dsEle = mapEle.ele('Datasource', { name: 'db' });
    Object.keys(dbParams).forEach((name) => {
      dsEle.ele('Parameter', { name }, dbParams[name]);
    });
  }

  const map = {
    doInMap(cb) {
      cb(map);
      return map;
    },
    style(name, atts = {}) {
      const styleEle = mapEle.ele('Style', { name, ...sanitizeAtts(atts) });
      const s = {
        doInStyle(cb) {
          cb(s);
          return s;
        },
        rule({ filter, maxZoom, minZoom } = {}) {
          const ruleEle = styleEle.ele('Rule');
          if (filter) {
            ruleEle.ele('Filter', {}, filter);
          }
          if (typeof maxZoom === 'number') {
            if (zoomDenoms[maxZoom + 1]) {
              ruleEle.ele('MinScaleDenominator', {}, zoomDenoms[maxZoom + 1]);
            } else {
              throw new Error(`Unsupported zoom ${maxZoom + 1}`);
            }
          }
          if (typeof minZoom === 'number') {
            if (zoomDenoms[minZoom]) {
              ruleEle.ele('MaxScaleDenominator', {}, zoomDenoms[minZoom]);
            } else {
              throw new Error(`Unsupported zoom ${minZoom}`);
            }
          }
          const ascendents = { style: map.style, map };
          const rule = {
            doInRule(cb) {
              cb(map);
              return map;
            },
            filter(filter) {
              const filterEle = ruleEle.ele('Filter', {}, filter);
              return { filterEle, ...rule, ...ascendents };
            },
            polygonSymbolizer(atts = {}) {
              const polygonSymbolizerEle = ruleEle.ele('PolygonSymbolizer', sanitizeAtts(atts));
              return { polygonSymbolizerEle, ...rule, ...ascendents };
            },
            polygonPatternSymbolizer(atts = {}) {
              const polygonPatternSymbolizerEle = ruleEle.ele('PolygonPatternSymbolizer', sanitizeAtts(atts));
              return { polygonPatternSymbolizerEle, ...rule, ...ascendents };
            },
            lineSymbolizer(atts = {}) {
              const lineSymbolizerEle = ruleEle.ele('LineSymbolizer', sanitizeAtts(atts));
              return { lineSymbolizerEle, ...rule, ...ascendents };
            },
            linePatternSymbolizer(atts = {}) {
              const linePatternSymbolizerEle = ruleEle.ele('LinePatternSymbolizer', sanitizeAtts(atts));
              return { linePatternSymbolizerEle, ...rule, ...ascendents };
            },
            markersSymbolizer(atts = {}) {
              const markersSymbolizerEle = ruleEle.ele('MarkersSymbolizer', sanitizeAtts(atts));
              return { markersSymbolizerEle, ...rule, ...ascendents };
            },
            textSymbolizer(atts = {}, text) {
              const textSymbolizerEle = ruleEle.ele('TextSymbolizer', sanitizeAtts(atts), text);
              return { textSymbolizerEle, ...rule, ...ascendents };
            },
            rasterSymbolizer(atts = {}) {
              const rasterSymbolizerEle = ruleEle.ele('RasterSymbolizer', sanitizeAtts(atts));
              return { rasterSymbolizerEle, ...rule, ...ascendents };
            },
            shieldSymbolizer(atts = {}) {
              const shieldSymbolizerEle = ruleEle.ele('ShieldSymbolizer', sanitizeAtts(atts));
              return { shieldSymbolizerEle, ...rule, ...ascendents };
            },

            borderedPolygonSymbolizer(color) {
              const polygonSymbolizerEle = ruleEle.ele('PolygonSymbolizer', sanitizeAtts({ fill: color }));
              const lineSymbolizerEle = ruleEle.ele('LineSymbolizer', sanitizeAtts({ stroke: color, strokeWidth: 1 }));
              return { polygonSymbolizerEle, lineSymbolizerEle, ...rule, ...ascendents };
            },
            ruleEle,
            ...s,
          };
          return rule;
        },
        styleEle,
        ...map,
      };
      return s;
    },
    sqlLayer(styleName, sql, atts = {}) {
      const layerEle = mapEle.ele('Layer', sanitizeLayerAtts(atts));
      for (const sn of Array.isArray(styleName) ? styleName : [styleName]) {
        layerEle.ele('StyleName', {}, sn);
      }
      layerEle.ele('Datasource', { base: 'db' })
        .ele('Parameter', { name: 'table' }, `(${sql}) as foo`);
      return this;
    },
    layer(styleName, dsParams, atts = {}) {
      const layerEle = mapEle.ele('Layer', sanitizeLayerAtts(atts));
      for (const sn of Array.isArray(styleName) ? styleName : [styleName]) {
        layerEle.ele('StyleName', {}, sn);
      }
      const dsEle = layerEle.ele('Datasource');
      Object.keys(dsParams).forEach((name) => {
        dsEle.ele('Parameter', { name }, dsParams[name]);
      });
      return this;
    },
    mapEle,
    stringify(formattingOptions = { pretty: true }) {
      return mapEle.end(formattingOptions);
    },
  };

  return map;
}

module.exports = {
  sanitizeAtts,
  createMap,
  zoomDenoms,
};