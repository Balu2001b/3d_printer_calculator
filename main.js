// ELEMENTS
const material = document.getElementById("material");
const addBtn = document.getElementById("add-item");
const container = document.getElementById("items-container");
const calculateBtn = document.getElementById("calculate");
const exportBtn = document.getElementById("pdf");

// PAGE LOAD
document.addEventListener(
    "DOMContentLoaded",
    loadData
);

// MATERIAL CHANGE
material.addEventListener(
    "change",
    saveData
);

// ADD ITEM
addBtn.addEventListener(
    "click",
    () => {
        if (!material.value) {
            alert("Please select a material.");
            return;
        }
        createItem();
        saveData();
        showToast();
    }
);

// CREATE ITEM
function createItem(
    name = "",
    grams = "",
    time = "",
    printer = "bambu"
) {
    const item =
        document.createElement("div");
    item.className = "items";
    item.innerHTML = `
        <div class="item-number"></div>
        <div class="field"> <label> Items </label>
            <input type="text" class="item-name" placeholder="Enter Item Name" value="${name}">
        </div>
        <div class="field"> <label> Grams </label>
            <input type="number" class="grams" placeholder="Enter Grams" value="${grams}">
        </div>
        <div class="field"> <label> Time </label>
            <input type="number" class="time" placeholder="Enter Time in Hours" value="${time}">
        </div>
        <div class="field"> <label> Select 3D Printer </label>
            <select class="printer-select">
                <option value="bambu"> Bambu </option>
                <option value="elegoo"> Elegoo Neptune 4 Max </option>
            </select>
        </div>
        <button type="button" class="remove-btn">
            <i class="bi bi-trash3"></i>
        </button>
    `;
    container.appendChild(item);
    item.querySelector(".printer-select").value = printer;
    item.querySelector(".item-name").addEventListener("input", saveData);
    item.querySelector(".grams").addEventListener("input", saveData);
    item.querySelector(".time").addEventListener("input", saveData);
    item.querySelector(".printer-select").addEventListener("change", saveData);
    item.querySelector(".remove-btn").addEventListener("click",() => {
            item.remove();
            updateNumbers();
            saveData();
        }
    );
    updateNumbers();
}

// UPDATE ITEM NUMBERS
function updateNumbers() {
    document.querySelectorAll(".items").forEach((item, index) => {
    item.querySelector(".item-number").textContent = `${index + 1}.`;
            }
        );
}

// SAVE DATA
function saveData() {
    const items = [];
    document.querySelectorAll(".items").forEach(item => {
        items.push({ 
            name: item.querySelector(".item-name").value, 
            grams: item.querySelector(".grams").value,
            time: item.querySelector(".time").value,
            printer: item.querySelector(".printer-select").value
                });
            }
        );
    const data = {
        material: material.value,
        items: items,
        totalGrams: document.getElementById("total-grams").textContent,
        totalTime: document.getElementById("total-time").textContent,
        pricePerGram: document.getElementById("price-per-gram").textContent,
        totalCost: document.getElementById("total-cost").textContent
    };
    localStorage.setItem("printData",
        JSON.stringify(data)
    );
}

// LOAD DATA
function loadData() {
    const savedData =
        localStorage.getItem("printData");
    if (!savedData) {
        return;
    }
    const data =
        JSON.parse(savedData);
    material.value = data.material || "pla";
    if (data.items) {
        data.items.forEach(
            item => {
                createItem(
                    item.name || "",
                    item.grams || "",
                    item.time || "",
                    item.printer || "bambu"
                );
            }
        );
    }
    document.getElementById("total-grams").textContent = data.totalGrams || 0;
    document.getElementById("total-time").textContent = data.totalTime || "0 hrs";
    document.getElementById("price-per-gram").textContent = data.pricePerGram || 0;
    document.getElementById("total-cost").textContent = data.totalCost || 0;
}

// CALCULATE
calculateBtn.addEventListener("click", calculateCost);

function calculateCost() {
    let totalGrams = 0;
    let totalTime = 0;

// CALCULATE TOTAL GRAMS
    document.querySelectorAll(".grams").forEach(input => {
                totalGrams += Number(input.value) || 0;
            }
        );

// CALCULATE TOTAL TIME
    document.querySelectorAll(".time").forEach(input => {
                totalTime += Number(input.value) || 0;
            }
        );

// MATERIAL PRICES
    const materialPrices = {
        pla: 7,
        abs: 12,
    };
    const pricePerGram = materialPrices[material.value] || 0;
    const totalCost = totalGrams *pricePerGram;

// CONVERT TIME
    const days = Math.floor(totalTime / 24);
    const hours = totalTime % 24;
    let timeText = "";
    if (days > 0) {
        timeText += days +
            (
                days === 1
                    ? " day"
                    : " days"
            );
    }
    if (hours > 0) {
        if (timeText !== "") {
            timeText += " ";
        }

        timeText += hours +
            (
                hours === 1
                    ? " hr"
                    : " hrs"
            );
    }
    if (timeText === "") {
        timeText = "0 hrs";
    }
    document.getElementById("total-grams").textContent = totalGrams;
    document.getElementById("total-time").textContent = timeText;
    document.getElementById("price-per-gram").textContent = pricePerGram;
    document.getElementById("total-cost").textContent = totalCost;
    saveData();
}

// EXPORT PDF

exportBtn.addEventListener("click", exportPDF);
function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4"
        });

// LOAD COMPANY LOGO
    const logo = new Image();
    logo.src = "logo.jpeg";
    logo.onload = function () {
        doc.addImage(logo, "JPEG", 14, 7, 40, 28);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("3D LEVIN ENGINEERING PRIVATE LIMITED", 60, 11);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text("#36, 2nd Floor, Phase 1 Road", 60, 17);
        doc.text("Tie Balanagar", 60, 22);
        doc.text("Hyderabad Telangana 500037 India", 60, 27);
        doc.text("GSTIN 36AABCZ7706L1ZV", 60, 32);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text( `Material : ${material.value.toUpperCase()}`, 14, 45);

            // TABLE DATA
    const rows = [];
        document.querySelectorAll(".items").forEach((item, index) => {
    const itemName = item.querySelector(".item-name").value || "-";
    const grams = Number(item.querySelector(".grams").value) || 0;
    rows.push([index + 1, itemName, `${grams} g`]);
         }
    );

 // PDF TABLE
        doc.autoTable({startY: 50, head: [["S.No", "Item Name", "Weight (g)"]],
        body: rows,
        theme: "grid",

  // TABLE DATA STYLE
         styles: {
              font: "helvetica",
              fontSize: 12,
              cellPadding: 3,
              valign: "middle"
              },

 // TABLE HEADER STYLE
         headStyles: {
              fillColor: [22, 101, 192],
              textColor: 255,
              fontSize: 12,
              fontStyle: "bold",
              halign: "center",
              valign: "middle",
              cellPadding: 3
    },

 // COLUMN WIDTHS
     columnStyles: { 0: {
          halign: "center",
          cellWidth: 25
     },
    1: { cellWidth: 150 },
    2: { halign: "center", cellWidth: 45 }
         }
            });

  // TOTALS
    let finalY = doc.lastAutoTable.finalY + 12;
        const totalGrams = Number(
            document.getElementById("total-grams").textContent) || 0;
        const totalCost = Number(
            document.getElementById("total-cost").textContent) || 0;

   // TOTAL STYLE
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);

 // TOTAL GRAMS
            doc.text("Total Grams", 14, finalY);
            doc.text(":", 50, finalY);
            doc.text(`${totalGrams} g`, 57, finalY);

// TOTAL COST
  finalY += 9;
    doc.text("Total Cost", 14, finalY);
    doc.text(":", 50, finalY);
    doc.text(totalCost.toFixed(2), 57, finalY);

 // SAVE PDF
    doc.save("3D_Print_Cost_Report.pdf");
        showPdf();
        };

// LOGO ERROR HANDLER
    logo.onerror = function () {
         alert("Logo not found! Please keep logo.jpeg in the same folder as index.html.");
        };
}

// ITEM ADDED TOAST
function showToast() {
    const toast = document.getElementById("toast");
    toast.classList.add("show");
    setTimeout(
        () => {
            toast.classList.remove("show");
        },
        2500
    );
}

// PDF SUCCESS TOAST
function showPdf() {
    const toast = document.getElementById("toast_pdf");
    toast.classList.add("show");
    setTimeout( () => {
            toast.classList.remove("show");
        },
        2500
    );
}
