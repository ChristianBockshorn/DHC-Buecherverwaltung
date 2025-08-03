sap.ui.define([], function () {
  "use strict";
  return {
    dateYMDToDMY: function (s) {
      if (!s) { return ""; }
      // erwartet "YYYY-MM-DD"
      const [y,m,d] = s.split("-");
      if (!y || !m || !d) { return s; }
      return `${d}.${m}.${y}`;
    }
  };
});
