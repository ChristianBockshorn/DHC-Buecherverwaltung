sap.ui.define([
   "./BaseController",
   "sap/ui/model/json/JSONModel",
   "sap/ui/core/Fragment",
   "sap/ui/model/Sorter",
   "sap/m/MessageToast",
   "sap/m/MessageBox"
], function (BaseController, JSONModel, Fragment, Sorter, MessageToast, MessageBox) {
   "use strict";

   const API = window.API_URL || "https://dhc-buecherverwaltung.onrender.com/";

   return BaseController.extend("bookmanager.controller.Main", {
      onInit: function () {
         // "new"-Model für den Add-Dialog
         if (!this.getView().getModel("new")) {
            this.getView().setModel(new JSONModel(this._blankBook()), "new");
         }
         this.onRefresh();
      },


      /* ---------- Hilfsfunktionen ---------- */
      _books: function () { return this.getOwnerComponent().getModel("books"); },
      _blankBook: function () {
         return { title: "", author: "", created: "", creator: "" };
      },


      /* ---------- Tabelle ---------- */
      onRefresh: function () {
         this._loadBooks(API + "/books");
      },


      /* ---------- Sortieren ---------- */
      onSort: async function () {
         if (!this._pSort) {
            this._pSort = Fragment.load({
               id: this.getView().getId(),
               name: "bookmanager.view.SortDialog",
               controller: this
            }).then(d => { this.getView().addDependent(d); return d; });
         }
         (await this._pSort).open();
      },


      /* ---------- Sortieren bestätigen ---------- */
      onSortConfirm: function (oEvent) {
         const item = oEvent.getParameter("sortItem");
         const desc = oEvent.getParameter("sortDescending");
         const path = item.getKey(); // 'title' | 'author' | 'created' | 'creator'
         const binding = this.byId("tblBooks").getBinding("items");
         binding.sort([new Sorter(path, desc)]);
      },


      // Konstante: 20 Einträge pro Seite
      _PAGE_SIZE: 20,
      // interner Speicher für alle (gefilterten) Bücher
      _dataAll: [],


      _setBusy(b) {
         this.byId("tblBooks").setBusy(b);
      },

      /* ---------- Laden der Bücher ---------- */
      // lädt Daten (mit optionalen Query-Parametern) und setzt Seite 1
      _loadBooks(url) {
         this._setBusy(true);
         return fetch(url)
            .then(r => {
               if (!r.ok) throw new Error("Laden fehlgeschlagen: " + r.status);
               return r.json();
            })
            .then(arr => {
               // arr = Array von Büchern (bereits gefiltert, falls URL Filter enthielt)
               this._dataAll = Array.isArray(arr) ? arr : [];
               this._setPage(1);      // immer auf die erste Seite springen
            })
            .catch(e => sap.m.MessageToast.show(e.message))
            .finally(() => this._setBusy(false));
      },


      /* ---------- Dialog ---------- */
      // WICHTIG: async
      onAdd: async function () {
         if (!this._pAdd) {
            // Fragment lazy laden + cachen
            this._pAdd = Fragment.load({
               id: this.getView().getId(),                 // macht IDs view-lokal
               name: "bookmanager.view.AddBookDialog",     // Pfad: webapp/view/AddBookDialog.fragment.xml
               controller: this                            // Events binden an DIESEN Controller
            }).then(d => {
               this.getView().addDependent(d);
               return d;
            });
         }

         try {
            const dlg = await this._pAdd;                 // Promise -> Dialog
            // Formular zurücksetzen
            this.getView().getModel("new").setData(this._blankBook());
            dlg.open();
         } catch (e) {
            MessageToast.show("Dialog-Laden fehlgeschlagen: " + e.message);
            console.error(e);
         }
      },


      /* ---------- Dialog-Events ---------- */
      // Dialoge schließen
      onCancelNew: function () {
         const dlg = this.byId("addDialog");            // id="addDialog" im Fragment
         if (dlg) dlg.close();
      },

      // Edit-Dialog schließen
      onCancelEdit: function () {
         // funktioniert nur, wenn das Fragment mit id: this.getView().getId() geladen wurde
         this.byId("editDialog").close();
      },


      /* ---------- Speichern ---------- */
      // Speichern eines neuen Buches
      onSaveNew: function () {
         const oData = this.getView().getModel("new").getData();

         // Minimale Validierung
         if (!oData.title || !oData.author) {
            MessageToast.show("Titel und Autor sind Pflichtfelder");
            return;
         }

         // leeres Datum -> heute
         if (!oData.created) {
            oData.created = new Date().toISOString().slice(0, 10);
         }

         fetch(API + "/books", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(oData)
         })
            .then(r => {
               if (!r.ok) { throw new Error(r.statusText); }
               return r.json();
            })
            .then(() => {
               this.byId("addDialog").close();
               this.onRefresh();
               MessageToast.show("Buch gespeichert");
            })
            .catch(err => MessageToast.show("Fehler: " + err.message));
      },


      /* ---------- Löschen ---------- */
      onDelete: function () {
         const oTable = this.byId("tblBooks");
         const oItem = oTable.getSelectedItem();
         if (!oItem) { MessageToast.show("Nichts ausgewählt"); return; }
         const id = oItem.getBindingContext("books").getProperty("id");

         MessageBox.confirm(oItem.getBindingContext("books").getProperty("title") + " wirklich löschen?", {
            actions: [MessageBox.Action.DELETE, MessageBox.Action.CANCEL],
            emphasizedAction: MessageBox.Action.DELETE,
            onClose: (act) => {
               if (act !== MessageBox.Action.DELETE) return;
               fetch(`${API}/books/${id}`, { method: "DELETE" })
                  .then(r => { if (!r.ok) throw new Error("Delete fehlgeschlagen"); })
                  .then(() => { this.onRefresh(); MessageToast.show("Buch gelöscht"); })
                  .catch(e => MessageToast.show(e.message));
            }
         });
      },


      /* ---------- Export als CSV ---------- */
      onExport: function () {
         // 1) Zeilenquelle bestimmen
         // Falls Pagination aktiv ist, liegt alles gefilterte in _dataAll
         let rows = Array.isArray(this._dataAll) ? this._dataAll : null;

         // Fallback: aus dem Model holen (unterstützt beide Formen: Array ODER {items,...})
         if (!rows) {
            const m = this.getOwnerComponent().getModel("books");
            const data = m.getData();
            if (Array.isArray(data)) {
               rows = data;
            } else if (data && Array.isArray(data.items)) {
               rows = data.items;
            } else {
               rows = [];
            }
         }

         if (!rows.length) {
            sap.m.MessageToast.show("Keine Daten zum Exportieren");
            return;
         }

         // 2) CSV bauen
         const cols = ["id", "title", "author", "created", "creator"];
         const esc = v => `"${String(v ?? "").replace(/"/g, '""')}"`;

         const header = cols.join(",");
         const lines = rows.map(r => cols.map(k => esc(r[k])).join(","));
         const csv = [header].concat(lines).join("\r\n");

         // 3) Download auslösen
         const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
         const url = URL.createObjectURL(blob);
         const a = document.createElement("a");
         a.href = url;
         a.download = "books.csv";
         a.click();
         URL.revokeObjectURL(url);
      },




      /*---------- Edit-Dialog mit Model für das selektierte Buch ---------- */
      onEdit: async function () {
         const oTable = this.byId("tblBooks");
         const oCtx = oTable.getSelectedItem()?.getBindingContext("books");
         if (!oCtx) { MessageToast.show("Nichts ausgewählt"); return; }

         if (!this._pEdit) {          // Fragment lazy laden
            this._pEdit = Fragment.load({
               id: this.getView().getId(),
               name: "bookmanager.view.EditBookDialog",
               controller: this
            }).then(d => { this.getView().addDependent(d); return d; });
         }
         const oDialog = await this._pEdit;
         this.getView().setModel(new JSONModel(oCtx.getObject()), "edit");
         oDialog.open();
      },

      /* ---------- Edit-Dialog-Events ---------- */
      // Edit-Dialog schließen
      onSaveEdit: function () {
         const oData = this.getView().getModel("edit").getData();

         // Minimale Validierung
         if (!oData.title || !oData.author) {
            MessageToast.show("Titel und Autor sind Pflichtfelder");
            return;
         }

         fetch(API + "/books/" + oData.id, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(oData)
         }).then(() => {
            this.byId("editDialog").close();
            this.onRefresh();
            MessageToast.show("Änderungen gespeichert");
         });
      },

      /* ------------ Filter ------------ */
      _applyFilter: function () {
         const API = "http://localhost:8000";
         const q = this.byId("search").getValue().trim();
         const drs = this.byId("drs");
         const from = drs.getDateValue();
         const to = drs.getSecondDateValue();

         let url = API + "/books";
         const p = [];
         if (q) p.push("q=" + encodeURIComponent(q));
         if (from) p.push("created_from=" + from.toISOString().slice(0, 10));
         if (to) p.push("created_to=" + to.toISOString().slice(0, 10));
         if (p.length) url += "?" + p.join("&");

         this._loadBooks(url);
      },
      onFilter: function () { this._applyFilter(); },



      _setPage(p) {
         const total = this._dataAll.length;
         const pageSize = this._PAGE_SIZE;
         const totalPages = Math.max(1, Math.ceil(total / pageSize));
         const page = Math.min(Math.max(1, p), totalPages);
         const start = (page - 1) * pageSize;
         const end = start + pageSize;
         const items = this._dataAll.slice(start, end);

         // books-Model auf Objekt setzen (items + Meta)
         const m = this.getOwnerComponent().getModel("books");
         m.setData({ items, total, page, totalPages });

         // Buttons aktivieren/deaktivieren
         this.byId("btnPrev").setEnabled(page > 1);
         this.byId("btnNext").setEnabled(page < totalPages);
      },

      onPagePrev() { this._setPage((this.getOwnerComponent().getModel("books").getProperty("/page") || 1) - 1); },
      onPageNext() { this._setPage((this.getOwnerComponent().getModel("books").getProperty("/page") || 1) + 1); },


   });
});
