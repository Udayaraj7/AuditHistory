// function getDistinctWithDate(aData, sField) {
//     const oMap = new Map();

//     aData.forEach(record => {
//         const sValue = record[sField];
//         if (!oMap.has(sValue)) {
//             oMap.set(sValue, {
//                 value: sValue,
//                 createdAt: record.createdAt,
//                 createdAtFormatted: record.createdAtFormatted
//             });
//         }
//     });

//     return Array.from(oMap.values());
// }

// sap.ui.define([
//     "sap/m/Dialog",
//     "sap/m/Table",
//     "sap/m/Column",
//     "sap/m/ColumnListItem",
//     "sap/m/Text",
//     "sap/m/Button",
//     "sap/ui/model/json/JSONModel"
// ], function (
//     Dialog,
//     Table,
//     Column,
//     ColumnListItem,
//     Text,
//     Button,
//     JSONModel
// ) {
//     "use strict";

//     return {

//         onShowHistory: function (oEvent) {
//             const that = this;

//             const oSource = oEvent.getSource();
//             const sField = oSource.data("field");
//             const oCtx = oSource.getBindingContext();
//             const sCustomerId = oCtx.getProperty("customerId");

//             $.ajax({
//                 url: "/odata/v4/myservice/AuditHistoryCustomer?$filter=customerId eq '" + sCustomerId + "'",
//                 type: "GET",
//                 contentType: "application/json",

//                 success: function (data) {

//                     let aCustomerData = data.value;

//                     // Sort DESC by createdAt
//                     aCustomerData.sort((a, b) =>
//                         new Date(b.createdAt) - new Date(a.createdAt)
//                     );

//                     // Format Date
//                     aCustomerData.forEach(r => {
//                         const dt = new Date(r.createdAt);
//                         r.createdAtFormatted =
//                             dt.getDate().toString().padStart(2, "0") + "-" +
//                             dt.toLocaleString("default", { month: "short" }) + "-" +
//                             dt.getFullYear() + " " +
//                             dt.getHours().toString().padStart(2, "0") + ":" +
//                             dt.getMinutes().toString().padStart(2, "0");
//                     });

//                     console.log(aCustomerData);

//                     // DISTINCT by field
//                     const aDistinctData = getDistinctWithDate(aCustomerData, sField);
//                     console.log("------------------------------------------------------------")

//                     console.log(aDistinctData);



//                     // Destroy previous dialog
//                     if (that._oAuditDialog) {
//                         that._oAuditDialog.destroy();
//                     }

//                     // Model
//                     const oModel = new JSONModel(aDistinctData);

//                     // TABLE
//                     const oTable = new Table({
//                         inset: false,
//                         growing: true,
//                         growingScrollToLoad: true,
//                         columns: [
//                             new Column({
//                                 header: new Text({ text: "Value" })
//                             }),
//                             new Column({
//                                 header: new Text({ text: "Changed On" })
//                             })
//                         ]
//                     });

//                     oTable.bindItems({
//                         path: "/",
//                         template: new ColumnListItem({
//                             cells: [
//                                 new Text({ text: "{value}" }),
//                                 new Text({ text: "{createdAtFormatted}" })
//                             ]
//                         })
//                     });

//                     oTable.setModel(oModel);

//                     // DIALOG
//                     that._oAuditDialog = new Dialog({
//                         title: "Audit History",
//                         draggable: true,
//                         resizable: true,
//                         contentWidth: "14rem",
//                         contentHeight: "8rem",
//                         content: [oTable],
//                         endButton: new Button({
//                             text: "Close",
//                             icon: "sap-icon://decline",
//                             press: function () {
//                                 that._oAuditDialog.close();
//                             }
//                         })
//                     });

//     const oView = oEvent.getSource().getParent().getParent();

// oView.addDependent(that._oAuditDialog);
// that._oAuditDialog.open();

//                 },

//                 error: function (err) {
//                     console.error("Audit history fetch failed", err);
//                 }
//             });
//         }
//     };
// });


sap.ui.define([
    "sap/m/Dialog",
    "sap/m/Table",
    "sap/m/Column",
    "sap/m/ColumnListItem",
    "sap/m/Text",
    "sap/m/Button",
    "sap/ui/model/json/JSONModel",
    "sap/m/ObjectStatus",
    "sap/m/VBox",
], function (
    Dialog,
    Table,
    Column,
    ColumnListItem,
    Text,
    Button,
    JSONModel,
    ObjectStatus,
    VBox
) {
    "use strict";

    return {

        onShowHistory: function (oEvent) {
            const that = this;

            const oSource = oEvent.getSource();
            const sField = oSource.data("field");
            const oCtx = oSource.getBindingContext();
            const sCustomerId = oCtx.getProperty("customerId");

            $.ajax({
                url: "/odata/v4/myservice/AuditHistory?$filter=customerId eq '"
                    + sCustomerId +
                    "' and fieldName eq '"
                    + sField + "'"
                ,
                type: "GET",
                contentType: "application/json",

                success: function (data) {

                    let aCustomerData = data.value;

                    // Sort DESC by createdAt
                    aCustomerData.sort((a, b) =>
                        new Date(b.createdAt) - new Date(a.createdAt)
                    );

                    // Format Date
                    aCustomerData.forEach(r => {
                        const dt = new Date(r.createdAt);
                        r.createdAtFormatted =
                            dt.getDate().toString().padStart(2, "0") + "-" +
                            dt.toLocaleString("default", { month: "short" }) + "-" +
                            dt.getFullYear() + " " +
                            dt.getHours().toString().padStart(2, "0") + ":" +
                            dt.getMinutes().toString().padStart(2, "0");
                    });

                    console.log(aCustomerData);





                    // Destroy previous dialog
                    if (that._oAuditDialog) {
                        that._oAuditDialog.destroy();
                    }

                    // Model
                    const oModel = new JSONModel(aCustomerData);

                    // Table
                    const oTable = new Table({
                        inset: false,
                        growing: true,
                        growingScrollToLoad: true,
                        noDataText: "No audit changes recorded for this field.",
                        columns: [
                            new Column({
                                header: new Text({ text: "Previous Value" })
                            }),
                            new Column({
                                header: new Text({ text: "Changed On" })
                            })
                        ]
                    });

                    oTable.bindItems({
                        path: "/",
                        template: new ColumnListItem({
                            cells: [
                                new Text({ text: "{value}" }),
                                new ObjectStatus({
                                    text: "{createdAtFormatted}",
                                    state: "Information"
                                })
                            ]
                        })
                    });

                    oTable.setModel(oModel);

                    // Dialog Content Wrapper
                    const oContent = new VBox({
                        class: "sapUiSmallMargin",
                        items: [
                            oTable
                        ]
                    });

                    // Dialog
                    that._oAuditDialog = new Dialog({
                        title: "Audit History",
                        titleAlignment: "Center",
                        draggable: true,
                        resizable: true,
                        contentWidth: "16rem",
                        contentHeight: "auto",
                        content: oContent,
                        endButton: new Button({
                            text: "Close",
                            type: "Emphasized",
                            press: function () {
                                that._oAuditDialog.close();
                            }
                        })
                    });

                    // Attach to view
                    const oView = oEvent.getSource().getParent().getParent();
                    oView.addDependent(that._oAuditDialog);
                    that._oAuditDialog.open();


                },

                error: function (err) {
                    console.error("Audit history fetch failed", err);
                }
            });
        }
    };
});