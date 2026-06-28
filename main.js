const material = document.getElementById("material");
const addBtn = document.getElementById("add-item");
const container = document.getElementById("items-container");

// Load data when page opens
document.addEventListener("DOMContentLoaded", loadData);

// Save material whenever it changes
material.addEventListener("change", saveData);

// Add Item
addBtn.addEventListener("click", () => {

    if (!material.value) {
        alert("Please select a material.");
        return;
    }

    createItem();
    saveData();
});

// Create Item
function createItem(name = "", grams = "") {

    const item = document.createElement("div");
    item.className = "items";

    item.innerHTML = `
        <h3 class="item-number"></h3>
   
        <input type="text"
               class="item-name"
               placeholder="Enter Item Name"
               value="${name}">

       
        <input type="number"
               class="grams"
               placeholder="Enter Grams"
               value="${grams}">
        
     
        <button type="button" class="remove-btn"> <i class="bi bi-trash3"></i> </button>
    `;

    container.appendChild(item);

    item.querySelector(".item-name").addEventListener("input", saveData);
    item.querySelector(".grams").addEventListener("input", saveData);

    item.querySelector(".remove-btn").addEventListener("click", () => {
        item.remove();
        updateNumbers();
        saveData();
    });

    updateNumbers();
}

// Update Item Numbers
function updateNumbers() {

    document.querySelectorAll(".items").forEach((item, index) => {
        item.querySelector(".item-number").textContent = ` ${index + 1}.`;
    });

}

// Save Everything
function saveData() {

    const items = [];

    document.querySelectorAll(".items").forEach(item => {

        items.push({
            name: item.querySelector(".item-name").value,
            grams: item.querySelector(".grams").value
        });

    });

    const data = {
        material: material.value,
        items: items
    };

    localStorage.setItem("printData", JSON.stringify(data));
}

// Load Everything
function loadData() {

    const data = JSON.parse(localStorage.getItem("printData"));

    if (!data) return;

    material.value = data.material || "";

    data.items.forEach(item => {
        createItem(item.name, item.grams);
    });
}


function loadData() {

    const data = JSON.parse(localStorage.getItem("printData"));

    if (!data) return;

    material.value = data.material || "";

    data.items.forEach(item => {
        createItem(item.name, item.grams);
    });

    document.getElementById("total-grams").textContent = data.totalGrams || 0;
    document.getElementById("price-per-gram").textContent = data.pricePerGram || 0;
    document.getElementById("total-cost").textContent = data.totalCost || 0;
}


const calculateBtn = document.getElementById("calculate");

calculateBtn.addEventListener("click", calculateCost);
function calculateCost() {

    let totalGrams = 0;

    document.querySelectorAll(".grams").forEach(input => {
        totalGrams += Number(input.value) || 0;
    });

    const materialPrices = {
        pla: 7,
        abs: 12,
        petg: 10,
        nylon: 15
    };

    const pricePerGram = materialPrices[material.value] || 0;
    const totalCost = totalGrams * pricePerGram;

    document.getElementById("total-grams").textContent = totalGrams;
    document.getElementById("price-per-gram").textContent = pricePerGram;
    document.getElementById("total-cost").textContent = totalCost;

    saveData(); // Save calculation results
}


function saveData() {

    const items = [];

    document.querySelectorAll(".items").forEach(item => {
        items.push({
            name: item.querySelector(".item-name").value,
            grams: item.querySelector(".grams").value
        });
    });

    const data = {
        material: material.value,
        items: items,
        totalGrams: document.getElementById("total-grams").textContent,
        pricePerGram: document.getElementById("price-per-gram").textContent,
        totalCost: document.getElementById("total-cost").textContent
    };

    localStorage.setItem("printData", JSON.stringify(data));
}



const exportBtn = document.getElementById("pdf");

exportBtn.addEventListener("click", exportPDF);

function exportPDF() {

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
    });

    // Title
    doc.setFontSize(18);
    doc.text("3D Printing Cost Report", 14, 15);

    // Material
    doc.setFontSize(12);
    doc.text(`Material : ${material.value.toUpperCase()}`, 14, 25);


    // Create table rows
    const rows = [];

    document.querySelectorAll(".items").forEach((item, index) => {

        rows.push([
            index + 1,
            item.querySelector(".item-name").value || "-",
            (item.querySelector(".grams").value || "0") + " g"
        ]);

    });

    // Table
    doc.autoTable({

        startY: 35,

        head: [[
            "S.No",
            "Item Name",
            "Weight (g)"
        ]],

        body: rows,

        theme: "grid",

        styles: {
            fontSize: 10,
            cellPadding: 3,
            valign: "middle"
        },

        headStyles: {
            fillColor: [22, 101, 192],
            textColor: 255,
            halign: "center"
        },

        columnStyles: {
            0: { halign: "center", cellWidth: 20 },
            1: { cellWidth: 180 },
            2: { halign: "center", cellWidth: 40 }
        }

    });

    // Totals
    let finalY = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(12);
    doc.text(
        `Total Grams : ${document.getElementById("total-grams").textContent} g`,
        14,
        finalY
    );

    finalY += 8;

    doc.text(
        `Total Cost : ${document.getElementById("total-cost").textContent}.00`,
        14,
        finalY
    );

    doc.save("3D_Print_Cost_Report.pdf");

}
