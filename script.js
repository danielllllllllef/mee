function addRow() {
    let table = document.getElementById("excelTable").getElementsByTagName('tbody')[0];
    let newRow = table.insertRow();
    let rowIndex = table.rows.length;
    let headerCell = newRow.insertCell(0);
    headerCell.outerHTML = `<th>${rowIndex}</th>`;
    for (let i = 1; i < table.rows[0].cells.length; i++) {
        let newCell = newRow.insertCell(i);
        newCell.contentEditable = "true";
        newCell.tabIndex = 1;
        newCell.addEventListener("keydown", navigateCells);
        newCell.addEventListener("click", selectCell);
    }
}

function addColumn() {
    let table = document.getElementById('excelTable');
    let colCount = table.rows[0].cells.length;

    let headerCell = document.createElement('th');
    headerCell.textContent = String.fromCharCode(64 + colCount);
    table.rows[0].appendChild(headerCell);

    for (let i = 1; i < table.rows.length; i++) {
        let cell = table.rows[i].insertCell(colCount);
        cell.contentEditable = "true";
        cell.onpaste = handlePaste;
        cell.onclick = selectCell;
    }
}

document.querySelectorAll("#excelTable td[contenteditable=true]").forEach(cell => {
    cell.addEventListener("paste", handlePaste);
});


function calculateOperation() {
    let table = document.getElementById("excelTable");
    let columnIndex = document.getElementById("columnIndex").value;
    let operation = document.getElementById("operation").value;
    let result = 0;
    let count = 0;
    let firstValue = true;

    for (let i = 1; i < table.rows.length; i++) {
        let cellValue = table.rows[i].cells[columnIndex].innerText;
        if (cellValue !== "") {
            let value = parseFloat(cellValue);
            if (isNaN(value)) continue;

            if (firstValue) {
                result = value;
                firstValue = false;
            } else {
                switch (operation) {
                    case "sum":
                        result += value;
                        break;
                    case "subtract":
                        result -= value;
                        break;
                    case "multiply":
                        result *= value;
                        break;
                    case "divide":
                        result /= value;
                        break;
                }
            }
            if (operation === "average") {
                result += value;
                count++;
            }
        }
    }

    if (operation === "average" && count > 0) {
        result = result / count;
    }

    let operationName = {
        "sum": "Suma",
        "subtract": "Resta",
        "multiply": "Multiplicación",
        "divide": "División",
        "average": "Promedio"
    };

    document.getElementById("result").innerText = `${operationName[operation]} de la columna ${String.fromCharCode(64 + parseInt(columnIndex))}: ${result}`;
}

function navigateCells(event) {
    let key = event.key;
    let cell = event.target;
    let row = cell.parentElement;
    let table = row.parentElement.parentElement;
    let cellIndex = cell.cellIndex;
    let rowIndex = row.rowIndex;

    switch (key) {
        case "ArrowRight":
            if (cellIndex < row.cells.length - 1) {
                row.cells[cellIndex + 1].focus();
            }
            break;
        case "ArrowLeft":
            if (cellIndex > 1) {
                row.cells[cellIndex - 1].focus();
            }
            break;
        case "ArrowDown":
            if (rowIndex < table.rows.length - 1) {
                table.rows[rowIndex + 1].cells[cellIndex].focus();
            }
            break;
        case "ArrowUp":
            if (rowIndex > 1) {
                table.rows[rowIndex - 1].cells[cellIndex].focus();
            }
            break;
    }
}

function applyColor() {
    let selectedColor = document.getElementById("colorSelect").value;
    let selectedCells = document.querySelectorAll("#excelTable td.selected");
    if (selectedCells.length > 0) {
        selectedCells.forEach(cell => {
            cell.style.backgroundColor = selectedColor;
        });
    }
}

function selectCell(event) {
    document.querySelectorAll("#excelTable td").forEach(cell => {
        cell.classList.remove('selected');
    });
    event.target.classList.add('selected');
}

document.querySelectorAll("#excelTable td[contenteditable=true]").forEach(cell => {
    cell.tabIndex = 1;
    cell.addEventListener("keydown", navigateCells);
    cell.addEventListener("click", selectCell);
});

function saveData() {
    let table = document.getElementById('excelTable');
    let rows = table.getElementsByTagName('tr');
    let data = [];

    for (let i = 1; i < rows.length; i++) {
        let cells = rows[i].getElementsByTagName('td');
        let row = [];
        for (let j = 0; j < cells.length; j++) {
            row.push(cells[j].innerHTML); // Store the innerHTML to include images
        }
        data.push(row);
    }

    localStorage.setItem('tableData', JSON.stringify(data));
    alert('Datos guardados exitosamente.');
}

function loadData() {
    let table = document.getElementById('excelTable');
    let data = JSON.parse(localStorage.getItem('tableData'));

    if (data) {
        for (let i = 1; i < table.rows.length; i++) {
            table.deleteRow(i);
        }

        for (let i = 0; i < data.length; i++) {
            let newRow = table.insertRow();
            for (let j = 0; j < data[i].length; j++) {
                let newCell = newRow.insertCell();
                newCell.innerHTML = data[i][j];
                newCell.contentEditable = "true";
                newCell.onpaste = handlePaste;
                newCell.onclick = selectCell;
            }
        }

        alert('Datos cargados exitosamente.');
    } else {
        alert('No hay datos guardados.');
    }
}

function addRow() {
    let table = document.getElementById('excelTable');
    let rowCount = table.rows.length;
    let colCount = table.rows[0].cells.length;
    let row = table.insertRow(rowCount);

    let th = document.createElement('th');
    th.textContent = rowCount;
    row.appendChild(th);

    for (let i = 1; i < colCount; i++) {
        let cell = row.insertCell(i);
        cell.contentEditable = "true";
        cell.onpaste = handlePaste;
        cell.onclick = selectCell;
    }
}


function exportToCSV() {
    let table = document.getElementById("excelTable");
    let csvContent = "data:text/csv;charset=utf-8,";
    let headerRow = Array.from(table.rows[0].cells).map(cell => cell.innerText).join(",") + "\n";
    csvContent += headerRow;

    for (let i = 1; i < table.rows.length; i++) {
        let row = table.rows[i];
        let rowData = Array.from(row.cells).map(cell => cell.innerText).join(",");
        csvContent += rowData + "\n";
    }

    let encodedUri = encodeURI(csvContent);
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "mini_excel.csv");
    document.body.appendChild(link);
    link.click();
}

function searchTable() {
    let input = document.getElementById('searchInput');
    let filter = input.value.toUpperCase();
    let table = document.getElementById('excelTable');
    let tr = table.getElementsByTagName('tr');

    for (let i = 1; i < tr.length; i++) {
        let tds = tr[i].getElementsByTagName('td');
        let found = false;
        for (let j = 0; j < tds.length; j++) {
            if (tds[j]) {
                let txtValue = tds[j].textContent || tds[j].innerText;
                if (txtValue.toUpperCase().indexOf(filter) > -1) {
                    found = true;
                    break;
                }
            }
        }
        tr[i].style.display = found ? '' : 'none';
    }
}
function insertImage(event) {
    let input = event.target;
    if (input.files && input.files[0]) {
        let reader = new FileReader();
        reader.onload = function(e) {
            let img = document.createElement('img');
            img.src = e.target.result;
            img.alt = "Imagen no disponible";
            let selectedCell = document.querySelector("#excelTable td.selected");
            if (selectedCell) {
                selectedCell.innerHTML = '';
                selectedCell.appendChild(img);
            }
        };
        reader.readAsDataURL(input.files[0]);
    }
}

document.querySelectorAll("#excelTable td[contenteditable=true]").forEach(cell => {
    cell.addEventListener("dblclick", function() {
        document.getElementById("imageInput").click();
    });
});

function selectCell(event) {
    document.querySelectorAll("#excelTable td").forEach(cell => {
        cell.classList.remove('selected');
    });
    event.target.classList.add('selected');
}

document.querySelectorAll("#excelTable td[contenteditable=true]").forEach(cell => {
    cell.tabIndex = 1;
    cell.addEventListener("keydown", navigateCells);
    cell.addEventListener("click", selectCell);
});

function searchTable() {
    let input = document.getElementById('searchInput');
    let filter = input.value.toUpperCase();
    let table = document.getElementById('excelTable');
    let tr = table.getElementsByTagName('tr');

    for (let i = 1; i < tr.length; i++) {
        let tds = tr[i].getElementsByTagName('td');
        let found = false;
        for (let j = 0; j < tds.length; j++) {
            if (tds[j]) {
                let txtValue = tds[j].textContent || tds[j].innerText;
                if (txtValue.toUpperCase().indexOf(filter) > -1) {
                    found = true;
                    break;
                }
            }
        }
        tr[i].style.display = found ? '' : 'none';
    }
}
function handlePaste(event) {
    event.preventDefault();
    let clipboardData = event.clipboardData;
    let items = clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
            let blob = items[i].getAsFile();
            let reader = new FileReader();
            reader.onload = function(event) {
                let img = document.createElement("img");
                img.src = event.target.result;
                let selectedCell = document.activeElement;
                if (selectedCell && selectedCell.tagName === "TD") {
                    selectedCell.innerHTML = '';
                    selectedCell.appendChild(img);
                }
            };
            reader.readAsDataURL(blob);
        }
    }
}

function selectCell(event) {
    document.querySelectorAll("#excelTable td").forEach(cell => {
        cell.classList.remove('selected');
    });
    event.target.classList.add('selected');
}

document.querySelectorAll("#excelTable td[contenteditable=true]").forEach(cell => {
    cell.tabIndex = 1;
    cell.addEventListener("keydown", navigateCells);
    cell.addEventListener("click", selectCell);
});

function searchTable() {
    let input = document.getElementById('searchInput');
    let filter = input.value.toUpperCase();
    let table = document.getElementById('excelTable');
    let tr = table.getElementsByTagName('tr');

    for (let i = 1; i < tr.length; i++) {
        let tds = tr[i].getElementsByTagName('td');
        let found = false;
        for (let j = 0; j < tds.length; j++) {
            if (tds[j]) {
                let txtValue = tds[j].textContent || tds[j].innerText;
                if (txtValue.toUpperCase().indexOf(filter) > -1) {
                    found = true;
                    break;
                }
            }
        }
        tr[i].style.display = found ? '' : 'none';
    }
}

function authenticate() {
    const password = document.getElementById('password').value;
    if (password === 'mee0909') { // Cambia esto a tu contraseña deseada
        localStorage.setItem('authenticated', 'true');
        transitionToExcel();
    } else {
        alert('Contraseña incorrecta. Inténtalo de nuevo.');
    }
}

function transitionToExcel() {
    const loginContainer = document.getElementById('loginContainer');
    const excelContainer = document.getElementById('excelContainer');

    loginContainer.classList.add('hidden');
    setTimeout(() => {
        loginContainer.style.display = 'none';
        excelContainer.style.display = 'block';
        setTimeout(() => {
            excelContainer.classList.add('visible');
        }, 50);
    }, 500);
}

function checkAuthentication() {
    if (localStorage.getItem("authenticated") === "true") {
        document.getElementById('loginContainer').style.display = 'none';
        const excelContainer = document.getElementById('excelContainer');
        excelContainer.style.display = 'block';
        setTimeout(() => {
            excelContainer.classList.add('visible');
        }, 50);
    }
}

window.onload = checkAuthentication;

// (Resto del código de script.js)
