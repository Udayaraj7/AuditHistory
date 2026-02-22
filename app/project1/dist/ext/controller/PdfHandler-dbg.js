// sap.ui.define([
//     "sap/m/MessageToast"
// ], function (MessageToast) {
//     'use strict';

//     return {
//         /**
//          * Generated event handler.
//          *
//          * @param oContext the context of the page on which the event was fired. `undefined` for list report page.
//          * @param aSelectedContexts the selected contexts of the table rows.
//          */
      

// pdfmethod: async function () {

//     const domRef = document.querySelector(".sapUxAPObjectPageWrapper");

//     if (!domRef) {
//         sap.m.MessageToast.show("Scroll container not found");
//         return;
//     }

//     // Force full content load
//     domRef.scrollTop = domRef.scrollHeight;
//     await new Promise(resolve => setTimeout(resolve, 1500));
//     domRef.scrollTop = 0;
//     await new Promise(resolve => setTimeout(resolve, 500));

//     // Capture full scrollable content
//     const canvas = await html2canvas(domRef, {
//         scale: 2,
//         useCORS: true,
//         scrollX: 0,
//         scrollY: 0,
//         width: domRef.scrollWidth,
//         height: domRef.scrollHeight,
//         windowWidth: domRef.scrollWidth,
//         windowHeight: domRef.scrollHeight
//     });

//     const { jsPDF } = window.jspdf;
//     const pdf = new jsPDF("l", "mm", "a4");

//     const imgWidthPx = canvas.width;
//     const imgHeightPx = canvas.height;

//     // ===== Margins =====
//     const marginTop = 20;
//     const marginBottom = 20;
//     const marginLeft = 15;
//     const marginRight = 15;

//     const pageWidth = pdf.internal.pageSize.getWidth();
//     const pageHeight = pdf.internal.pageSize.getHeight();

//     const contentWidth = pageWidth - marginLeft - marginRight;
//     const contentHeight = pageHeight - marginTop - marginBottom;

//     // Convert PDF content height to canvas pixels
//     const pageCanvasHeight = (contentHeight * imgWidthPx) / contentWidth;

//     let position = 0;
//     let pageNumber = 1;

//     function addLayout(pageNo) {

//         // Border
//         pdf.setDrawColor(0);
//         pdf.setLineWidth(0.5);
//         pdf.rect(
//             marginLeft,
//             marginTop,
//             contentWidth,
//             contentHeight
//         );

//         // Header
//         pdf.setFontSize(14);
//         // pdf.text(
//         //     "Customer Report",
//         //     marginLeft,
//         //     marginTop - 8
//         // );

//         // Footer
//         pdf.setFontSize(10);
//         pdf.text(
//             "Page " + pageNo,
//             pageWidth - marginRight - 25,
//             pageHeight - 8
//         );
//     }

//     // ===== Page Loop =====
//     while (position < imgHeightPx) {

//         if (pageNumber > 1) {
//             pdf.addPage();
//         }

//         addLayout(pageNumber);

//         const pageCanvas = document.createElement("canvas");
//         pageCanvas.width = imgWidthPx;
//         pageCanvas.height = Math.min(pageCanvasHeight, imgHeightPx - position);

//         const ctx = pageCanvas.getContext("2d");

//         ctx.drawImage(
//             canvas,
//             0,
//             position,
//             imgWidthPx,
//             pageCanvas.height,
//             0,
//             0,
//             imgWidthPx,
//             pageCanvas.height
//         );

//         const pageImgData = pageCanvas.toDataURL("image/png");

//         const pageImgHeight = (pageCanvas.height * contentWidth) / imgWidthPx;

//         pdf.addImage(
//             pageImgData,
//             "PNG",
//             marginLeft,
//             marginTop,
//             contentWidth,
//             pageImgHeight
//         );

//         position += pageCanvasHeight;
//         pageNumber++;
//     }

//     pdf.save("FullPage_Landscape_WithMargin.pdf");
// }



//     };
// });

sap.ui.define([
    "sap/m/MessageToast",
    "sap/m/BusyDialog"
], function (MessageToast, BusyDialog) {
    "use strict";

    return {

        pdfmethod: async function () {

            const oBusy = new BusyDialog({
                text: "Generating PDF, please wait..."
            });

            try {

                // ================================
                // 1️⃣ Load External Libraries if Needed
                // ================================
                function loadScript(url) {
                    return new Promise((resolve, reject) => {
                        if (document.querySelector(`script[src="${url}"]`)) {
                            resolve();
                            return;
                        }
                        const script = document.createElement("script");
                        script.src = url;
                        script.onload = resolve;
                        script.onerror = reject;
                        document.head.appendChild(script);
                    });
                }

                await Promise.all([
                    loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"),
                    loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js")
                ]);

                oBusy.open();

                // ================================
                // 2️⃣ Get Object Page Wrapper
                // ================================
                const oObjectPage = sap.ui.getCore().byId(
                    "project1::CustomerObjectPage--fe::ObjectPage"
                );

                if (!oObjectPage) {
                    MessageToast.show("Object Page not found");
                    return;
                }

                const domRef = oObjectPage.getDomRef().querySelector(".sapUxAPObjectPageWrapper");

                if (!domRef) {
                    MessageToast.show("Scroll container not found");
                    return;
                }

                // ================================
                // 3️⃣ Force Lazy Load Sections
                // ================================
                domRef.scrollTop = domRef.scrollHeight;
                await new Promise(r => setTimeout(r, 1200));
                domRef.scrollTop = 0;
                await new Promise(r => setTimeout(r, 500));

                // Hide unwanted UI elements
                document.body.classList.add("print-mode");

                // ================================
                // 4️⃣ Capture Full Page
                // ================================
                const canvas = await html2canvas(domRef, {
                    scale: 2,
                    useCORS: true,
                    scrollX: 0,
                    scrollY: 0,
                    width: domRef.scrollWidth,
                    height: domRef.scrollHeight,
                    windowWidth: domRef.scrollWidth,
                    windowHeight: domRef.scrollHeight
                });

                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF("l", "mm", "a4");

                const imgWidthPx = canvas.width;
                const imgHeightPx = canvas.height;

                // ================================
                // 5️⃣ Margins Setup
                // ================================
                const marginTop = 20;
                const marginBottom = 20;
                const marginLeft = 15;
                const marginRight = 15;

                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();

                const contentWidth = pageWidth - marginLeft - marginRight;
                const contentHeight = pageHeight - marginTop - marginBottom;

                const pageCanvasHeight = (contentHeight * imgWidthPx) / contentWidth;

                let position = 0;
                let pageNumber = 1;

                // ================================
                // 6️⃣ Header + Footer Layout
                // ================================
                function addLayout(pageNo) {

                    // Border
                    pdf.setDrawColor(0);
                    pdf.setLineWidth(0.5);
                    pdf.rect(
                        marginLeft,
                        marginTop,
                        contentWidth,
                        contentHeight
                    );

                    // Header (Dynamic Title)
                    pdf.setFontSize(14);
                    // pdf.text(
                    //     oObjectPage.getHeaderTitle().getObjectTitle(),
                    //     marginLeft,
                    //     marginTop - 8
                    // );

                    // Footer
                    pdf.setFontSize(10);
                    pdf.text(
                        "Page " + pageNo,
                        pageWidth - marginRight - 25,
                        pageHeight - 8
                    );
                }

                // ================================
                // 7️⃣ Page Splitting Logic
                // ================================
                while (position < imgHeightPx) {

                    if (pageNumber > 1) {
                        pdf.addPage();
                    }

                    addLayout(pageNumber);

                    const pageCanvas = document.createElement("canvas");
                    pageCanvas.width = imgWidthPx;
                    pageCanvas.height = Math.min(pageCanvasHeight, imgHeightPx - position);

                    const ctx = pageCanvas.getContext("2d");

                    ctx.drawImage(
                        canvas,
                        0,
                        position,
                        imgWidthPx,
                        pageCanvas.height,
                        0,
                        0,
                        imgWidthPx,
                        pageCanvas.height
                    );

                    const pageImgData = pageCanvas.toDataURL("image/png");
                    const pageImgHeight = (pageCanvas.height * contentWidth) / imgWidthPx;

                    pdf.addImage(
                        pageImgData,
                        "PNG",
                        marginLeft,
                        marginTop,
                        contentWidth,
                        pageImgHeight
                    );

                    position += pageCanvasHeight;
                    pageNumber++;
                }

                // ================================
                // 8️⃣ Save PDF with Dynamic Name
                // ================================
                const fileName =  "sampleproject";
                pdf.save(fileName);

            } catch (error) {
                console.error(error);
                MessageToast.show("Error generating PDF");
            } finally {
                document.body.classList.remove("print-mode");
                oBusy.close();
            }
        }

    };
});








