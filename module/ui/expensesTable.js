export function generateExpensesTable(data, months) {
    let html = "<table class='expenses-table'>";
    // Добавляем новый заголовок для колонки удаления
    html += "<tr><th>Дата</th><th>Категория</th><th>Подкатегория</th><th>Сумма</th><th>Описание</th><th></th></tr>";
    let totalAmount = 0;
    let monthlyTotal = 0;
    let currentMonth = "";

    data.forEach((item, index) => {
        const itemDate = new Date(item.date);
        const itemMonth = `${itemDate.getFullYear()}-${itemDate.getMonth() + 1}`;

        if (itemMonth !== currentMonth) {
            if (currentMonth !== "") {
                html += `<tr class='monthly-total'><td colspan="6"><strong>Итого за ${months[currentMonth.match(/(\d{4})-(\d{1,2})/)[2] - 1]}: ${monthlyTotal} рублей</strong></td></tr>`;
            }
            monthlyTotal = 0;
            currentMonth = itemMonth;
        }

        monthlyTotal += Number(item.amount);
        totalAmount += Number(item.amount);

        // Добавляем в каждую строку данных крестик для удаления с data-key
        html += `<tr>
                    <td>${item.date}</td>
                    <td>${item.category}</td>
                    <td>${item.subcategory}</td>
                    <td><strong>${item.amount}</strong> рублей</td>
                    <td>${item.description}</td>
                    <td data-key="${item.key}" onclick="confirmDeletion('${item.key}')" class="delete-cross">✖</td>
                </tr>`;

        if (index === data.length - 1) {
            html += `<tr class='monthly-total'><td colspan="6"><strong>Итого за ${months[currentMonth.match(/(\d{4})-(\d{1,2})/)[2] - 1]}: ${monthlyTotal} рублей</strong></td></tr>`;
        }
    });

    html += `<tr class='total'><td colspan="6"><strong>Общий итог: ${totalAmount} рублей</strong></td></tr>`;
    html += "</table>";

    return html;
}
