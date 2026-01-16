
// function getDistinctWithDate(aData, sField) {
//     const oMap = new Map();

//     // IMPORTANT: data must be sorted DESC by createdAt
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
//     "sap/m/MessageToast"
// ], function(MessageToast) {
//     'use strict';

//     return {
//         /**
//          * Generated event handler.
//          *
//          * @param oEvent the event object provided by the event provider.
//          */
//        onInit: function() {
         
// },
//         onShowHistory: function(oEvent) {
//                 debugger
//             //const sField = oEvent.getSource().data("field");
//             // Here you can call backend for field history
//             //MessageToast.show(`History for ${sField}`);

//             const that = this;
//      const oSource = oEvent.getSource();
//     const sField = oSource.data("field");
//     const oCtx = oSource.getBindingContext();

//     const sCustomerId = oCtx.getProperty("customerId");
//     // sap.m.MessageToast.show(
//     //     `History for ${sField} (Customer: ${sCustomerId})`
//     // );


// let aDistinctEmails;
//    $.ajax({
//     url: "/odata/v4/myservice/AuditHistoryCustomer?$filter=customerId eq '" + sCustomerId + "'",
//     type: "GET",
//     contentType: "application/json",
//     success: function (data) {

//         let oCustomerData = data.value;

//         //  Sort
//         oCustomerData.sort((a, b) =>
//             new Date(b.createdAt) - new Date(a.createdAt)
//         );

//         // Formated date 
//         oCustomerData.forEach(record => {
//             const dt = new Date(record.createdAt);
//             record.createdAtFormatted =
//                 dt.getDate().toString().padStart(2, '0') + "-" +
//                 dt.toLocaleString('default', { month: 'short' }) + "-" +
//                 dt.getFullYear() + " " +
//                 dt.getHours().toString().padStart(2, '0') + ":" +
//                 dt.getMinutes().toString().padStart(2, '0');
//         });

//         //  DISTINCT field + createdAt
//          aDistinctEmails = getDistinctWithDate(oCustomerData, sField);

//         console.log(aDistinctEmails);
//        that. openAuditHistoryDialog(aDistinctEmails)
//     },
//     error: function (xhr, status, error) {
//         console.error("Error fetching customer:", status, error);
//     }    
// });







//         },
//         openAuditHistoryDialog: function (aData) {

//     // Destroy old dialog (safe reuse)
//     if (this._oAuditDialog) {
//         this._oAuditDialog.destroy();
//     }

//     // JSON Model
//     const oModel = new sap.ui.model.json.JSONModel(aData);

//     // List with separators
//     const oList = new sap.m.List({
//         separators: "All",
//         items: {
//             path: "/",
//             template: new sap.m.StandardListItem({
//                 title: "{value}",
//                 description: "{createdAtFormatted}",
//                 wrapping: true
//             })
//         }
//     });

//     oList.setModel(oModel);

//     // Dialog
//     this._oAuditDialog = new sap.m.Dialog({
//         title: "Audit History",
//         draggable: true,
//         resizable: true,
//         contentWidth: "35rem",
//         contentHeight: "20rem",
//         verticalScrolling: true,
//         horizontalScrolling: false,
//         content: [oList],
//         endButton: new sap.m.Button({
//             icon: "sap-icon://decline",
//             text: "Close",
//             press: () => this._oAuditDialog.close()
//         })
//     });

//     this.getView().addDependent(this._oAuditDialog);
//     this._oAuditDialog.open();
// }


//     };
// });


//////////////////////////////////////////

sap.ui.define([
    "sap/m/Dialog",
    "sap/m/List",
    "sap/m/StandardListItem",
    "sap/m/Button",
    "sap/ui/model/json/JSONModel"
], function (Dialog, List, StandardListItem, Button, JSONModel) {
    "use strict";

    // ✅ module-level dialog (important for fragment handler)
    let oAuditDialog = null;

    // ✅ helper MUST be inside same module
    function getDistinctWithDate(aData, sField) {
        const oMap = new Map();

        // data must already be sorted DESC
        aData.forEach(record => {
            const sValue = record[sField];
            if (!oMap.has(sValue)) {
                oMap.set(sValue, {
                    value: sValue,
                    createdAt: record.createdAt,
                    createdAtFormatted: record.createdAtFormatted
                });
            }
        });

        return Array.from(oMap.values());
    }

    return {

        onShowHistory: function (oEvent) {
            debugger;

            const oSource = oEvent.getSource();
            const sField = oSource.data("field");

            // default model context (Object Page / View)
            const oCtx = oSource.getBindingContext();
            if (!oCtx) {
                return;
            }

            const sCustomerId = oCtx.getProperty("customerId");

            // ✅ use arrow function → no `that = this` needed
            $.ajax({
                url: "/odata/v4/myservice/AuditHistoryCustomer?$filter=customerId eq '" + sCustomerId + "'",
                type: "GET",
                contentType: "application/json",
                success: (data) => {

                    let oCustomerData = data.value || [];

                    // 1️⃣ sort DESC
                    oCustomerData.sort((a, b) =>
                        new Date(b.createdAt) - new Date(a.createdAt)
                    );

                    // 2️⃣ format date
                    oCustomerData.forEach(record => {
                        const dt = new Date(record.createdAt);
                        record.createdAtFormatted =
                            dt.getDate().toString().padStart(2, "0") + "-" +
                            dt.toLocaleString("default", { month: "short" }) + "-" +
                            dt.getFullYear() + " " +
                            dt.getHours().toString().padStart(2, "0") + ":" +
                            dt.getMinutes().toString().padStart(2, "0");
                    });

                    // 3️⃣ DISTINCT field + date
                    const aDistinctData =
                        getDistinctWithDate(oCustomerData, sField);

                    // 4️⃣ open popup
                    this.openAuditHistoryDialog(aDistinctData);
                },
                error: function (xhr, status, error) {
                    console.error("Audit history fetch failed", error);
                }
            });
        },

        // ✅ dialog function MUST be in same object
        openAuditHistoryDialog: function (aData) {

            // destroy previous dialog
            if (oAuditDialog) {
                oAuditDialog.destroy();
                oAuditDialog = null;
            }

            const oModel = new JSONModel(aData);

            const oList = new List({
                separators: "All",
                items: {
                    path: "/",
                    template: new StandardListItem({
                        title: "{value}",
                        description: "{createdAtFormatted}",
                        wrapping: true
                    })
                }
            });

            oList.setModel(oModel);

            oAuditDialog = new Dialog({
                title: "Audit History",
                draggable: true,
                resizable: true,
                contentWidth: "35rem",
                contentHeight: "20rem",
                verticalScrolling: true,
                content: [oList],
                endButton: new Button({
                    icon: "sap-icon://decline",
                    text: "Close",
                    press: function () {
                        oAuditDialog.close();
                    }
                }),
                afterClose: function () {
                    oAuditDialog.destroy();
                    oAuditDialog = null;
                }
            });

            oAuditDialog.open();
        }
    };
});
