const PDFDocument = require("pdfkit");

async function generateContractPDF(contractData, logoUrl) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    try {
      // ---------- HEADER ----------
      if (logoUrl) {
        doc.image(logoUrl, 450, 40, { width: 100 });
      }
      doc.fontSize(20).text("Studio Contract", 50, 50);
      doc.moveDown(2);

      // ---------- SECTION: Studio Info ----------
      sectionTitle(doc, "Studio Information");
      fieldLine(doc, "Studio Name", contractData.studioName);
      fieldLine(doc, "Studio Owner", contractData.studioOwnerName);
      doc.moveDown(1.5);

      // ---------- SECTION: Member Info ----------
      sectionTitle(doc, "Member Information");
      fieldLine(doc, "Full Name", contractData.fullName);
      fieldLine(doc, "Email", contractData.emailAdresse);
      fieldLine(
        doc,
        "Address",
        `${contractData.strasse || "-"} ${contractData.hausnummer || "-"}, ${contractData.plz || "-"} ${contractData.ort || "-"}`
      );
      fieldLine(doc, "Phone", contractData.telefonnummer);
      fieldLine(doc, "Mobile", contractData.mobil);
      doc.moveDown(1.5);

      // ---------- SECTION: Contract Details ----------
      sectionTitle(doc, "Contract Details");
      fieldLine(doc, "Duration", contractData.duration);
      fieldLine(doc, "Price per Week (€)", contractData.preisProWoche);
      fieldLine(doc, "Start Date", contractData.startDerMitgliedschaft);
      fieldLine(doc, "Training Start", contractData.startDesTrainings);
      fieldLine(doc, "Cancellation Notice", contractData.kuendigungsfrist);
      doc.moveDown(1.5);
      // ---------- SECTION: SEPA Details ----------
      sectionTitle(doc, "SEPA Details");
      fieldLine(doc, "Full Name", contractData.fullName);
      fieldLine(doc, "Credit Institute", contractData.kreditinstitut);
      fieldLine(doc, "BIC", contractData.bic);
      fieldLine(doc, "IBAN", contractData.iban);
      fieldLine(doc, "SEPA Reference Number", contractData.sepaMandate);
      doc.moveDown(1.5);

      // ---------- SECTION: Terms ----------
      sectionTitle(doc, "Terms & Conditions");
      doc.fontSize(11).text(
        `After the minimum term expires, the contract will continue indefinitely 
at a price of €42.90/week, unless terminated in writing within the notice period 
of 1 month before the end of the minimum term. No individual conditions for 
the subsequent period are agreed in the "Contract remarks" text field.`,
        { width: 500 }
      );
      doc.moveDown(2);

      // ---------- SECTION: Fee Adjustments ----------
      if (contractData.feeAdjustments) {
        sectionTitle(doc, "Fee Adjustments");
        doc.fontSize(12).text(contractData.feeAdjustments, { width: 500 });
        doc.moveDown(2);
      }

      // ---------- SIGNATURE ----------
      sectionTitle(doc, "Signature");
      doc.text("Place, Date: ____________________", { continued: true });
      doc.text("      Signature: ____________________");
      doc.moveDown(2);

      // Footer
      doc.fontSize(9).fillColor("gray").text("This contract is valid without signature i.A.kom.", {
        align: "center",
      });

      // End PDF
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

// Helpers
function sectionTitle(doc, title) {
  doc.fontSize(13).fillColor("black").text(title, { underline: true });
  doc.moveDown(0.5);
}

function fieldLine(doc, label, value) {
  doc.fontSize(12).fillColor("black").text(`${label}: `, { continued: true });
  doc.font("Helvetica-Bold").text(value || "-");
  doc.font("Helvetica");
}

module.exports = generateContractPDF;
