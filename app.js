import { DBModule } from './module/db/dbModule.js';
import { categories, months } from './module/data/data.js'; // Словарь категорий и подкатегорий, а также месяцев года
import { generateExpensesTable } from './module/ui/expensesTable.js';
import { getEl } from './module/util/util.js'
import { stores } from './module/db/schema.js'

const dbModule = new DBModule('ExpensesDB', 1);

dbModule.openDB(stores).then(() => {
    console.log("Database is ready for operations.");
}).catch(error => {
    console.error("Database error:", error);
});

function onInit() {
    document.addEventListener('DOMContentLoaded', function () {
        const categorySelect = getEl("category");
        const subcategorySelect = getEl("subcategory");

        // Функция для заполнения категорий
        function populateCategories() {
            for (let category in categories) {
                const option = document.createElement("option");
                option.value = category;
                option.textContent = category;
                categorySelect.appendChild(option);
            }
        }

        // Функция для обновления подкатегорий
        function updateSubcategories(category) {
            subcategorySelect.innerHTML = ""; // Очистка предыдущих подкатегорий
            categories[category].forEach(subcat => {
                const option = document.createElement("option");
                option.value = subcat;
                option.textContent = subcat;
                subcategorySelect.appendChild(option);
            });
        }

        // Инициализация категорий и подкатегорий
        populateCategories();
        updateSubcategories(categorySelect.value);

        categorySelect.onchange = function () {
            updateSubcategories(this.value);
        };

        // Ваш код для обработки добавления нового расхода и отображения всех расходов
        getEl("expenseForm").onsubmit = function (event) {
            event.preventDefault();
            const expenseData = {
                category: getEl("category").value,
                subcategory: getEl("subcategory").value,
                date: getEl("date").value,
                amount: getEl("amount").value,
                description: getEl("description").value
            };
            dbModule.addData("expenses", expenseData).then(() => {
                alert("Расход добавлен!");
                event.target.reset(); // Очистка формы
            }).catch(error => {
                console.error("Error adding expense:", error);
            });
        };

        getEl("showExpenses").onclick = showExpenses;
    });
}
onInit();

// Функция для отображения всех расходов
function showExpenses() {
    dbModule.getAllData("expenses").then(res => {
        const data = res.sort((a, b) => new Date(a.date) - new Date(b.date));
        const expensesHtml = generateExpensesTable(data, months);
        getEl("expensesList").innerHTML = expensesHtml;
    }).catch(error => {
        console.error("Error fetching expenses:", error);
    });
}

var item;

window.confirmDeletion =  (itemId) => {
    getEl('confirm').classList.remove('hidden');
    item = itemId
}

getEl('yes').addEventListener('click', function () {
    dbModule.deleteData("expenses", +item)
            .then(() => {
                showExpenses();
                alert("Элемент успешно удален");
            })
            .catch(error => console.error('Ошибка при удалении', error));
    getEl('confirm').classList.add('hidden');
});
getEl('no').addEventListener('click', function () {
    getEl('confirm').classList.add('hidden');
});

getEl('exportBtn').addEventListener('click', function () {
    dbModule.exportData().then((data) => {
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${Date().slice(0,15)}-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }).catch((error) => {
        console.error('Ошибка экспорта: ', error);
    });
});

getEl('importBtn').addEventListener('click', function () {
    getEl('fileInput').click();
});

getEl('fileInput').addEventListener('change', function (event) {
    const fileReader = new FileReader();
    fileReader.onload = function (e) {
        const data = e.target.result;
        dbModule.importData(data).then(() => {
            alert('Данные успешно импортированы');
            showExpenses();
        }).catch((error) => {
            console.error('Ошибка импорта: ', error);
        });
    };
    fileReader.readAsText(event.target.files[0]);
});

getEl("showExpenses").onclick = showExpenses;

getEl('addExpenseBtn').addEventListener('click', function () {
    getEl('addExpenseSection').classList.remove('hidden');
    getEl('totalExpensesSection').classList.add('hidden');
});

getEl('totalExpensesBtn').addEventListener('click', function () {
    getEl('addExpenseSection').classList.add('hidden');
    getEl('totalExpensesSection').classList.remove('hidden');
});