sap.ui.define([
   "sap/ui/core/UIComponent",
   "sap/ui/Device",
   "./model/models",
   "sap/ui/model/json/JSONModel"   // + JSONModel
], function (UIComponent, Device, models, JSONModel) {
   "use strict";

   const BASE_URL = (window.API_URL || "/api");

   return UIComponent.extend("bookmanager.Component", {
      metadata: {
         manifest: "json",
         interfaces: ["sap.ui.core.IAsyncContentCreation"]
      },

      init: function () {
         /* Basis-Init */
         UIComponent.prototype.init.call(this);

         /* Device-Model */
         this.setModel(models.createDeviceModel(), "device");

         /* Books-Model anlegen und gleich laden */
         const oBooksModel = new JSONModel();
         this.setModel(oBooksModel, "books");               // ► Alias "books"
         oBooksModel.loadData(`${BASE_URL}/books`);         // GET /books

         /* Routing starten */
         this.getRouter().initialize();
      },


      getContentDensityClass: function () {
         if (this.contentDensityClass === undefined) {
            if (document.body.classList.contains("sapUiSizeCozy") ||
               document.body.classList.contains("sapUiSizeCompact")) {
               this.contentDensityClass = "";
            } else if (!Device.support.touch) {
               this.contentDensityClass = "sapUiSizeCompact";
            } else {
               this.contentDensityClass = "sapUiSizeCozy";
            }
         }
         return this.contentDensityClass;
      }
   });
});
