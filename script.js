document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('debtForm');
    const debtList = document.getElementById('debtList');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const exportBtn = document.getElementById('exportBtn');
    let debts = JSON.parse(localStorage.getItem('debts')) || [];

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        addDebt();
    });

    searchInput.addEventListener('input', renderDebtList);
    sortSelect.addEventListener('change', renderDebtList);
    exportBtn.addEventListener('click', exportToCSV);

    function addDebt() {
        const name = document.getElementById('name').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const description = document.getElementById('description').value;
        const date = new Date().toISOString();

        debts.unshift({ name, amount, description, date, paid: false });
        saveDebts();
        renderDebtList();
        form.reset();
    }

    function renderDebtList() {
        const searchTerm = searchInput.value.toLowerCase();
        const sortMethod = sortSelect.value;
        
        let filteredDebts = debts.filter(debt => 
            debt.name.toLowerCase().includes(searchTerm) ||
            debt.description.toLowerCase().includes(searchTerm)
        );

        filteredDebts.sort((a, b) => {
            switch (sortMethod) {
                case 'dateDesc': return new Date(b.date) - new Date(a.date);
                case 'dateAsc': return new Date(a.date) - new Date(b.date);
                case 'amountDesc': return b.amount - a.amount;
                case 'amountAsc': return a.amount - b.amount;
                case 'nameAsc': return a.name.localeCompare(b.name);
                case 'nameDesc': return b.name.localeCompare(a.name);
            }
        });

        debtList.innerHTML = filteredDebts.map((debt, index) => `
            <div class="debt-card ${debt.paid ? 'paid' : ''}" data-index="${index}">
                <h3>${debt.name}</h3>
                <p class="amount">${debt.amount.toFixed(3)} TND</p>
                <p class="description">${debt.description || 'No description'}</p>
                <p class="date">${new Date(debt.date).toLocaleDateString()}</p>
                <div class="actions">
                    <button onclick="togglePaidStatus(${index})">${debt.paid ? 'Mark Unpaid' : 'Mark Paid'}</button>
                    <button onclick="removeDebt(${index})">Remove</button>
                </div>
            </div>
        `).join('');

        updateSummary();
    }

    function updateSummary() {
        const totalDebts = debts.length;
        const totalAmount = debts.reduce((sum, debt) => sum + (debt.paid ? 0 : debt.amount), 0);
        document.getElementById('totalDebts').textContent = totalDebts;
        document.getElementById('totalAmount').textContent = totalAmount.toFixed(3) + ' TND';
    }

    function saveDebts() {
        localStorage.setItem('debts', JSON.stringify(debts));
    }

    window.togglePaidStatus = (index) => {
        debts[index].paid = !debts[index].paid;
        saveDebts();
        renderDebtList();
    };

    window.removeDebt = (index) => {
        if (confirm('Are you sure you want to remove this debt?')) {
            debts.splice(index, 1);
            saveDebts();
            renderDebtList();
        }
    };

    function exportToCSV() {
        const headers = ['Name', 'Amount', 'Description', 'Date', 'Paid'];
        const csvContent = [
            headers.join(','),
            ...debts.map(debt => [
                debt.name,
                debt.amount.toFixed(3),
                debt.description,
                new Date(debt.date).toLocaleDateString(),
                debt.paid ? 'Yes' : 'No'
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'credit_tracking_export.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    renderDebtList();
});