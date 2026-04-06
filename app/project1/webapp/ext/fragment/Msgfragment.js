sap.ui.define([
    "sap/m/MessageToast",
    "sap/ui/core/ValueState",
    "sap/m/Token",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (MessageToast, ValueState, Token, Filter, FilterOperator) {
    "use strict";
 
    return {
 
      //2. READ DATA: Solves the Async Empty Data Issue
        onModelContextChange: function (oEvent) {
            debugger
            var oMultiInput = oEvent.getSource();
            var oContext = oMultiInput.getBindingContext();
 
            // Unbind previous listener to prevent table row recycling glitches
            oMultiInput.unbindProperty("tooltip");
 
            if (oContext) {
                // 🟢 THE TRICK: Bind the tooltip to msgValue.
                // UI5's binding engine will automatically call this formatter exactly when the data arrives!
                oMultiInput.bindProperty("tooltip", {
                    path: "msgValue",
                    formatter: function (sValue) {
                        var bIsActive = oContext.getProperty("IsActiveEntity");
                        var bIsEditable = !bIsActive;
 
                        // Check current tokens to avoid rebuilding if nothing changed (prevents crashing)
                        var aTokens = oMultiInput.getTokens();
                        var sCurrentKeys = aTokens.map(function (t) { return t.getKey(); }).join("|");
 
                        if (sValue === sCurrentKeys && aTokens.length > 0) {
                            if (aTokens[0].getEditable() === bIsEditable) {
                                return sValue ? "Selected: " + sValue.split("|").join(", ") : "No selection";
                            }
                        }
 
                        // Clear and rebuild visual tokens
                        oMultiInput.removeAllTokens();
 
                        if (sValue) {
                            var aKeys = sValue.split("|");
                            aKeys.forEach(function (sKey) {
                                if (sKey && sKey.trim() !== "") {
                                    oMultiInput.addToken(new Token({
                                        key: sKey.trim(),
                                        text: sKey.trim(),
                                        editable: bIsEditable // Hides the "X" if saved
                                    }));
                                }
                            });
                        }
 
                        // Bonus: Hovering over the input will show a clean list of selected items!
                        return sValue ? "Selected: " + sValue.split("|").join(", ") : "No selection";
                    }
                });
            }
        },
 
        onValueHelpRequest: function (oEvent) {
            var oMultiInput = oEvent.getSource();
            var oDialog = oMultiInput.getDependents()[0];
            var oInternalList = oDialog.getAggregation("_dialog").getContent()[1];
 
            var oModel = oMultiInput.getModel();
            if (oModel) {
                oDialog.setModel(oModel);
            }
 
            var oBinding = oDialog.getBinding("items");
            if (oBinding) {
                oBinding.filter([]);
            }
            oDialog.clearSelection();
 
          
 
            // ─── DEDUPLICATE LIST ITEMS ──────────────────────────────────────────────
            var fnDeduplicateItems = function () {
                var aSeen = {};
                // getItems() returns the visible StandardListItems inside the dialog
                oDialog.getItems().forEach(function (oItem) {
                    var sTitle = oItem.getTitle();
                    if (aSeen[sTitle]) {
                        // Duplicate found — remove it from the dialog list
                       // oDialog.removeItem(oItem);
                      
                    } else {
                        aSeen[sTitle] = true;
                    }
                });
            };
 


//             var fnSelectionLimitGuard = function (oEvent) {
//     var oItem = oEvent.getParameter("listItem");
//     var bSelected = oEvent.getParameter("selected");
//     if (!bSelected) return;

//     var sSelectedValue = oItem.getTitle();

//     // 🔹 1. Get already selected tokens from MultiInput
//     var aExistingTokens = oMultiInput.getTokens();
//     var aExistingValues = aExistingTokens.map(function (oToken) {
//         return oToken.getKey();
//     });

//     // 🔹 2. Check if already selected earlier
//     if (aExistingValues.includes(sSelectedValue)) {
//         oItem.setSelected(false); // ❌ prevent selection
//         sap.m.MessageToast.show("Value already selected");
//         return;
//     }

//     // 🔹 3. Check selection limit (your existing logic)
//     var iSelectedCount = oDialog.getItems().filter(function (o) {
//         return o.getSelected();
//     }).length;

//     if (iSelectedCount > 30) {
//         oItem.setSelected(false);
//         sap.m.MessageToast.show("Maximum 30 values allowed.");
//     } else {
//         oMultiInput.setValueState(sap.ui.core.ValueState.None);
//         oMultiInput.setValueStateText("");
//     }
// };

var fnSelectionLimitGuard = function (oEvent) {
    var oItem = oEvent.getParameter("listItem");
    var bSelected = oEvent.getParameter("selected");
    if (!bSelected) return;
 
    var sSelectedValue = oItem.getTitle();
 
    // 1. Get already saved tokens from MultiInput
    var aExistingTokens = oMultiInput.getTokens();
    var aExistingValues = aExistingTokens.map(function (oToken) {
        return oToken.getKey();
    });
 
    // 2. Block if this value is already saved as a token
    if (aExistingValues.includes(sSelectedValue)) {
        oItem.setSelected(false);
        sap.m.MessageToast.show("'" + sSelectedValue + "' is already selected.");
        return;
    }
 
    // 3. Count items currently checked inside the dialog
    var iDialogSelectedCount = oDialog.getItems().filter(function (o) {
        return o.getSelected();
    }).length;
 
    // 4. ✅ KEY FIX: Total = existing saved tokens + newly checked items in dialog
    var iTotalSelected = aExistingValues.length + iDialogSelectedCount;
 
    if (iTotalSelected > 30) {
        oItem.setSelected(false);
        sap.m.MessageToast.show(
            "Maximum 30 values allowed. You have " +
            aExistingValues.length + " saved and can select " +
            (30 - aExistingValues.length) + " more."
        );
    } else {
        oMultiInput.setValueState(sap.ui.core.ValueState.None);
        oMultiInput.setValueStateText("");
    }
};
 
            // ─── DETACH STALE LISTENERS ──────────────────────────────────────────────
            if (oInternalList) {
                // if (oDialog._fnSyncSelections) {
                //     oInternalList.detachUpdateFinished(oDialog._fnSyncSelections);
                // }
                if (oDialog._fnDeduplicateItems) {
                    oInternalList.detachUpdateFinished(oDialog._fnDeduplicateItems);  // ← clean up
                }
                if (oDialog._fnSelectionLimitGuard) {
                    oInternalList.detachSelectionChange(oDialog._fnSelectionLimitGuard);
                }
 
                // Store references for cleanup on next open
               
                oDialog._fnDeduplicateItems = fnDeduplicateItems;             // ← store ref
                oDialog._fnSelectionLimitGuard = fnSelectionLimitGuard;
 
                // Deduplication runs FIRST, then selection sync
                oInternalList.attachUpdateFinished(fnDeduplicateItems);       // ← attach               
                oInternalList.attachSelectionChange(fnSelectionLimitGuard);
            }
 
            oDialog.open();
 
            if (oBinding) {
                if (oBinding.getLength() > 0) {
                    setTimeout(function () {
                        fnDeduplicateItems();   // ← also run for cached data
                        // fnSyncSelections();
                    }, 0);
                } else {
                    oBinding.attachEventOnce("dataReceived", function () {
                        fnDeduplicateItems();
                        // fnSyncSelections();
                    });
                }
            }
        },
        // SEARCH
        onValueHelpSearch: function (oEvent) {
            debugger
            var sValue = oEvent.getParameter("value");
 
            var oFilter = new Filter({
                filters: [
                    new Filter("value", FilterOperator.Contains, sValue),
                   
                ],
                and: false
            });
 
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([oFilter]);
        },
 
        //  WRITE DATA (CONFIRM)
        // onValueHelpConfirm: function (oEvent) {
        //     debugger
        //     var aSelectedContexts = oEvent.getParameter("selectedContexts");
        //     var oMultiInput = oEvent.getSource().getParent();
 
 
 
        //    // oMultiInput.setValueState(ValueState.None);
        //   //  oMultiInput.removeAllTokens();
 
        //     var aValues = [];
 
        //     aSelectedContexts.forEach(function (oContext) {
        //         var oData = oContext.getObject();
 
        //         oMultiInput.addToken(new Token({
        //             key: oData.value,
        //             text: oData.value
        //         }));
 
        //         aValues.push(oData.value);
        //     });
 
        //     var sConcatenated = aValues.join("|");
        //     var oCtx = oMultiInput.getBindingContext();
 
        //     if (oCtx) {
        //         oCtx.setProperty("msgValue", sConcatenated);
        //     }
        // },
//         handleValueHelpClose: function (oEvent) {
//     var oMultiInput = oEvent.getSource().getParent();
//     var aSelectedContexts = oEvent.getParameter("selectedContexts") || [];

//     //  Step 1: Get existing tokens
//     var aExistingTokens = oMultiInput.getTokens();
//     var aExistingValues = aExistingTokens.map(function (oToken) {
//         return oToken.getKey();
//     });

//     //  Step 2: Collect new values
//     var aNewValues = [];
//     aSelectedContexts.forEach(function (oContext) {
//         var oData = oContext.getObject();
//         if (oData && oData.value) {
//             aNewValues.push(oData.value);
//         }
//     });

//     //  Step 3: Merge + deduplicate
//     var aFinalValues = Array.from(new Set([...aExistingValues, ...aNewValues]));

//     //  Step 4: Rebuild tokens (clean way)
//     oMultiInput.removeAllTokens();

//     aFinalValues.forEach(function (sValue) {
//         oMultiInput.addToken(new sap.m.Token({
//             key: sValue,
//             text: sValue
//         }));
//     });

//     //  Step 5: Update model property
//     var sConcatenated = aFinalValues.join("|");
//     var oCtx = oMultiInput.getBindingContext();

//     if (oCtx) {
//         oCtx.setProperty("msgValue", sConcatenated);
//     }
// },
handleValueHelpClose: function (oEvent) {
    var oMultiInput = oEvent.getSource().getParent();
    var aSelectedContexts = oEvent.getParameter("selectedContexts") || [];

    // Step 1: Get existing tokens
    var aExistingTokens = oMultiInput.getTokens();
    var aExistingValues = aExistingTokens.map(function (oToken) {
        return oToken.getKey();
    });

    // Step 2: Collect new values
    var aNewValues = [];
    aSelectedContexts.forEach(function (oContext) {
        var oData = oContext.getObject();
        if (oData && oData.value) {
            aNewValues.push(oData.value);
        }
    });

    // Step 3: Merge + deduplicate
    var aFinalValues = Array.from(new Set([...aExistingValues, ...aNewValues]));

    // Step 4: Update model property
    var sConcatenated = aFinalValues.join("|");
    var oCtx = oMultiInput.getBindingContext();

    if (oCtx) {
        oCtx.setProperty("msgValue", sConcatenated);

        
        oMultiInput.removeAllTokens();

        aFinalValues.forEach(function (sValue) {
            if (sValue && sValue.trim() !== "") {
                oMultiInput.addToken(new Token({
                    key: sValue.trim(),
                    text: sValue.trim(),
                   
                }));
            }
        });
    }
},
 
        //  REMOVE TOKEN
        onTokenUpdate: function (oEvent) {
            debugger
            if (oEvent.getParameter("type") === "removed") {
                var oMultiInput = oEvent.getSource();
                var aRemovedTokens = oEvent.getParameter("removedTokens");
 
                var aRemainingTokens = oMultiInput.getTokens().filter(function (oToken) {
                    return aRemovedTokens.indexOf(oToken) === -1;
                });
 
                var aValues = aRemainingTokens.map(function (oToken) {
                    return oToken.getKey();
                });
 
                var sConcatenated = aValues.join("|");
                var oCtx = oMultiInput.getBindingContext();
 
                if (oCtx) {
                    oCtx.setProperty("msgValue", sConcatenated);
                }
 
                if (aRemainingTokens.length <= 30) {
                    oMultiInput.setValueState(ValueState.None);
                }
            }
        }
    };
});
 