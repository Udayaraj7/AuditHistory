

sap.ui.define([
    "sap/ui/core/mvc/ControllerExtension",
    "sap/ui/core/Element",
    "sap/ui/model/json/JSONModel",
    "sap/m/RadioButton",
    "sap/m/HBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (
    ControllerExtension,
    Element,
    JSONModel,
    RadioButton,
    HBox,
    Filter,
    FilterOperator
) {
    "use strict";

    return ControllerExtension.extend("project1.ext.controller.CustomerObject", {

        override: {
            onInit: function () {
                const oModeModel = new JSONModel({
                    mode: "Msg"
                });
                this.base.getView().setModel(oModeModel, "mode");
            },
            routing:{
                         onAfterBinding: function () {
                           // debugger;
                // console.log("Object Page bound again");

                // let oTable = sap.ui.core.Element.getElementById(
                //     "project1::CustomerObjectPage--fe::table::CustomerToOrders::LineItem::Orders-innerTable"
                // );

                // if (oTable) {

                //     oTable.attachEvent("updateFinished", function () {
                //         debugger;

                //         let items = oTable.getItems();
                //         console.log("Items after updateFinished:", items.length);

                //         if (items.length > 0) {

                //             let edit = sap.ui.core.Element.getElementById(
                //                 "project1::CustomerObjectPage--fe::StandardAction::Edit"
                //             );

                //             if (edit) {
                //                 edit.setVisible(false);
                //                 console.log("Edit button hidden successfully");
                //             }
                //         }

                //     });

                // }
            }
            },

            onAfterRendering: function () {
                debugger;

                // let oTable = sap.ui.core.Element.getElementById("project1::CustomerObjectPage--fe::table::CustomerToOrders::LineItem::Orders-innerTable");

                // if (oTable) {
                //     oTable.attachEventOnce("updateFinished", () => {
                //         let items = oTable.getItems();
                //         console.log("Items after updateFinished:", items.length);

                //         if (items.length > 0) {
                //             // Hide Edit button
                //             let edit = sap.ui.core.Element.getElementById("project1::CustomerObjectPage--fe::StandardAction::Edit");
                //             if (edit) {
                //                 edit.setVisible(false);
                //                 console.log("Edit button hidden successfully");
                //             }
                //         }
                //     }); 
                // }


                this._attachTableDelegate();
            },

            editFlow: {
                onBeforeSave: function (mParameters) {
                    debugger;
                    console.log("before save")
                },
                onAfterSave: function (mParameters) {

                    // Wait a bit to ensure the button is rendered
                    // setTimeout(() => {
                    //     // Try to get the button
                    //     let edit = sap.ui.core.Element.getElementById("project1::CustomerObjectPage--fe::StandardAction::Edit");

                    //     if (edit) {
                    //         edit.setVisible(false); // hide it
                    //         console.log("Edit button hidden successfully");
                    //     } else {
                    //         console.warn("Edit button not found");
                    //     }
                    // }, 500);

                }

            }
        },

        _attachTableDelegate: function () {
            debugger;
            const sTableId = "project1::CustomerObjectPage--fe::table::CustomerToOrders::LineItem::Orders-innerTable";
            const oTable = Element.getElementById(sTableId);

            if (!oTable) {
                setTimeout(this._attachTableDelegate.bind(this), 400);
                return;
            }

            if (oTable._customDelegateAttached) return;
            oTable._customDelegateAttached = true;

            oTable.addEventDelegate({
                onAfterRendering: () => {
                    this._setHeaderRadios(oTable);
                    this._applyDropdownFilter(oTable);
                }
            });
        },

        /* ======================================================= */
        /* FIXED HEADER LOGIC                                      */
        /* ======================================================= */
        _setHeaderRadios: function (oTable) {
            oTable.getColumns().forEach((oColumn) => {
                const oHeader = oColumn.getHeader();
                const sColumnId = oColumn.getId();

                // 1. Identify the column: 
                // We check if ID contains 'msgValue' (your property) OR if text is 'Msg'
                const bIsMsgColumn = sColumnId.includes("msgValue") || (oHeader?.getText?.() === "Msg");

                if (bIsMsgColumn) {
                    // 2. Prevent overwriting if HBox is already there
                    if (oHeader && oHeader.isA("sap.m.HBox")) {
                        return;
                    }

                    // 3. Apply the Radio Buttons
                    oColumn.setHeader(this._createDualRadioHeader(oTable));
                }
            });
        },

        _createDualRadioHeader: function (oTable) {
            const sCurrentMode = this.getView().getModel("mode").getProperty("/mode");

            return new HBox({
                alignItems: "Center",
                items: [
                    new RadioButton({
                        text: "Msg",
                        groupName: "headerGroup",
                        selected: sCurrentMode === "Msg",
                        select: (oEvent) => {
                            if (oEvent.getParameter("selected")) {
                                this._onRadioChange("Msg", oTable);
                            }
                        }
                    }),
                    new RadioButton({
                        text: "Valuefit",
                        groupName: "headerGroup",
                        selected: sCurrentMode === "Valuefit",
                        select: (oEvent) => {
                            if (oEvent.getParameter("selected")) {
                                this._onRadioChange("Valuefit", oTable);
                            }
                        }
                    })
                ]
            });
        },

        _onRadioChange: function (sMode, oTable) {
            this.getView().getModel("mode").setProperty("/mode", sMode);
            this._applyDropdownFilter(oTable);
        },

        /* ======================================================= */
        /* FILTER LOGIC (SEARCHING INSIDE VBOX)                    */
        /* ======================================================= */
        
  _applyDropdownFilter: function (oTable) {
            const sMode = this.getView().getModel("mode").getProperty("/mode");
            const sPrefix = (sMode === "Msg") ? "msg" : "vfit";
            const oFilter = new Filter("value", FilterOperator.StartsWith, sPrefix);

            debugger;
            oTable.getItems().forEach((oRow) => {
                let oMCB = null;

                // Loop through cells to find the MultiComboBox (even if inside VBox)
                oRow.getCells().forEach(oCell => {
                    debugger
                    if (oCell.isA("sap.m.MultiComboBox")) {
                        oMCB = oCell;
                    } else if (oCell.isA("sap.m.VBox")) {
                        oMCB = oCell.getItems().find(ctrl => ctrl.isA("sap.m.MultiComboBox"));
                    }
                });
                debugger

                if (oMCB) {
                    const oBinding = oMCB.getBinding("items");
                    if (oBinding) {
                        oBinding.filter([oFilter]);
                    } else {
                        // Fallback for lazy loading in V4
                        oMCB.attachEventOnce("open", () => {
                            oMCB.getBinding("items").filter([oFilter]);
                        });
                    }
                }
            });
        },


      


        //             _applyDropdownFilter: function (oTable) {
        //                 debugger
        //     const sMode = this.getView().getModel("mode").getProperty("/mode");
        //     const sPrefix = (sMode === "Msg") ? "msg" : "vfit";

        //     oTable.getItems().forEach((oRow) => {
        //         debugger
        //         let oMCB = null;

        //         // 1. Find the MultiComboBox (check VBox and direct Cell)
        //         oRow.getCells().forEach(oCell => {
        //             debugger
        //             if (oCell.isA("sap.m.MultiComboBox")) {
        //                 oMCB = oCell;
        //             } else if (oCell.isA("sap.m.VBox")) {
        //                 oMCB = oCell.getItems().find(ctrl => ctrl.isA("sap.m.MultiComboBox"));
        //             }
        //         });

        //         if (oMCB) {
        //             // 2. Get currently selected keys (both Msg and Vfit)
        //             const aSelectedKeys = oMCB.getSelectedKeys() || [];

        //             // 3. Create the Prefix Filter (e.g., starts with 'msg')
        //             const oPrefixFilter = new Filter("value", FilterOperator.StartsWith, sPrefix);

        //             // 4. Create "Stay Visible" filters for already selected items
        //             const aKeepSelectedFilters = aSelectedKeys.map(sKey => {
        //                 return new Filter("value", FilterOperator.EQ, sKey);
        //             });

        //             // 5. Combine with 'OR' (and: false)
        //             // Logic: Show if (Starts with Prefix) OR (Is already selected)
        //             const oCombinedFilter = new Filter({
        //                 filters: [oPrefixFilter, ...aKeepSelectedFilters],
        //                 and: false 
        //             });

        //             const oBinding = oMCB.getBinding("items");
        //             if (oBinding) {
        //                 oBinding.filter(oCombinedFilter);
        //             } else {
        //                 // Handle lazy loading: filter as soon as user opens it
        //                 oMCB.attachEventOnce("open", () => {
        //                     oMCB.getBinding("items").filter(oCombinedFilter);
        //                 });
        //             }
        //         }
        //     });
        // }



    });
});
