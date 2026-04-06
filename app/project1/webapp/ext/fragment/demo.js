
sap.ui.define(['sap/ui/core/mvc/ControllerExtension', 'sap/m/MessageBox', 'sap/m/Dialog', 'sap/m/Button', 'sap/m/ComboBox', 'sap/m/MultiComboBox', "sap/ui/model/Filter"], function (ControllerExtension, MessageBox, Dialog, Button, ComboBox, MultiComboBox, Filter) {
	'use strict';
	var url;
	var sectorValue;
	var selected_year_global;
	var saved = false;

	return ControllerExtension.extend('vendoronboardrequest.ext.controller.Objectpage', {
		// this section allows to extend lifecycle hooks or hooks provided by Fiori elements
		override: {

			/**
			 * Called when a controller is instantiated and its View controls (if available) are already created.
			 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
			 * @memberOf vendoronboardrequest.ext.controller.Objectpage
			 */
			onInit: function () {
				debugger
				// you can access the Fiori elements extensionAPI via this.base.getExtensionAPI
				var oModel = this.base.getExtensionAPI().getModel();

				var oDropdownModel = new sap.ui.model.json.JSONModel({
					levels: [
						{ key: "R1", text: "R1" },
						{ key: "R2", text: "R2" },
						{ key: "R3", text: "R3" },
						{ key: "R4", text: "R4" },
						{ key: "R5", text: "R5" }
					]
				});

				// Set the model to the view
				this.base.getView().setModel(oDropdownModel, "dropdownForLevel");

				sectorValue = '';
				// this._hasBeenSaved = sessionStorage.getItem("hasBeenSaved");
				// console.log("onInit - hasBeenSaved:", this._hasBeenSaved);
				// console.log("Raw sessionStorage value:", sessionStorage.getItem("hasBeenSaved"));
			},

			onAfterRendering: function (oEvent) {
				debugger;
				// var oTable = sap.ui.core.Element.getElementById("vendoronboardrequest::vobRequestObjectPage--fe::table::vob_yoy::LineItem::YOYAnnualProjection-innerTable");

				

				// ✅ Use a flag on the table itself to ensure one-time init only
				// local variable 'initialized' resets every time onAfterRendering fires — table flag persists
				//if (oTable._filterInitialized) return;

				/* oTable.addEventDelegate({
					onAfterRendering: () => {
						if (oTable._filterInitialized) return;
						oTable._filterInitialized = true;

						this._applyDropdownFilter("MGSP", oTable);

						// if (this._hasBeenSaved) {
						// 	const oRadio = sap.ui.core.Element.getElementById("sRadioButtonGroupId");
						// 	oRadio?.getButtons()[0].setVisible(false);
						// 	oRadio?.getButtons()[1].setVisible(false);
						// }
						// Do NOT re-apply filter on subsequent renders (e.g. new row creation)
						// The fragment's own binding + formatter handles individual row state
					}
				});
				*/
			},

			editFlow: {
				onAfterEdit: async function (mParameters) {
					debugger
					var oMgspTable = sap.ui.core.Element.getElementById("vendoronboardrequest::vobRequestObjectPage--fe::table::vob_yoy::LineItem::YOYAnnualProjection-innerTable");
					var aResult = oMgspTable?.getRows()[0].getCells()[0].getContent().getItems()[1].getSelectedItems();
					if (!aResult.length >= 1) {
						const oRadio = sap.ui.core.Element.getElementById("sRadioButtonGroupId");
						oRadio?.getButtons()[0].setVisible(true);
						oRadio?.getButtons()[1].setVisible(true);
					}
					// Get the Object Page control by its global ID. This is specific to SAP Fiori's UI component structure.
					// If this is in the controller, using 'this.byId("page")' would be better.
					var objpage = sap.ui.getCore().byId("application-vendoronboardsemobject-display-component---ObjectPage--page");

					// Check if the Object Page exists before making changes
					if (objpage) {
						// Hide the footer section of the Object Page after editing.
						// This might be done to prevent further actions or options being available in the footer post-edit.
						objpage.mAggregations.footer.setVisible(false);
					} else {
						// Log a message if the Object Page is not found (optional, for debugging purposes)
						console.warn("Object Page not found.");
					}
				},
				onAfterDiscard: async function () {
					// Using debugger for debugging purposes
					debugger;

					// Retrieve the comment section items from the Object Page using the core UI ID
					// This accesses a fragment that contains a grid, and we're working with its content aggregation
					// var comment_items = sap.ui.getCore().byId("vendoronboardrequest::vobRequestObjectPage--fe::CustomSubSection::Commentfragment").mAggregations._grid.mAggregations.content[0].mAggregations.content.mAggregations.items;

					// // Clear the values of specific comment input fields
					// // First field to clear (assuming this refers to the 2nd item in the aggregation)
					// comment_items[1].mAggregations.items[1].setValue(null);

					// // Second field to clear (assuming this refers to the 3rd item in the aggregation)
					// comment_items[2].mAggregations.items[1].setValue(null);

					const footerWizard = sap.ui.getCore().byId("application-vendoronboardsemobject-display-component---ObjectPage--page");
					if (footerWizard) {
						footerWizard.mAggregations.footer.setVisible(true);
					}
				},
				onBeforeSave: async function (mParameters) {
					debugger;
					var radioCheck;
					var base_url = this.base.getAppComponent().getManifestObject()._oBaseUri.href;

					// ✅ Safer: use getCore().byId or this.byId
					const oRadio = sap.ui.getCore().byId("sRadioButtonGroupId");

					if (oRadio) {
						// ✅ Guard: check getButtons() exists and has items before accessing
						const buttons = oRadio.getButtons ? oRadio.getButtons() : [];
						if (buttons && buttons.length > 0) {
							if (buttons[0].getSelected()) {
								radioCheck = "MGSP Part Nos";
							} else if (buttons[1] && buttons[1].getSelected()) {
								radioCheck = "Value Fit Nos";
							}
						}
					}

					const userActionPromise = new Promise((resolve, reject) => {
						var dialogId = sap.ui.core.Fragment.createId("dialogid");
						var labelId = sap.ui.core.Fragment.createId("labelid");

						var label = new sap.m.Label(labelId, {
							text: "Are you sure you want to submit?",
						}).addStyleClass("labeldialogsave");

						// ✅ Declare warningText outside the if block to avoid ReferenceError
						var dialogContent = [label];

						if (oRadio && radioCheck) {
							var warningText = new sap.m.MessageStrip({
								text: `${radioCheck} cannot be changed after saving.`,
								type: "Warning",
								showIcon: true,
								showCloseButton: false
							}).addStyleClass("sapUiSmallMarginTop");

							dialogContent.push(warningText); // ✅ Push only when it exists
						}

						this.oDialog = new sap.m.Dialog(dialogId, {
							title: "Submit",
							content: dialogContent, // ✅ Use the safe array
							type: "Message",
							beginButton: new sap.m.Button({
								text: "OK",
								press: async function () {
									debugger;
									resolve(true);
									this.oDialog.close();
								}.bind(this)
							}),
							endButton: new sap.m.Button({
								text: "Close",
								press: function () {
									reject(true);
									this.oDialog.close();
								}.bind(this)
							})
						});

						this.oDialog.open();
					});

					const isConfirmed = await userActionPromise;
					debugger;
				},
				onAfterSave: async function (mParameters) {
					debugger;
					console.log("onAfterSave trigerred");
					//Code By Prem
					const oRadio = sap.ui.core.Element.getElementById("sRadioButtonGroupId");
					oRadio?.getButtons()[0].setVisible(false);
					oRadio?.getButtons()[1].setVisible(false);
					// setTimeout(() => {
					// 	debugger;

					// 	var oEditButton = sap.ui.getCore().byId("vendoronboardrequest::vobRequestObjectPage--fe::StandardAction::Edit");
					// 	oEditButton?.setVisible(false);

					// }, 500);
					//Code By Prem
					// Make the footer of the wizard visible after saving
					const footerWizard = sap.ui.getCore().byId("application-vendoronboardsemobject-display-component---ObjectPage--page");
					if (footerWizard) {
						footerWizard.mAggregations.footer.setVisible(true);
					}

					// sap.ui.getCore().byId("vendoronboardrequest::vobRequestObjectPage--fe::StandardAction::Edit").setVisible(false)

					debugger
					// Retrieve the selected year from the form container
					const oFormContainer = sap.ui.getCore().byId("vendoronboardrequest::vobRequestObjectPage--fe::FacetSection::GeneratedFacet1")
						.mAggregations._grid.mAggregations.content[0]
						.mAggregations._grid.mAggregations.content[1]
						.mAggregations.content.mAggregations.content.mAggregations.formContainers[0];

					const selectedYearValue = oFormContainer.getFormElements()[7].mAggregations.fields[0].mProperties.selectedKey;

					// Extract the UUID from the current URL
					const url = window.location.hash;
					const regex = /vobRequest\(id=([a-zA-Z0-9-]+),IsActiveEntity=(true|false)\)/;
					const matches = url.match(regex);
					const extractedUuid = matches ? matches[1] : null; // Handle potential null case

					// Prepare the data for the onSubmit function
					const oFunction3 = this.getView().getModel().bindContext("/onSubmitFunc(...)");
					const statusVal3 = JSON.stringify({
						id: extractedUuid,
						status: "selectedyearsubmit",
						selected_year: selectedYearValue
					});
					oFunction3.setParameter("status", statusVal3);



					// Execute the context binding
					await oFunction3.execute();




					debugger
					//update sector value after save
					sectorValue = oFormContainer.getBindingContext().getProperty("sector");
					// let tempsectorValue = oFormContainer.getFormElements()[3].getFields()[0].getSelectedKeys();
					// sectorValue = tempsectorValue.join(", ");

					// sessionStorage.setItem("hasBeenSaved", "true");
					// this._hasBeenSaved = true;

				},
				onAfterDiscard: async function () {
					// Make the footer of the wizard visible after saving
					const footerWizard = sap.ui.getCore().byId("application-vendoronboardsemobject-display-component---ObjectPage--page");
					if (footerWizard) {
						footerWizard.mAggregations.footer.setVisible(true);
					}
				}
			},


			routing: {
				onAfterBinding: async function () {
					debugger

				

    // ✅ Helper: retry until element is found or timeout
    const waitForElement = (sId, iMaxRetries = 20, iDelay = 300) => {
        return new Promise((resolve, reject) => {
            let iCount = 0;
            const interval = setInterval(() => {
                const oEl = sap.ui.core.Element.getElementById(sId);
                if (oEl) {
                    clearInterval(interval);
                    resolve(oEl);
                } else if (++iCount >= iMaxRetries) {
                    clearInterval(interval);
                    reject(new Error(`Element not found: ${sId}`));
                }
            }, iDelay);
        });
    };

    // ✅ Fallback: find table by iterating all registered elements
    const findTableByPartialId = (sPartial) => {
        const oCore = sap.ui.core.Element;
        const allElements = oCore.registry?.all?.() || {};
        return Object.values(allElements).find(el =>
            el.getId?.().includes(sPartial) && el.isA?.("sap.ui.table.Table")
        );
    };

    let oTable;

    try {
        // Try exact ID first (works in WorkZone)
        oTable = await waitForElement(
            "vendoronboardrequest::vobRequestObjectPage--fe::table::vob_yoy::LineItem::YOYAnnualProjection-innerTable"
        );
    } catch (e) {
        console.warn("Exact ID not found, trying partial match fallback...");
        // Fallback: search by partial ID string
        oTable = findTableByPartialId("YOYAnnualProjection-innerTable");
    }

    if (!oTable) {
        console.error("Table could not be located in this environment.");
        return;
    }

    console.log("Table found:", oTable.getId()); // 👈 Log the actual ID in UAT

   ////////////////////////////////////////////////



				//	const oTable = sap.ui.core.Element.getElementById("vendoronboardrequest::vobRequestObjectPage--fe::table::vob_yoy::LineItem::YOYAnnualProjection-innerTable");

					//	oTable?.getRows()[0].getCells()[0].getContent().getItems();

					// sap.ui.getCore().byId("vendoronboardrequest::vobRequestObjectPage--fe::StandardAction::Edit").setVisible(false)
					const that = this;

					if (!sap.ui.core.Element.getElementById("sRadioButtonGroupId")) {


						const oToolbar = sap.ui.core.Element.getElementById(
							"vendoronboardrequest::vobRequestObjectPage--fe::table::vob_yoy::LineItem::YOYAnnualProjection-toolbar"
						);

						if (oToolbar) {

							if (!oTable) return;

							const aColumns = oTable.getColumns()[0];
							const oRadio = new sap.m.RadioButtonGroup("sRadioButtonGroupId", {
								columns: 2,
								visible: true,

								select: (oEvent) => {

									const iIndex = oEvent.getParameter("selectedIndex");


									localStorage.setItem("vobRadioSelection", iIndex);

									if (iIndex === 0) {
										that._updateColumnHeader("MGSP", aColumns);
										that._applyDropdownFilter("MGSP", oTable);
									} else {
										that._updateColumnHeader("Value Fit", aColumns);
										that._applyDropdownFilter("Value Fit", oTable);
									}
								},

								buttons: [
									new sap.m.RadioButton({ text: "MGSP" }),
									new sap.m.RadioButton({ text: "Value Fit" })
								]
							});
							// oRadio.setSelectedIndex(-1);

							const oAction = new sap.ui.mdc.actiontoolbar.ActionToolbarAction({
								action: oRadio
							});


							const savedIndex = localStorage.getItem("vobRadioSelection");
							const finalIndex = savedIndex !== null ? parseInt(savedIndex) : 0;

							oRadio.setSelectedIndex(finalIndex);

							oTable.attachEventOnce("rowsUpdated", () => {

								if (finalIndex === 0) {
									that._updateColumnHeader("MGSP", aColumns);
									that._applyDropdownFilter("MGSP", oTable);
								} else {
									that._updateColumnHeader("Value Fit", aColumns);
									that._applyDropdownFilter("Value Fit", oTable);
								}

							});

							oToolbar.addAction(oAction);

							// 🔹 Restore saved selection
							// const savedIndex = localStorage.getItem("vobRadioSelection");

							// if (savedIndex !== null) {
							// 	oRadio.setSelectedIndex(parseInt(savedIndex));
							// } else {
							// 	oRadio.setSelectedIndex(0); // default MGSP
							// 	localStorage.setItem("vobRadioSelection", 0);
							// }

							// 🔹 Apply filter AFTER table rows are ready
							oTable.attachEventOnce("rowsUpdated", () => {
								oTable.attachEventOnce("rowsUpdated", () => {

									const selectedIndex = oRadio.getSelectedIndex();

									if (selectedIndex === 0) {
										that._applyDropdownFilter("MGSP", oTable);
									} else {
										that._applyDropdownFilter("Value Fit", oTable);
									}

								});

							});
							debugger;

						}
					}
					debugger
					// Code By PREM//
					var oPageTitle = sap.ui.getCore().byId("vendoronboardrequest::vobRequestObjectPage").getContent()[0].getHeaderTitle();
					oPageTitle.destroyContent();
					oPageTitle.addContent(new sap.m.Title({ text: "{sequentialvobid}", titleStyle: "H1" }));
					debugger;

					// Extract the request ID and IsActiveEntity status from the URL hash
					const url = window.location.hash;
					const regex = /vobRequest\(id=([a-zA-Z0-9-]+),IsActiveEntity=(true|false)\)/;
					const matches = url.match(regex);
					const id = matches[1];
					const isActiveEntity = matches[2] === 'true';




					debugger
					if (isActiveEntity) {
						const oRadio = sap.ui.core.Element.getElementById("sRadioButtonGroupId");

						oRadio?.getButtons()[0].setVisible(false);
						oRadio?.getButtons()[1].setVisible(false);
					}


					oTable.attachEvent("rowsUpdated", function () {

						const bHasActive = oTable.getRows().some(function (oRow) {
							const oContext = oRow.getBindingContext();
							return oContext?.getProperty("HasActiveEntity") === true;
						});

						console.log("At least one row has active:", bHasActive);



						if (!isActiveEntity && bHasActive) {
							const oRadio = sap.ui.core.Element.getElementById("sRadioButtonGroupId");

							oRadio?.getButtons()[0].setVisible(false);
							oRadio?.getButtons()[1].setVisible(false);
						}

					});

					// Fetch the status for the request using the binding context
					const oFunction = this.getView().getModel().bindContext("/getStatusForRequest(...)");
					oFunction.setParameter("vobid", id);
					oFunction.setParameter("isActive", isActiveEntity);
					await oFunction.execute();

					// Get the result status
					debugger;
					const result = oFunction.getBoundContext().getValue().value;



					const oFunction5 = this.getView().getModel().bindContext("/getyeardata(...)");
					oFunction5.setParameter("id", id);
					await oFunction5.execute();
					let finalyearrr = oFunction5.getBoundContext().getValue().value;
					finalyearrr = JSON.parse(finalyearrr)
					var finalyearselected = finalyearrr.vobdata[0].selected_year




					// Access the actions toolbar in the header
					const headerActions = sap.ui.getCore().byId("vendoronboardrequest::vobRequestObjectPage").mAggregations.content[0].mAggregations.headerTitle.mAggregations._actionsToolbar;
					const actions = headerActions.getContent();

					// Enable/disable actions based on the result status
					actions.forEach(action => {
						const actionId = action.getId();
						if (actionId.endsWith("EasyEdit")) {
							action.setVisible(false);

						}
						else if (actionId.endsWith("Edit")) {
							action.setEnabled(result === "New" || result === "Rejected");
						} else {
							action.setVisible(false);
						}
					});




					// Hide a specific form element
					const oFormContainer = sap.ui.getCore().byId("vendoronboardrequest::vobRequestObjectPage--fe::FacetSection::GeneratedFacet1")
						.mAggregations._grid.mAggregations.content[0]
						.mAggregations._grid.mAggregations.content[1]
						.mAggregations.content.mAggregations.content.mAggregations.formContainers[0];
					oFormContainer.mAggregations.formElements[6].setVisible(false);
					debugger
					// Initialize sector field and MultiComboBox
					const sectorField = oFormContainer.getFormElements()[3];
					sectorField.destroyFields();
					let oMultiComboBox;

					// Fetch the selected year and IsActiveEntity status
					const selected_year_val = await oFormContainer.getBindingContext().getBinding().fetchValue("selected_year");

					const IsActiveEntity = await oFormContainer.getBindingContext().getBinding().fetchValue("IsActiveEntity");

					// Create a MultiComboBox based on IsActiveEntity status
					oMultiComboBox = new MultiComboBox({ editable: !IsActiveEntity });

					// Update the MultiComboBox with sector values if binding context exists
					const oBindingContext = oFormContainer.getBindingContext();
					if (oBindingContext) {
						setTimeout(() => {
							if (oBindingContext.getProperty("sector")) {
								sectorValue = oBindingContext.getProperty("sector");
							}
							const sSectorValue = oBindingContext.getProperty("sector") ?? sectorValue;
							console.log("Sector Value: ", sSectorValue);
							if (sSectorValue) {
								// Set selected keys for the MultiComboBox
								oMultiComboBox.setSelectedKeys(sSectorValue.split(", "));
							} else {
								console.log("Sector value is undefined or empty");
							}
						}, 300); // Timeout set for 500 milliseconds
					} else {
						console.error("Binding context is undefined");
					}

					// Attach selection finish event to update the model
					oMultiComboBox.attachSelectionFinish((oEvent) => {
						const aSelectedItems = oEvent.getParameter("selectedItems");
						// if (aSelectedItems && aSelectedItems.length) {
						const aSelectedTexts = aSelectedItems.map(oItem => oItem.getText());
						const sSelectedValues = aSelectedTexts.join(", ");
						const oBindingContext = oEvent.getSource().getBindingContext();
						if (oBindingContext) {
							const sPath = oBindingContext.getPath();
							oBindingContext.setProperty(`${sPath}/sector`, sSelectedValues);
						}
						// }
					});

					// Bind items to the MultiComboBox from the model
					oMultiComboBox.bindItems({
						path: "/Sector_searchhelp",
						sorter: new sap.ui.model.Sorter("sector"),
						template: new sap.ui.core.Item({
							key: "{sector}",
							text: "{sector}"
						})
					});

					// Add the MultiComboBox to the sector field
					sectorField.addField(oMultiComboBox);

					// Check if the form element for Selected Year exists
					const bFormElementExists = oFormContainer.getFormElements().some(oFormElement => {
						const oLabel = oFormElement.getLabel();
						return (typeof oLabel === "string" && oLabel === "Selected Year") ||
							(oLabel && oLabel.getText && oLabel.getText() === "Selected Year");
					});

					// Get the current year
					var currentYear = new Date().getFullYear();
					var currentDate = new Date();
					var currentMonth = currentDate.getMonth() + 1;  // Months are 0-indexed

					// Determine fiscal year based on the month
					if (currentMonth >= 4) {
						currentYear = currentYear + 1; // Set to next year for April and beyond
					} else {
						currentYear = currentYear; // Set to current year for Jan, Feb, and March
					}

					// Update headers dynamically based on the selected year
					const updateYearHeaders = (year) => {
						const columnIndices = [3, 4, 5];
						columnIndices.forEach((index, i) => {
							const oColumn = sap.ui.getCore().byId(`vendoronboardrequest::vobRequestObjectPage--fe::FacetSubSection::YOYAnnualProjection`)
								.mAggregations._grid.mAggregations.content[0].mAggregations.content.mAggregations.content.mAggregations.columns[index];
							const yearValue = year + i; // Calculate the financial year based on index
							oColumn.setHeader(`Financial Year ${yearValue}`);
							oColumn.setTooltip(`Financial Year ${yearValue}`);
						});
					};

					if (finalyearselected) {
						updateYearHeaders(parseInt(finalyearselected));
					} else {
						updateYearHeaders(currentYear);
					}
					var selectedYear = finalyearselected || currentYear.toString();

					// If form element exists and IsActiveEntity is true, set specific field editability
					if (bFormElementExists) {
						oFormContainer.mAggregations.formElements[7].mAggregations.fields[0].setValue(selectedYear)
						oFormContainer.mAggregations.formElements[7].mAggregations.fields[0].setEditable(!IsActiveEntity);
						return;
					}

					// Create a new FormElement for Selected Year
					const oNewFormElement = new sap.ui.layout.form.FormElement({
						label: new sap.m.Label({ text: "Selected Year" }) // Label for the ComboBox
					});

					// Create the ComboBox with current, previous, and next year
					const oComboBox1 = new sap.m.ComboBox({
						items: [
							new sap.ui.core.Item({ key: currentYear - 1, text: (currentYear - 1).toString() }), // Previous year
							new sap.ui.core.Item({ key: currentYear, text: currentYear.toString() }),            // Current year
							new sap.ui.core.Item({ key: currentYear + 1, text: (currentYear + 1).toString() })  // Next year
						],
						editable: !IsActiveEntity,
						change: (oEvent) => {
							const selectedYear = parseInt(oEvent.mParameters.newValue);
							updateYearHeaders(selectedYear); // Update headers on year selection
						}
					});


					// Set the selected key for the ComboBox
					oComboBox1.setSelectedKey(selectedYear);

					// Add the ComboBox to the new FormElement and add it to the FormContainer
					oNewFormElement.addField(oComboBox1);
					oFormContainer.addFormElement(oNewFormElement);

				}

			},

		},

		_applyDropdownFilter: function (sMode, oTable) {
			if (!oTable) return;

			const applyToRows = () => {
				const aRows = oTable.getRows();
				if (!aRows.length) return;

				let oFilter;
				if (sMode === "MGSP") {
					oFilter = new sap.ui.model.Filter(
						"materialname",
						sap.ui.model.FilterOperator.NotStartsWith,
						"MV"
					);
				} else {
					oFilter = new sap.ui.model.Filter(
						"materialname",
						sap.ui.model.FilterOperator.StartsWith,
						"MV"
					);
				}

				aRows.forEach(oRow => {
					oRow.getCells().forEach(oCell => {
						const oContent = oCell.getContent?.();
						if (!oContent) return;

						const aItems = oContent.getItems?.();
						if (!aItems) return;

						const oMCB = aItems.find(ctrl =>
							ctrl.isA && ctrl.isA("sap.m.MultiComboBox")
						);

						if (oMCB && oMCB.getBinding("items")) {
							const oBinding = oMCB.getBinding("items");

							// ✅ Save selected keys before touching binding
							let aSelectedKeys = [];
							const oRowContext = oRow.getBindingContext();
							if (oRowContext) {
								const sRawValue = oRowContext.getProperty("mgsp_part_nos");
								if (sRawValue && typeof sRawValue === "string") {
									aSelectedKeys = sRawValue.split("|").map(s => s.trim()).filter(Boolean);
								}
							}
							if (!aSelectedKeys.length) {
								aSelectedKeys = [...oMCB.getSelectedKeys()];
							}

							let restored = false;
							const restoreKeys = () => {
								if (restored) return;
								restored = true;
								if (aSelectedKeys.length > 0) {
									oMCB.setSelectedKeys(aSelectedKeys);
								}
							};

							// ✅ Show busy indicator while data loads
							oMCB.setBusy(true);

							// ✅ Apply filter — triggers fresh backend call
							oBinding.filter([oFilter]);

							// ✅ Wait for data to arrive, then stop busy + restore keys
							oBinding.attachEventOnce("dataReceived", () => {
								oMCB.setBusy(false);
								restoreKeys();
							});

							// Safety fallback
							setTimeout(() => {
								oMCB.setBusy(false);
								restoreKeys();
							}, 3000);
						}
					});
				});
			};

			if (oTable.getRows().length > 0) {
				applyToRows();
			} else {
				oTable.attachEventOnce("rowsUpdated", applyToRows);
			}
		},

		_updateColumnHeader: function (mode, oColumn) {

			if (!oColumn) return;

			if (mode === "MGSP") {
				oColumn.setLabel("MGSP Part Nos");
				oColumn.setTooltip("MGSP Part Nos");
			} else {
				oColumn.setLabel("Value Fit");
				oColumn.setTooltip("Value Fit");
			}
		},
	});
});