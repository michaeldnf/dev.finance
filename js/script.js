function initModal() {
  const btModal = document.querySelectorAll('[data-modal="button"]');
  const modalArea = document.querySelector('[data-modal="modal"]');

  //Verifica se existe o button e o modal
  if (btModal.length && modalArea) {
    function toogleModal(e) {
      e.preventDefault();
      modalArea.classList.toggle('active');
    }

    btModal.forEach((btn) => btn.addEventListener('click', toogleModal));
  }
}

function initTransaction() {
  const Storage = {
    get() {
      const local = localStorage.getItem('dev.finance:transactions');
      return JSON.parse(local) || [];
    },
    set(transactions) {
      localStorage.setItem(
        'dev.finance:transactions',
        JSON.stringify(transactions),
      );
    },
  };

  const Transaction = {
    all: Storage.get(),
    add(transaction) {
      Transaction.all.push(transaction);
      App.reload();
    },
    remove(index) {
      Transaction.all.splice(index, 1);
      App.reload();
    },
    incomes() {
      let income = 0;
      this.all.forEach((item) => {
        if (item.amount > 0) {
          income += item.amount;
        }
      });

      return income;
    },
    expenses() {
      let expense = 0;
      this.all.forEach((item) => {
        if (item.amount < 0) {
          expense += item.amount;
        }
      });

      return expense;
    },
    total() {
      return Transaction.incomes() + Transaction.expenses();
    },
  };

  const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),
    addTransaction(transaction, index) {
      const tr = document.createElement('tr');
      tr.innerHTML = this.innerHTMLTransaction(transaction, index);
      // tr.dataset.index = index;
      this.transactionsContainer.appendChild(tr);
    },

    innerHTMLTransaction(transaction, index) {
      const classAmount = transaction.amount > 0 ? 'income' : 'expense';

      const amount = Utils.formatCurrency(transaction.amount);

      const html = `
        <td class="description">
          ${transaction.description}
        </td>
        <td class="${classAmount}">
          ${amount}
        </td>
        <td class="date">
          ${transaction.date}
        </td>
        <td>
          <img data-index="${index}" src="./assets/minus.svg" alt="Remover Transação" />
        </td>
      `;
      return html;
    },

    updateBalance() {
      const expense = document.querySelector('.expenseDisplay');
      const income = document.querySelector('.incomeDisplay');
      const total = document.querySelector('.totalDisplay');

      expense.innerText = Utils.formatCurrency(Transaction.expenses());
      income.innerText = Utils.formatCurrency(Transaction.incomes());
      total.innerText = Utils.formatCurrency(Transaction.total());
    },

    clearTransaction() {
      this.transactionsContainer.innerHTML = '';
    },
  };

  const Utils = {
    formatCurrency(value) {
      const signal = Number(value) < 0 ? '-' : '';
      value = String(value).replace(/\D/g, '');
      value = Number(value) / 100;
      value = value.toLocaleString('pt-br', {
        style: 'currency',
        currency: 'BRL',
      });

      return signal + value;
    },
    formatAmount(value) {
      value = value * 100;
      return Math.round(value);
    },
    formatDate(date) {
      const splitDate = date.split('-');
      return `${splitDate[2]}/${splitDate[1]}/${splitDate[0]}`;
    },
  };

  const Form = {
    description: document.querySelector('#description'),
    amount: document.querySelector('#amount'),
    date: document.querySelector('#date'),
    getValues() {
      const values = [
        this.description.value,
        this.amount.value,
        this.date.value,
      ];
      return values;
    },
    validateFields() {
      const values = this.getValues();
      values.forEach((value) => {
        if (value.trim() === '') {
          throw new Error('Por favor preencha todos os campos');
        }
      });
    },
    formatValues() {
      let [description, amount, date] = this.getValues();
      amount = Utils.formatAmount(amount);
      date = Utils.formatDate(date);

      return { description, amount, date };
    },
    saveTransaction(transaction) {
      Transaction.add(transaction);
    },
    clearFields() {
      Form.description.value = '';
      Form.amount.value = '';
      Form.date.value = '';
    },
    save(e) {
      e.preventDefault();
      try {
        Form.validateFields();
        const transaction = Form.formatValues();
        Form.saveTransaction(transaction);
        Form.clearFields();
        document
          .querySelector('[data-modal="modal"]')
          .classList.toggle('active');
        App.reload();
      } catch (error) {
        console.log(error.message);
      }
    },
  };

  const btnForm = document.querySelector('#save');
  btnForm.addEventListener('click', Form.save);

  const App = {
    init() {
      Transaction.all.forEach((item, index) => {
        DOM.addTransaction(item, index);
      });

      DOM.updateBalance();

      const btRemove = document.querySelectorAll('#data-table tbody td img');

      btRemove.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          Transaction.remove(e.target.dataset.index);
        });
      });

      Storage.set(Transaction.all);
    },
    reload() {
      DOM.clearTransaction();
      App.init();
    },
  };

  App.reload();
}

initModal();
initTransaction();
