sap.ui.define(['sap/ui/core/mvc/ControllerExtension',
    'sap/m/HBox',
    "sap/m/Table",
    "sap/m/Column",
    "sap/m/ColumnListItem",
    "sap/m/Text",
    "sap/m/Input",
    "sap/m/Button",
    "sap/m/Dialog",
    "sap/m/CheckBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Icon",
    "sap/m/library",
], function (ControllerExtension, HBox, Table, Column, ColumnListItem, Text, Input, Button, Dialog, CheckBox, MessageToast, JSONModel, Icon, mobileLibrary) {
    'use strict';

    async function loadImages(supplier, part, vobId) {

        const busyDialog = new sap.m.BusyDialog({ text: "Loading images..." });

        const updateImageContainers = async (filesArray) => {
            // Open the busy dialog before starting the process
            busyDialog.open();

            try {
                // Filter files array just once
                const supplierFiles = filesArray.filter(file => file.fileName.includes("/Supplier/"));
                const partFiles = filesArray.filter(file => file.fileName.includes("/Parts/"));

                // Parallel updates to reduce UI rendering time
                await Promise.all([
                    updateContainer(supplierFiles, supplier, "No Supplier Data Found"),
                    updateContainer(partFiles, part, "No Part Data Found")
                ]);

            } finally {
                busyDialog.close(); // Close the busy dialog after loading all images
            }
        };

        const updateContainer = async (files, container, emptyMessage) => {
            // Cache items array to add all at once
            let items = [];
            if (files.length === 0) {
                items.push(new sap.m.MessageStrip({ text: emptyMessage, type: "Information", showIcon: true, showCloseButton: false }));
            } else {
                // Create image items and add them to items array
                const promises = files.map(file => createImageItem.call(this, file));
                const imageItems = await Promise.all(promises);
                items = items.concat(imageItems);
            }

            // Update container with accumulated items
            container.removeAllItems();
            items.forEach(item => container.addItem(item));
        };

        const createImageItem = async (file) => {
            const fileName = file.fileName;
            const parts = fileName.split('/');
            const newFolder = parts[parts.length - 2];
            const fileBaseName = parts[parts.length - 1];
            const result = `${newFolder} (${fileBaseName})`;

            return new sap.m.VBox({
                items: [
                    new sap.m.Image({
                        src: file.url,
                        width: "100%",
                        height: "auto",
                    }),
                    new sap.m.HBox({
                        items: [
                            new sap.ui.core.Icon({
                                src: 'sap-icon://circle-task',
                                visible: false,
                                press: function (oEvent) {
                                    const oIcon = oEvent.getSource();
                                    oIcon.setSrc(oIcon.getSrc() === 'sap-icon://circle-task' ? "sap-icon://bo-strategy-management" : "sap-icon://circle-task");
                                }
                            }),
                            new sap.m.Title({
                                text: result,
                                textAlign: "Center",
                                wrapping: true,
                                width: "100%"
                            })
                        ]
                    })
                ],
                alignItems: "Center",
                justifyContent: "Center",
                width: "100%"
            }).addStyleClass("eachImageelement");
        };

        // Bind and execute the function to fetch files
        let oFunction = this.getView().getModel().bindContext("/getFilesListVOBSupplierPart(...)");
        oFunction.setParameter("fileName", vobId);
        await oFunction.execute();

        // Get the array of files
        const filesArray = oFunction.getBoundContext().getValue()?.value ?? '';

        // Check if filesArray is empty or contains errors
        if (!filesArray || filesArray.length === 0 || typeof filesArray[0] === 'string' && filesArray[0].includes("Failed to")) {
            // Show "No data found" message strips if filesArray is empty or contains errors
            supplier.removeAllItems();
            part.removeAllItems();
            supplier.addItem(new sap.m.MessageStrip({
                text: "No Supplier Data Found",
                type: "Information",
                showIcon: true,
                showCloseButton: false
            }));
            part.addItem(new sap.m.MessageStrip({
                text: "No Part Data Found",
                type: "Information",
                showIcon: true,
                showCloseButton: false
            }));
        } else {
            // Update image containers in parallel if files are found
            await updateImageContainers(filesArray);
        }
    }
    async function loadImagespdf(supplier, part, vobId) {

        const busyDialog = new sap.m.BusyDialog({ text: "Generating Pdf Please wait....." });

        const updateImageContainers = async (filesArray) => {
            // Open the busy dialog before starting the process
            busyDialog.open();

            try {
                // Filter files array just once
                const supplierFiles = filesArray.filter(file => file.fileName.includes("/Supplier/"));
                const partFiles = filesArray.filter(file => file.fileName.includes("/Parts/"));

                // Parallel updates to reduce UI rendering time
                await Promise.all([
                    updateContainer(supplierFiles, supplier, "No Supplier Data Found"),
                    updateContainer(partFiles, part, "No Part Data Found")
                ]);

            } finally {
                busyDialog.close(); // Close the busy dialog after loading all images
            }
        };

        const updateContainer = async (files, container, emptyMessage) => {
            // Cache items array to add all at once
            let items = [];
            if (files.length === 0) {
                items.push(new sap.m.MessageStrip({ text: emptyMessage, type: "Information", showIcon: true, showCloseButton: false }));
            } else {
                // Create image items and add them to items array
                const promises = files.map(file => createImageItem.call(this, file));
                const imageItems = await Promise.all(promises);
                items = items.concat(imageItems);
            }

            // Update container with accumulated items
            container.removeAllItems();
            items.forEach(item => container.addItem(item));
        };

        const createImageItem = async (file) => {
            const fileName = file.fileName;
            const parts = fileName.split('/');
            const newFolder = parts[parts.length - 2];
            const fileBaseName = parts[parts.length - 1];
            const result = `${newFolder} (${fileBaseName})`;

            return new sap.m.VBox({
                items: [
                    new sap.m.Image({
                        src: `data:image/jpeg;base64,${file.content}`,
                        width: "100%",
                        height: "auto",
                    }),
                    new sap.m.HBox({
                        items: [
                            new sap.ui.core.Icon({
                                src: 'sap-icon://circle-task',
                                visible: false,
                                press: function (oEvent) {
                                    const oIcon = oEvent.getSource();
                                    oIcon.setSrc(oIcon.getSrc() === 'sap-icon://circle-task' ? "sap-icon://bo-strategy-management" : "sap-icon://circle-task");
                                }
                            }),
                            new sap.m.Title({
                                text: result,
                                textAlign: "Center",
                                wrapping: true,
                                width: "100%"
                            })
                        ]
                    })
                ],
                alignItems: "Center",
                justifyContent: "Center",
                width: "100%"
            }).addStyleClass("eachImageelement");
        };

        busyDialog.open();

        // Bind and execute the function to fetch files
        let oFunction = this.getModel().bindContext("/getFilesListVOBSupplierPartPdf(...)");
        oFunction.setParameter("fileName", vobId);
        await oFunction.execute();

        // Get the array of files
        const filesArray = oFunction.getBoundContext().getValue()?.value ?? '';

        // Check if filesArray is empty or contains errors
        if (!filesArray || filesArray.length === 0 || typeof filesArray[0] === 'string' && filesArray[0].includes("Failed to")) {
            // Show "No data found" message strips if filesArray is empty or contains errors
            supplier.removeAllItems();
            part.removeAllItems();
            supplier.addItem(new sap.m.MessageStrip({
                text: "No Supplier Data Found",
                type: "Information",
                showIcon: true,
                showCloseButton: false
            }));
            part.addItem(new sap.m.MessageStrip({
                text: "No Part Data Found",
                type: "Information",
                showIcon: true,
                showCloseButton: false
            }));
        } else {
            // Update image containers in parallel if files are found
            await updateImageContainers(filesArray);
        }
    }


    return ControllerExtension.extend('vendoronboardapproval.ext.controller.Objectpage', {
        // this section allows to extend lifecycle hooks or hooks provided by Fiori elements
        override: {
            /**
             * Called when a controller is instantiated and its View controls (if available) are already created.
             * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
             * @memberOf vendoronboardapproval.ext.controller.Objectpage
             */
            onInit: function () {
                debugger
                // you can access the Fiori elements extensionAPI via this.base.getExtensionAPI
                var oModel = this.base.getExtensionAPI().getModel();
            },
            routing: {
                onAfterBinding: async function () {
                    try {
                        var mgspValue;
                        var oBusyDialogLoading = new sap.m.BusyDialog({
                            text: "Loading request and images. Please wait..."
                        });
                        oBusyDialogLoading.open();
                        var headerActions = this.base.getView().getContent()[0].getHeaderTitle();
                        headerActions.destroyActions();
                        headerActions.destroyContent();
                        headerActions.addContent(new sap.m.Title({ text: "{sequentialvobid}", titleStyle: "H1" }));

                        var objectPageApproval = sap.ui.getCore().byId("vendoronboardapproval::vobApprovalObjectPage--fe::ObjectPage");
                        debugger

                        let selected_year = sap.ui.getCore().byId("vendoronboardapproval::vobApprovalObjectPage--fe::FormContainer::GeneratedFacet1::FormElement::DataField::selected_year");

                        var url = window.location.hash;
                        let regexnewpdf = /vobRequest\(id=([a-zA-Z0-9-]+),IsActiveEntity=(true|false)\)/;
                        const matchesnewpdf = url.match(regexnewpdf);
                        var id = matchesnewpdf[1];

                        const oFunction5 = this.getView().getModel().bindContext("/getyeardata(...)");
                        oFunction5.setParameter("id", id);
                        await oFunction5.execute();
                        let finalyearrr = oFunction5.getBoundContext().getValue().value;
                        finalyearrr = JSON.parse(finalyearrr);

                        var oSelectedYear = finalyearrr.vobdata[0].selected_year;
                        selected_year.destroyFields();
                        selected_year.addField(new sap.m.Text({ text: oSelectedYear }));
                        // let oSelectedYear = oData.selected_year; // Assume oData.selected_year is 2023
                        let oFY1 = sap.ui.getCore().byId("vendoronboardapproval::vobApprovalObjectPage--fe::table::vob_yoy::LineItem::YOYAnnualProjection1::C::financial_year_one");
                        let oFY2 = sap.ui.getCore().byId("vendoronboardapproval::vobApprovalObjectPage--fe::table::vob_yoy::LineItem::YOYAnnualProjection1::C::financial_year_two");
                        let oFY3 = sap.ui.getCore().byId("vendoronboardapproval::vobApprovalObjectPage--fe::table::vob_yoy::LineItem::YOYAnnualProjection1::C::financial_year_three");

                        // // Set the financial years based on the selected year
                        oFY1.setHeader(`Financial Year ${oSelectedYear}`); // FY1 = Financial Year 2023
                        oFY2.setHeader(`Financial Year ${oSelectedYear + 1}`); // FY2 = Financial Year 2024
                        oFY3.setHeader(`Financial Year ${oSelectedYear + 2}`); // FY3 = Financial Year 2025


                        //Save as PDF button
                        headerActions.addAction(new Button({
                            text: "Save as PDF",
                            icon: "sap-icon://pdf-attachment",
                            press: async function (oEvent) {
                                debugger
                                // const aIds = ["textId1", "textId2", "textId3"];

                                const oSaveAsPdfButton = oEvent.getSource();
                                const jsPDFUrl = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.4.0/jspdf.umd.min.js';
                                const html2pdfUrl = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.2/html2pdf.bundle.min.js';




                                //Supplier
                                var imageSupplierContainer = objectPageApproval.getSections()[1].getSubSections()[0].getBlocks()[0];
                                //Part Images
                                var imagePartContainer = objectPageApproval.getSections()[2].getSubSections()[0].getBlocks()[0];

                                var url = window.location.hash;
                                let regexnewpdf = /vobRequest\(id=([a-zA-Z0-9-]+),IsActiveEntity=(true|false)\)/;
                                const matchesnewpdf = url.match(regexnewpdf);
                                var id = matchesnewpdf[1];
                                await loadImagespdf.call(this, imageSupplierContainer, imagePartContainer, id);

                                // Create a BusyDialog instance
                                const oBusyDialog = new sap.m.BusyDialog({
                                    text: "Downloading PDF, please wait..."
                                });

                                // Helper function to dynamically load a script
                                function loadScript(url) {
                                    return new Promise((resolve, reject) => {
                                        const existingScript = document.querySelector(`script[src="${url}"]`);
                                        if (existingScript) {
                                            resolve(); // Script already loaded
                                        } else {
                                            const script = document.createElement('script');
                                            script.src = url;
                                            script.onload = resolve;
                                            script.onerror = reject;
                                            document.head.appendChild(script);
                                        }
                                    });
                                }


                                Promise.all([loadScript(jsPDFUrl), loadScript(html2pdfUrl)])
                                    .then(() => {
                                        console.log('Scripts loaded successfully.');
                                        oSaveAsPdfButton.getDomRef().style.display = 'none'; // Hide the button during PDF generation

                                        // Get all sections of the Object Page
                                        const objectPageapproval = sap.ui.getCore().byId("vendoronboardapproval::vobApprovalObjectPage--fe::ObjectPage");
                                        const Allsections = objectPageapproval.getSections();

                                        // Scroll to the second-to-last section
                                        const targetSection = Allsections[Allsections.length - 2].sId;
                                        objectPageapproval.scrollToSection(targetSection);

                                        // Wait for the scroll to complete and then execute the PDF generation code
                                        setTimeout(() => {
                                            // Show the BusyDialog
                                            oBusyDialog.open();

                                            // Step 1: Add the custom print class to the body

                                            // add class (css for width)
                                            // aIds.forEach(function (sId) {

                                            //  // Try direct                                       
                                            //  let oControl = sap.ui.getCore().byId(sId);
                                            //  console.log("oControl", oControl);
                                            //  // If not found, search with suffix match
                                            //  // if (!oControl) {
                                            //  //  const allControls = sap.ui.getCore().byFieldGroupId(""); // force load
                                            //  //  oControl = Object.values(sap.ui.getCore().mElements)
                                            //  //      .find(ctrl => ctrl.getId && ctrl.getId().endsWith(sId));
                                            //  // }

                                            //  if (oControl) {
                                            //      oControl.addStyleClass("widthCHange");
                                            //      console.log("ADDED STYLECLASS");
                                            //  }

                                            // });



                                            document.body.classList.add("print-mode");

                                            // Get all sections of the Object Page
                                            const objectPage = sap.ui.getCore().byId("vendoronboardapproval::vobApprovalObjectPage--fe::ObjectPage");
                                            const sections = objectPage.getSections();
                                            let vobId = headerActions.getContent()[0].getText(); // Assuming the VOB ID is the text of the first button in headerActions
                                            console.log(vobId);

                                            // Container to hold all sections' content
                                            const pdfContent = document.createElement("div");
                                            pdfContent.style.width = "100%"; // Set width to 100% for the PDF content

                                            // Clone header section and append
                                            const oHeaderSection = objectPage.getHeaderTitle().getDomRef().cloneNode(true);
                                            pdfContent.appendChild(oHeaderSection);

                                            // Loop through each section and append its content to the pdfContent
                                            sections.forEach(section => {
                                                const sectionDomRef = section.getDomRef(); // Get the DOM element of the section
                                                if (sectionDomRef) {
                                                    const sectionId = section.getId(); // Get the section ID
                                                    // Check if the section ID contains "Comment"
                                                    if (!sectionId.includes("Comment")) { // Only include sections without "Comment" in the ID
                                                        const clonedSection = sectionDomRef.cloneNode(true); // Clone the DOM element

                                                        // Set CSS for page break
                                                        clonedSection.style.pageBreakAfter = "always"; // Ensure each section starts on a new page

                                                        // Avoid breaking inside specific layout elements
                                                        const targetDivs = clonedSection.querySelectorAll("div.sapMHBox, div.sapMVBox");
                                                        targetDivs.forEach(div => {
                                                            div.style.pageBreakInside = "avoid"; // Avoid breaking inside the HBox/VBox
                                                        });

                                                        // Set table-specific styles
                                                        const tables = clonedSection.querySelectorAll("table");
                                                        tables.forEach(table => {
                                                            table.style.pageBreakInside = "avoid"; // Avoid breaking inside the table
                                                            const rows = table.querySelectorAll("tr");
                                                            rows.forEach(row => {
                                                                row.style.pageBreakInside = "avoid"; // Avoid breaking inside table rows
                                                            });
                                                        });

                                                        pdfContent.appendChild(clonedSection); // Append cloned section to pdfContent
                                                    }
                                                }
                                            });

                                            // Set up the options for PDF generation
                                            const options = {
                                                margin: 0, // Set margin to 0 to eliminate unwanted spaces
                                                filename: `${vobId}.pdf`, // Filename using VOB ID
                                                image: { type: 'jpeg', quality: 0.98 },
                                                html2canvas: { scale: 2, useCORS: true }, // Ensuring proper rendering of images
                                                jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' } // Set to A4 size
                                            };

                                            // Generate the PDF
                                            html2pdf().from(pdfContent).set(options).save()
                                                .then(() => {
                                                    // Step 3: Remove the custom print class after generating the PDF
                                                    document.body.classList.remove("print-mode");
                                                    oSaveAsPdfButton.getDomRef().style.display = 'block'; // Show the button again
                                                    oBusyDialog.close(); // Close the BusyDialog after generation



                                                })
                                                .catch(error => {
                                                    console.error("Error generating PDF:", error);
                                                    document.body.classList.remove("print-mode"); // Ensure cleanup on error
                                                    oSaveAsPdfButton.getDomRef().style.display = 'block'; // Show the button again
                                                    oBusyDialog.close(); // Close the BusyDialog in case of error
                                                });
                                        }, 1000); // Adjust this delay as needed to ensure scroll has finished
                                    })
                                    .catch(error => {
                                        console.error('Error loading scripts:', error);
                                    });

                            }
                        }));

                        sap.ui.getCore().byId("vendoronboardapproval::vobApprovalObjectPage--fe::CustomSubSection::Itemdata").setShowTitle(false);
                        sap.ui.getCore().byId("vendoronboardapproval::vobApprovalObjectPage--fe::CustomSection::Commentfragment").setVisible(false);

                        var objectPageApproval = sap.ui.getCore().byId("vendoronboardapproval::vobApprovalObjectPage--fe::ObjectPage");

                        //Supplier
                        var imageSupplierContainer = new sap.m.VBox().addStyleClass("image-grid");
                        //Part Images
                        var imagePartContainer = new sap.m.VBox().addStyleClass("image-grid")

                        var url = window.location.hash;
                        const regexnew = /vobRequest\(id=([a-zA-Z0-9-]+),IsActiveEntity=(true|false)\)/;
                        const matchesnew = url.match(regexnew);
                        var id = matchesnew[1];
                        await loadImages.call(this, imageSupplierContainer, imagePartContainer, id);

                        //Images loaded

                        let oFunctionComment = this.base.getModel().bindContext("/commentfunction(...)");
                        var statusval1 = JSON.stringify({ id: id, status: "screen2commentview" })
                        oFunctionComment.setParameter("status", statusval1)
                        await oFunctionComment.execute()
                        debugger
                        var result1 = oFunctionComment.getBoundContext().getValue()?.value;
                        var comments = JSON.parse(result1);



                        objectPageApproval.insertSection(new sap.uxap.ObjectPageSection({
                            title: "Supplier Images",
                            subSections: new sap.uxap.ObjectPageSubSection({
                                blocks: imageSupplierContainer
                            })
                        }), 1);
                        objectPageApproval.insertSection(new sap.uxap.ObjectPageSection({
                            title: "Part Images",
                            subSections: new sap.uxap.ObjectPageSubSection({
                                blocks: imagePartContainer
                            })
                        }), 2);
                        let cashflowcmt = comments.filter(item => item.comment && item.comment.startsWith("Cash Flow: "));
                        let trimmedCashFlow = cashflowcmt.length ? cashflowcmt[0].comment.replace("Cash Flow: ", "") : '';

                        var cashflwsection = objectPageApproval.getSections()[3];
                        cashflwsection.setShowTitle(false);
                        cashflwsection.addSubSection(
                            new sap.uxap.ObjectPageSubSection({
                                title: "Cash Flow Comments",
                                blocks: new sap.m.Text({ text: trimmedCashFlow })
                            }).addStyleClass("commentBorderClass")
                        );



                        var id;
                        var finalsupp;
                        var workflowresp;
                        async function allFunction() {
                            var url = window.location.hash;
                            const regex = /vobRequest\(id=([a-zA-Z0-9-]+),IsActiveEntity=(true|false)\)/;
                            const matches = url.match(regex);
                            id = matches[1];
                            // var id = '70ac0c95-4022-4da3-b6e6-4aea987d03f7'
                            let oFunction1 = this.getView().getModel().bindContext("/documentscreenfunc(...)");
                            var statusval1 = JSON.stringify({ id: id, status: "getvendordetails" })
                            oFunction1.setParameter("status", statusval1)
                            await oFunction1.execute()
                            debugger
                            var result1 = oFunction1.getBoundContext().getValue().value;
                            finalsupp = JSON.parse(result1);

                            let oFunction2 = this.getView().getModel().bindContext("/workflowdata(...)");
                            oFunction2.setParameter("vobid", id);
                            oFunction2.setParameter("status", "workflowhistorydata");
                            await oFunction2.execute()

                            var result1 = oFunction2.getBoundContext().getValue().value;
                            workflowresp = JSON.parse(result1);
                        }
                        await allFunction.call(this);

                        async function cashFlowCmt() {
                            var fields = [
                                "Total Landed Investment - Settled (Rs. lacs)",
                                "Total Buying value (Rs. Lac) 1st 12months",
                                "Sourcing Partner commission to be paid ( Rs. Lac) 1st 12 months",
                                "Sourcing Partner commission to be paid (Rs. Lac)  2nd + 3rd Year",
                                "YOY Reduction for 3 yrs (After SOP + 1 year) - If Any",
                                "FX Base Rate",
                                "Inco Terms",
                                "Payment Terms",
                                "Transport Cost"
                            ]


                            debugger
                            var mainHbox = sap.ui.getCore().byId("vendoronboardapproval::vobApprovalObjectPage--fe::CustomSubSection::VendoronBoard").getBlocks()[0].getContent();
                            mainHbox.getItems()[0].setWidth("40vw")
                            debugger
                            mainHbox.getItems()[0].getItems()[0].destroyColumns();
                            mainHbox.getItems()[0].getItems()[0].destroyItems();
                            mainHbox.getItems()[1].destroyItems();

                            var oHboxDocument = mainHbox.getItems()[1];
                            var otable = mainHbox.getItems()[0].getItems()[0];
                            var oHeaderText = new sap.m.Text({
                                text: "Rs",   // default value
                                width: "8vw",
                                tooltip: "MGSP Part Nos"
                            });
                            var firstColumn = new sap.m.Column({
                                // width: "500px",
                                header: new HBox({
                                    // alignItems: "Center",
                                    justifyContent: "SpaceBetween",
                                    items: [
                                        oHeaderText,
                                        new Text({ text: "MGSP Supplier Name", width: "8vw", tooltip: "MGSP Supplier Name" }),
                                        new Text({ text: "MGSP Vendor Inco Term", width: "8vw", tooltip: "MGSP Vendor Inco Term" }),
                                        new Text({ text: "Existing MGSP PO Price", width: "8vw", tooltip: "Existing MGSP PO Price" }),
                                        new Text({ text: "Target Price", width: "8vw", tooltip: "Target Price" }),
                                        // new Text({ text: "IsApproved", width: "8vw", tooltip: "IsApproved" })

                                    ]
                                }).addStyleClass("hboxHeaderClass"),
                                // styleClass: "colunm1style"
                            });
                            otable.addColumn(firstColumn);
                            var firstItem = new ColumnListItem({
                                cells: [
                                    new Text({ text: `Remarks` })
                                ]
                            })
                            var modelrowfisrtcol = new JSONModel({
                                rowid: `Remarks`
                            });
                            firstItem.setModel(modelrowfisrtcol, `rowid`);
                            otable.addItem(firstItem);
                            for (let i = 0; i < finalsupp.yoy_details.length; i++) {
                                let partdetails = finalsupp.yoy_details[i];
                                if (partdetails.mgsp_part_nos && partdetails.mgsp_part_nos.startsWith("MV")) {
                                    mgspValue = "Value Fit Nos";
                                    console.log("mgspValue", mgspValue);
                                } else {
                                    mgspValue = "MGSP Part Nos";
                                    console.log("mgspValue", mgspValue);
                                }
                                oHeaderText.setText(mgspValue);
                                oHeaderText.setTooltip(mgspValue);
                                var oColumnListItem = new ColumnListItem({
                                    cells: [
                                        new HBox({
                                            alignItems: "Center",
                                            justifyContent: "SpaceBetween",
                                            items: [
                                                new Text("textId1", { text: partdetails.mgsp_part_nos, width: "8vw", tooltip: partdetails.mgsp_part_nos }),
                                                new Text({ text: partdetails.msgp_supplier_name, width: "8vw", tooltip: partdetails.msgp_supplier_name }),
                                                new Text({ text: partdetails.mgsp_vendor_inco_term, width: "8vw", tooltip: partdetails.mgsp_vendor_inco_term }),
                                                new Text({ text: partdetails.existing_mgsp_po_price, width: "8vw", tooltip: partdetails.existing_mgsp_po_price }),
                                                new Text({ text: partdetails.target_price, width: "8vw", tooltip: partdetails.target_price }),
                                                // new Text({ text: "MGSP Part No", width: "8vw", tooltip: "MGSP Part No" }),
                                                // new Text({ text: "MGSP Sudsfdsfdsfdsfpplier Name", width: "8vw", tooltip: "MGSP Supplier Name" }),
                                                // new Text({ text: "Existing MGSP PO Price", width: "8vw", tooltip: "Existing MGSP PO Price" }),
                                                // new Text({ text: "Target Price", width: "8vw", tooltip: "Target Price" }),
                                                // new sap.m.Text({
                                                //  text: `${partdetails.state === null ? "Pending" : partdetails.state ? "Approved" : "Rejected"}`,
                                                //  width: "8vw"
                                                // })
                                                //  .addStyleClass("statusLinkClass")
                                                //  .addStyleClass(`${partdetails.state === null ? "pending" : partdetails.state ? "approved" : "rejected"}`)

                                                // new sap.m.Switch({type:"AcceptReject"}).addStyleClass("switchClass")
                                            ]
                                        }).addStyleClass("hboxRowClass"),
                                    ]
                                });

                                // Set the model directly to the ColumnListItem
                                var modelrow = new JSONModel({
                                    rowid: partdetails.id
                                });
                                oColumnListItem.setModel(modelrow, 'rowid');

                                // Add the ColumnListItem to the table
                                otable.addItem(oColumnListItem);
                            }
                            for (let field of fields) {
                                var oColumnListItem1 = new ColumnListItem({
                                    cells: [
                                        new Text({ text: `${field}` }).addStyleClass("InputToTextClass"),
                                    ]
                                })
                                var modelrow = new JSONModel({
                                    rowid: field
                                });
                                oColumnListItem1.setModel(modelrow, `rowid`);

                                otable.addItem(oColumnListItem1);


                            }
                            var classIndex = 1;
                            for (let supplier of finalsupp.suplier_detail_together) {
                                console.log(supplier.supplier);
                                var newSupplier = new Table({
                                    width: "20vw",
                                    columns: new Column({
                                        header: [
                                            new HBox({
                                                items: [
                                                    new Text({ text: `${supplier.supplier}`, tooltip: `${supplier.supplier}` }).addStyleClass(`colorClassApproval` + `${classIndex}`)
                                                ]
                                            })
                                        ]
                                    })
                                }).addStyleClass("tableClass");
                                for (let i = 0; i < otable.getItems().length; i++) {
                                    let rowid = otable.getItems()[i].oModels.rowid.oData.rowid;

                                    // supplier.rel.forEach((relItem) => {
                                    //  if (relItem.value_key === rowid) {
                                    //      var oColumnListItem6 = new ColumnListItem({
                                    //          cells: [
                                    //              new Text({ text: `${relItem.value}` })
                                    //          ]
                                    //      })
                                    //      newSupplier.addItem(oColumnListItem6);
                                    //  }
                                    // });

                                    let itemFound = supplier.rel.find(item => item.value_key == rowid);
                                    console.log(itemFound);
                                    if (itemFound) {
                                        var oColumnListItem6 = new ColumnListItem({
                                            cells: [
                                                new Text({ text: `${itemFound.value}`, tooltip: `${itemFound.value}` })
                                            ]
                                        })
                                        newSupplier.addItem(oColumnListItem6);
                                    }
                                    else {
                                        var oColumnListItem6 = new ColumnListItem({
                                            cells: [
                                                new Text({ text: ` ` })
                                            ]
                                        })
                                        newSupplier.addItem(oColumnListItem6);
                                    }



                                }
                                for (var m = 0; m < finalsupp.yoy_details.length; m++) {
                                    if (finalsupp.yoy_details[m].supplierid == supplier.id_main) {
                                        debugger
                                        newSupplier.getItems()[m + 1].addStyleClass(`input` + `colorClassApproval` + `${classIndex}`)
                                    }
                                }
                                classIndex = classIndex + 1;
                                // for (const supplierdetail of supplier.rel) {

                                //  var oColumnListItem6 = new ColumnListItem({
                                //      cells: [
                                //          new Text({text:`${supplierdetail.value}`})
                                //      ]
                                //  })
                                //  newSupplier.addItem(oColumnListItem6);
                                // }


                                // for (let i = 0; i < otable.getItems().length; i++) {
                                //  var oColumnListItem6 = new ColumnListItem({
                                //      cells: [
                                //          new Input()
                                //      ]
                                //  })
                                //  newSupplier.addItem(oColumnListItem6);
                                // }
                                // Add the newly created column to the table
                                oHboxDocument.addItem(newSupplier);
                            }
                        }
                        cashFlowCmt.call(this);

                        //investment section
                        async function investmentSection() {
                            var appmainHboc = sap.ui.getCore().byId(jQuery("[id$='appinvmainHbox']").attr("id"))
                            appmainHboc.getItems()[0].setWidth("40vw")
                            appmainHboc.getItems()[0].getItems()[0].destroyColumns();
                            appmainHboc.getItems()[0].getItems()[0].destroyItems();
                            appmainHboc.getItems()[1].destroyItems();
                            var appsupplierHBox = sap.ui.getCore().byId(jQuery("[id$='appHboxSupplierinvestment']").attr("id"))
                            var appparttable = sap.ui.getCore().byId(jQuery("[id$='appparentTableinvestment']").attr("id"))
                            var invfirstColumn = new sap.m.Column({
                                header:
                                    new Text({ text: "All figures in Rs.Lacs", tooltip: "All figures in Rs.Lacs", textAlign: "End" }),

                            });
                            appparttable.addColumn(invfirstColumn);
                            function createColumnListItem(leftValue, rightValue) {
                                var oColumnListItem = new ColumnListItem({
                                    cells: [
                                        new HBox({
                                            justifyContent: "SpaceBetween",
                                            items: [
                                                new Text({ text: leftValue }),
                                                new Text({ text: rightValue })
                                            ]
                                        })
                                    ]
                                }).addStyleClass("capexUpperSectionClass");
                                var modelrow = new JSONModel({
                                    rowid: rightValue
                                });
                                oColumnListItem.setModel(modelrow, `rowid`);
                                return oColumnListItem;
                            }

                            const items = [
                                ["Capex", "Tooling / Dies / Moulds / Fixtures"],
                                [" ", "Inspection Gauges"],
                                ["Revenue", "Testing / Validation"],
                                [" ", "Engg Fees"],
                                [" ", "Proto Tooling"],
                                [" ", "Logistics Trollies"],
                                [" ", "Total Landed Investment Settled"]
                            ];

                            items.forEach(([left, right]) => {
                                appparttable.addItem(createColumnListItem(left, right));
                            });
                            for (let supplier of finalsupp.suplier_detail_together) {
                                console.log(supplier.supplier);
                                var newSupplier = new Table({
                                    width: "20vw",
                                    columns: new Column({
                                        header: [
                                            new HBox({
                                                items: [
                                                    new Text({ text: `${supplier.supplier}`, tooltip: `${supplier.supplier}` })
                                                ]
                                            })
                                        ]
                                    })
                                }).addStyleClass("tableClass");
                                for (let i = 0; i < appparttable.getItems().length; i++) {
                                    let rowid = appparttable.getItems()[i].oModels.rowid.oData.rowid;

                                    // supplier.rel.forEach((relItem) => {
                                    //  if (relItem.value_key === rowid) {
                                    //      var oColumnListItem6 = new ColumnListItem({
                                    //          cells: [
                                    //              new Text({ text: `${relItem.value}` })
                                    //          ]
                                    //      })
                                    //      newSupplier.addItem(oColumnListItem6);
                                    //  }
                                    // });

                                    let itemFound = supplier.rel.find(item => item.value_key == rowid);
                                    console.log(itemFound);
                                    if (itemFound) {
                                        var oColumnListItem6 = new ColumnListItem({
                                            cells: [
                                                new Text({ text: `${itemFound.value}`, tooltip: `${itemFound.value}` })
                                            ]
                                        })
                                        newSupplier.addItem(oColumnListItem6);
                                    }
                                    else {
                                        var oColumnListItem6 = new ColumnListItem({
                                            cells: [
                                                new Text({ text: ` ` })
                                            ]
                                        })
                                        newSupplier.addItem(oColumnListItem6);
                                    }



                                }
                                // for (const supplierdetail of supplier.rel) {

                                //  var oColumnListItem6 = new ColumnListItem({
                                //      cells: [
                                //          new Text({text:`${supplierdetail.value}`})
                                //      ]
                                //  })
                                //  newSupplier.addItem(oColumnListItem6);
                                // }


                                // for (let i = 0; i < otable.getItems().length; i++) {
                                //  var oColumnListItem6 = new ColumnListItem({
                                //      cells: [
                                //          new Input()
                                //      ]
                                //  })
                                //  newSupplier.addItem(oColumnListItem6);
                                // }
                                // Add the newly created column to the table
                                appsupplierHBox.addItem(newSupplier);
                            }
                            let investbreakupcmt = comments.filter(item => item.comment && item.comment.startsWith("Investment Breakup: "));
                            let trimmedInvestmentComment = investbreakupcmt.length ? investbreakupcmt[0].comment.replace("Investment Breakup: ", "") : '';
                            var investmentbreakupSection = sap.ui.getCore().byId("vendoronboardapproval::vobApprovalObjectPage--fe::CustomSection::InvestmentBreakup");
                            investmentbreakupSection.setShowTitle(false);
                            investmentbreakupSection.addSubSection(
                                new sap.uxap.ObjectPageSubSection({
                                    visible: true,
                                    title: "Investment Breakup Comment",
                                    blocks: [
                                        new sap.m.Text({
                                            text: `${trimmedInvestmentComment}`
                                        }),
                                    ]
                                }).addStyleClass("commentBorderClass")
                            );
                        }
                        investmentSection.call(this);



                        //  Item Data section
                        async function itemDataSection() {


                            var docmainHboc = sap.ui.getCore().byId(jQuery("[id$='mainhoxitemApproval']").attr("id"))
                            docmainHboc.getItems()[0].setWidth("40vw")
                            docmainHboc.getItems()[0].getItems()[0].destroyColumns();
                            docmainHboc.getItems()[0].getItems()[0].destroyItems();
                            docmainHboc.getItems()[1].destroyItems();
                            var itemsupplierHBox = sap.ui.getCore().byId(jQuery("[id$='HboxSupplieritemApproval']").attr("id"))
                            var itemparttable = sap.ui.getCore().byId(jQuery("[id$='parentTableitemApproval']").attr("id"))

                            var datafirstColumn = new sap.m.Column({
                                header: [
                                    new Text({ text: mgspValue, tooltip: mgspValue, textAlign: "End" }),
                                ]
                            });
                            var datasecondcolumn = new sap.m.Column({
                                header: [
                                    new Text({ text: "Finished Weight of Part / System (kg)", tooltip: "Finished Weight of Part / System (kg)", textAlign: "End" })
                                ]
                            });

                            itemparttable.addColumn(datafirstColumn);
                            itemparttable.addColumn(datasecondcolumn);


                            for (let i = 0; i < finalsupp.yoy_details.length; i++) {
                                let partdetails = finalsupp.yoy_details[i];
                                var oColumnListItem = new ColumnListItem({
                                    cells: [
                                        new Text("textId2", { text: partdetails.mgsp_part_nos, tooltip: partdetails.mgsp_part_nos, editable: false }),
                                        new Text({
                                            text: isNaN(partdetails.finished_weight_of_part) ? null : `${partdetails.finished_weight_of_part}`,
                                            tooltip: isNaN(partdetails.finished_weight_of_part) ? null : `${partdetails.finished_weight_of_part}`,
                                        }),
                                    ]
                                });



                                // Add the ColumnListItem to the table
                                itemparttable.addItem(oColumnListItem);
                            }


                            ///ITEM DATA SUBSECTION
                            var contentContainerDTB = new sap.m.HBox({
                                items: [
                                    // Add a Table
                                    new sap.m.Table(),
                                    // Add an HBox
                                    new sap.m.HBox()
                                ]
                            });
                            debugger
                            var dtbtable = contentContainerDTB.getItems()[0]
                            var dtbleftsidesection = contentContainerDTB.getItems()[1]
                            dtbtable.addStyleClass("customtableClass");
                            dtbtable.setWidth("40vw")
                            dtbleftsidesection.addStyleClass("rightHboxClass")
                            var dtbfirstColumn = new sap.m.Column({
                                // width: "500px",
                                header:
                                    new Text({ text: mgspValue, tooltip: mgspValue }),

                            });
                            dtbtable.addColumn(dtbfirstColumn);
                            for (let i = 0; i < finalsupp.yoy_details.length; i++) {
                                let partdetails = finalsupp.yoy_details[i];

                                var oColumnListItem = new ColumnListItem({
                                    cells: [
                                        new Text("textId3", { text: `${partdetails.mgsp_part_nos}`, tooltip: `${partdetails.mgsp_part_nos}` })
                                    ]

                                });
                                // Set the model directly to the ColumnListItem
                                var modelrow = new JSONModel({
                                    rowid: partdetails.id + "DTB Packaging Cost Rs. (Included in above Offer prices)"
                                });
                                oColumnListItem.setModel(modelrow, 'rowid');

                                //If Yoy table has supplierid then set model

                                if (partdetails.supplierid) {

                                    var supplierid = new JSONModel({
                                        supplierid: partdetails.supplierid
                                    });
                                    oColumnListItem.setModel(supplierid, `supplierid`);
                                }

                                // Add the ColumnListItem to the table
                                dtbtable.addItem(oColumnListItem);

                            }
                            for (let supplier of finalsupp.suplier_detail_together) {
                                var newSupplier = new Table({
                                    width: "20vw",
                                    columns: new Column({
                                        header: [
                                            // new HBox({
                                            // items: [
                                            new Text({
                                                text: `${supplier.supplier}`
                                            })
                                            // ]
                                            // })
                                        ]
                                    })
                                }).addStyleClass("tableClass");
                                var model = new JSONModel({
                                    supplierid: `${supplier.id_main}`
                                })
                                newSupplier.setModel(model, 'supplier_id');

                                for (let i = 0; i < dtbtable.getItems().length; i++) {

                                    let rowid = dtbtable.getItems()[i]?.oModels?.rowid?.oData?.rowid ?? null;
                                    let itemFound = supplier.rel.find(item => item.value_key == rowid);
                                    if (itemFound) {
                                        var oColumnListItem6 = new ColumnListItem({
                                            cells: [
                                                new Text({ text: `${itemFound.value}` })
                                            ]
                                        })
                                        newSupplier.addItem(oColumnListItem6);
                                    }
                                    else {
                                        var oColumnListItem6 = new ColumnListItem({
                                            cells: [
                                                new Text({
                                                    text: null,
                                                    liveChange: function (oEvent) {
                                                        ////debugger
                                                        validateSubmit();
                                                    }
                                                })
                                            ]
                                        })
                                        newSupplier.addItem(oColumnListItem6);
                                    }
                                }
                                // Add the newly created column to the table
                                dtbleftsidesection.addItem(newSupplier);
                            }

                            sap.ui.getCore().byId("vendoronboardapproval::vobApprovalObjectPage--fe::CustomSection::Itemdata").addSubSection(
                                new sap.uxap.ObjectPageSubSection({
                                    title: "DTB Packing Cost (Included in above Final Offer price)",
                                    blocks: [
                                        contentContainerDTB // Use the variable here
                                    ]
                                })
                            );
                            ///ITEM DATA SUBSECTION END
                        }
                        itemDataSection.call(this);
                        ///item data section end

                        ///RISK ANALYSIS SECTION//
                        async function riskAnalysisSection() {


                            var risktable = sap.ui.getCore().byId(jQuery("[id$='parentTableriskdocapproval']").attr("id"))
                            var riskleftsidesection = sap.ui.getCore().byId(jQuery("[id$='HboxSupplierriskdocapproval']").attr("id"))
                            risktable.removeStyleClass("tableClass");
                            risktable.addStyleClass("customtableClass");
                            risktable.setWidth("40vw")
                            riskleftsidesection.addStyleClass("rightHboxClass")
                            var btbfirstColumn = new sap.m.Column({
                                width: "500px",
                                header:
                                    new Text({ text: "   " }),

                            });
                            risktable.addColumn(btbfirstColumn);
                            const agreementsAndRatings = [
                                "Development Supply Agreement (DSA) - Whether Signed? (If No: LoBA will share after DSA agreement)",
                                "Tooling Agreement - Is it signed? (If applicable)",
                                "Supplier Code of Conduct Declaration - Submitted? (If No: Must be signed before start of development)",
                                "SRMM Score - Completed? (If Not Done: To be done before start of development)",
                                "Financial Rating - Completed? (If Not Done: To be done before start of development)",
                                "IPR Undertaking - Submitted? (If Not Done: To be done before start of development)"
                            ];

                            for (let field of agreementsAndRatings) {
                                var oColumnListItemrisk = new ColumnListItem({
                                    cells: [
                                        new Text({ text: `${field}`, tooltip: `${field}` })
                                    ]
                                })
                                var modelrow = new JSONModel({
                                    rowid: field
                                });
                                oColumnListItemrisk.setModel(modelrow, `rowid`);
                                risktable.addItem(oColumnListItemrisk);
                            }
                            for (let supplier of finalsupp.suplier_detail_together) {
                                var newSupplier = new Table({
                                    width: "20vw",
                                    columns: new Column({
                                        header: [

                                            // new sap.ui.core.Icon({
                                            //  src: 'sap-icon://circle-task',
                                            //  height: "10px",
                                            //  press: function (oEvent) {
                                            //      //debugger
                                            //      if (oEvent.getSource().getSrc() == "sap-icon://circle-task") {
                                            //          oEvent.getSource().setSrc("sap-icon://bo-strategy-management")
                                            //      }
                                            //      else {
                                            //          oEvent.getSource().setSrc("sap-icon://circle-task")
                                            //      }
                                            //  }
                                            // }),
                                            new Text({
                                                text: `${supplier.supplier}`
                                            })
                                        ]
                                    })
                                }).addStyleClass("tableClass");
                                var model = new JSONModel({
                                    supplierid: `${supplier.id_main}`
                                })
                                newSupplier.setModel(model, 'supplier_id');

                                for (let i = 0; i < risktable.getItems().length; i++) {

                                    let rowid = risktable.getItems()[i]?.oModels?.rowid?.oData?.rowid ?? null;
                                    let itemFound = supplier.rel.find(item => item.value_key == rowid);
                                    if (itemFound) {
                                        var oColumnListItem6 = new ColumnListItem({
                                            cells: [
                                                new Text({ text: `${itemFound.value}` })
                                            ]
                                        })
                                        newSupplier.addItem(oColumnListItem6);
                                    }
                                    else {
                                        var oColumnListItem6 = new ColumnListItem({
                                            cells: [
                                                new Text({
                                                    value: null,
                                                    liveChange: function (oEvent) {
                                                        ////debugger
                                                        validateSubmit();
                                                    }
                                                })
                                            ]
                                        })
                                        newSupplier.addItem(oColumnListItem6);
                                    }
                                }
                                // Add the newly created column to the table
                                riskleftsidesection.addItem(newSupplier);
                            }


                            let riskAnanlysisCmt = comments.filter(item => item.comment && item.comment.startsWith("Risk Analysis: "));
                            let trimmedriskAnanlysisCmt = riskAnanlysisCmt.length ? riskAnanlysisCmt[0].comment.replace("Risk Analysis: ", "") : '';

                            var riskAnalysisSection = sap.ui.getCore().byId("vendoronboardapproval::vobApprovalObjectPage--fe::CustomSection::Riskanalysisapproval");
                            riskAnalysisSection.setShowTitle(false);
                            riskAnalysisSection.addSubSection(
                                new sap.uxap.ObjectPageSubSection({
                                    visible: true,
                                    title: "Risk Analysis Comment",
                                    blocks: [
                                        new sap.m.Text({
                                            text: `${trimmedriskAnanlysisCmt}`
                                        })
                                    ]
                                }).addStyleClass("commentBorderClass")
                            );
                        }
                        riskAnalysisSection.call(this);
                        ///RISK ANALYSIS END//


                        //workflow section
                        async function workflowSection() {
                            var workFlowSection = sap.ui.getCore().byId("vendoronboardapproval::vobApprovalObjectPage--fe::CustomSubSection::Workflowhistory");
                            var myoVbox = workFlowSection.mAggregations._grid.mAggregations.content[0].getContent();
                            myoVbox.destroyItems();
                            var workflowhistoryarray = workflowresp;
                            workflowhistoryarray.sort(function (a, b) {
                                // Split date and time components
                                function parseCustomDate(dateTimeStr) {
                                    // Example: "23/10/2024, 3:07:47 pm"
                                    const [datePart, timePart] = dateTimeStr.split(", ");

                                    // Split day, month, year
                                    const [day, month, year] = datePart.split("/").map(Number);

                                    // Construct a format that JavaScript can parse
                                    return new Date(`${year}-${month}-${day} ${timePart}`);
                                }

                                const dateA = parseCustomDate(a.end_date_time);
                                const dateB = parseCustomDate(b.end_date_time);

                                return dateA - dateB; // Ascending order
                            });

                            myoVbox.addStyleClass("scrollvbox");
                            let oTable = new sap.m.Table({
                                fixedLayout: false,
                                width: "110vw"
                            });

                            oTable.addStyleClass("tableWithBorder");

                            // Define Table columns, including Level
                            oTable.addColumn(new sap.m.Column({ header: new sap.m.Text({ text: "Level" }) }));
                            oTable.addColumn(new sap.m.Column({ header: new sap.m.Text({ text: "Employee ID" }) }));
                            oTable.addColumn(new sap.m.Column({ header: new sap.m.Text({ text: "Employee Name" }) }));
                            oTable.addColumn(new sap.m.Column({ header: new sap.m.Text({ text: "Status" }) }));
                            oTable.addColumn(new sap.m.Column({ header: new sap.m.Text({ text: "Begin Date" }) }));
                            oTable.addColumn(new sap.m.Column({ header: new sap.m.Text({ text: "End Date" }) }));
                            oTable.addColumn(new sap.m.Column({ header: new sap.m.Text({ text: "Days Taken" }) }));
                            oTable.addColumn(new sap.m.Column({ header: new sap.m.Text({ text: "Comments" }) }));

                            // Iterate over workflow history and add rows
                            workflowhistoryarray.forEach(function (item) {
                                var oRow = new sap.m.ColumnListItem();

                                // Determine display level
                                let displayLevel;
                                if (item.level === '0') {
                                    displayLevel = 0; // Keep it as is for level 0
                                } else {
                                    displayLevel = item.level;
                                }

                                // Add cells to the row
                                oRow.addCell(new sap.m.Text({ text: displayLevel })); // Display the numeric level
                                oRow.addCell(new sap.m.Text({ text: item.employee_id }));
                                oRow.addCell(new sap.m.Text({ text: item.employee_name }));
                                oRow.addCell(new sap.m.Text({ text: item.status }));
                                oRow.addCell(new sap.m.Text({ text: item.begin_date_time }));
                                oRow.addCell(new sap.m.Text({ text: item.end_date_time }));
                                oRow.addCell(new sap.m.Text({ text: item.days_taken }));

                                // Enable wrapping for multiline comments
                                oRow.addCell(new sap.m.TextArea({ value: item.comments || "", editable: false, growing: true, width: "100%" }))

                                oTable.addItem(oRow);
                            });

                            // Add the table to the VBox
                            myoVbox.addItem(oTable);
                        }
                        workflowSection.call(this);



                    } catch (error) {
                        oBusyDialogLoading.close();
                        console.log("Error", error);
                    }
                    finally {
                        oBusyDialogLoading.close();
                    }
                }
            }

        }
    });
});