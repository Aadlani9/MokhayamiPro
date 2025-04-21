document.addEventListener('DOMContentLoaded', function () {
    let children = JSON.parse(localStorage.getItem('children')) || [];
    let bankRecords = JSON.parse(localStorage.getItem('bankRecords')) || [];

    function calculateAge(dob) {
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const childId = parseInt(urlParams.get('childId'));
    const child = children.find(c => c.id === childId);

    if (child) {
        document.getElementById('childInfo').style.display = 'block';
        document.getElementById('childName').textContent = child.name;
        document.getElementById('childCity').textContent = child.city;
        document.getElementById('childAge').textContent = calculateAge(child.dob);
        document.getElementById('bankSection').style.display = 'block';

        let bankRecord = bankRecords.find(r => r.childId === childId) || { childId, totalAmount: child.totalAmount || 0, payments: [] };
        bankRecord.totalAmount = child.totalAmount || 0; // تحديث المبلغ الإجمالي من بيانات الطفل
        saveBankRecord(bankRecord);
        updateBankDisplay(bankRecord);

        document.getElementById('addPaymentBtn').addEventListener('click', function () {
            document.getElementById('paymentFormSection').style.display = 'block';
            document.getElementById('paymentDate').value = new Date().toISOString().split('T')[0];
        });

        document.getElementById('cancelPayment').addEventListener('click', function () {
            document.getElementById('paymentFormSection').style.display = 'none';
            document.getElementById('paymentForm').reset();
        });

        document.getElementById('paymentForm').addEventListener('submit', function (e) {
            e.preventDefault();
            const paymentAmount = parseFloat(document.getElementById('paymentAmount').value);
            const paymentNotes = document.getElementById('paymentNotes').value.trim();
            const paymentDate = document.getElementById('paymentDate').value;

            const totalPayments = bankRecord.payments.reduce((sum, p) => sum + p.amount, 0);
            if (paymentAmount > (bankRecord.totalAmount - totalPayments)) {
                alert('المبلغ المطلوب أكبر من المبلغ المتبقي!');
                return;
            }

            bankRecord.payments.push({ amount: paymentAmount, notes: paymentNotes || '-', date: paymentDate });
            saveBankRecord(bankRecord);
            updateBankDisplay(bankRecord);
            document.getElementById('paymentForm').reset();
            document.getElementById('paymentFormSection').style.display = 'none';
        });

        document.getElementById('paymentsTable').addEventListener('click', function (e) {
            if (e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn')) {
                if (confirm('هل أنت متأكد من حذف هذه الدفعة؟')) {
                    const index = parseInt(e.target.dataset.index || e.target.closest('.delete-btn').dataset.index);
                    bankRecord.payments.splice(index, 1);
                    saveBankRecord(bankRecord);
                    updateBankDisplay(bankRecord);
                }
            }
        });

        document.getElementById('exportExcel').addEventListener('click', function () {
            const paymentsData = bankRecord.payments.map(p => ({
                'التاريخ': new Date(p.date).toLocaleDateString('ar-MA'),
                'المبلغ (درهم)': p.amount.toFixed(2),
                'ملاحظات': p.notes
            }));

            const childData = [{
                'الاسم الكامل': child.name,
                'المدينة': child.city,
                'العمر': calculateAge(child.dob),
                'المبلغ الإجمالي': bankRecord.totalAmount.toFixed(2)
            }];

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(childData), 'معلومات الطفل');
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(paymentsData), 'سجل الدفعات');
            XLSX.writeFile(wb, `بنك_الطفل_${child.name}.xlsx`);
        });
    } else {
        document.getElementById('childInfo').innerHTML = '<p class="text-danger">لم يتم العثور على الطفل!</p>';
    }

    function saveBankRecord(record) {
        const existingIndex = bankRecords.findIndex(r => r.childId === record.childId);
        if (existingIndex >= 0) {
            bankRecords[existingIndex] = record;
        } else {
            bankRecords.push(record);
        }
        localStorage.setItem('bankRecords', JSON.stringify(bankRecords));
    }

    function updateBankDisplay(record) {
        const totalPayments = record.payments.reduce((sum, p) => sum + p.amount, 0);
        document.getElementById('displayTotal').textContent = `${record.totalAmount.toFixed(2)} درهم`;
        document.getElementById('displayPayments').textContent = `${totalPayments.toFixed(2)} درهم`;
        document.getElementById('displayRemaining').textContent = `${(record.totalAmount - totalPayments).toFixed(2)} درهم`;
        document.getElementById('totalPaymentsFooter').textContent = `${totalPayments.toFixed(2)} درهم`;

        if (record.totalAmount - totalPayments <= 0) {
            document.getElementById('noFundsAlert').style.display = 'block';
        } else {
            document.getElementById('noFundsAlert').style.display = 'none';
        }

        const tbody = document.getElementById('paymentsTable');
        tbody.innerHTML = '';
        record.payments.sort((a, b) => new Date(b.date) - new Date(a.date));
        record.payments.forEach((payment, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(payment.date).toLocaleDateString('ar-MA')}</td>
                <td>${payment.amount.toFixed(2)}</td>
                <td>${payment.notes}</td>
                <td><button class="btn btn-sm btn-danger delete-btn" data-index="${index}"><i class="fas fa-trash"></i></button></td>
            `;
            tbody.appendChild(row);
        });
    }
});