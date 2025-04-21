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

    function getRemainingAmount(childId) {
        const bankRecord = bankRecords.find(r => r.childId === childId) || { totalAmount: children.find(c => c.id === childId)?.totalAmount || 0, payments: [] };
        const totalPayments = bankRecord.payments.reduce((sum, p) => sum + p.amount, 0);
        return bankRecord.totalAmount - totalPayments;
    }

    function renderChildren() {
        const tbody = document.getElementById('childrenTable');
        tbody.innerHTML = '';
        children.forEach(child => {
            const remaining = getRemainingAmount(child.id);
            const row = document.createElement('tr');
            row.style.cursor = 'pointer';
            row.dataset.childId = child.id;
            row.innerHTML = `
                <td>${child.id}</td>
                <td>${child.name}</td>
                <td>${child.gender}</td>
                <td>${calculateAge(child.dob)}</td>
                <td>${child.city}</td>
                <td>${child.level}</td>
                <td><strong>${child.totalAmount ? child.totalAmount.toFixed(2) + ' درهم' : '-'}</strong></td>
                <td class="remaining-amount">${remaining > 0 ? remaining.toFixed(2) + ' درهم' : '<span class="badge bg-danger">انتهى</span>'}</td>
                <td class="action-buttons">
                    <a href="bank.html?childId=${child.id}" class="btn btn-bank btn-lg d-block mb-2"><i class="fas fa-money-bill-wave"></i></a>
                    <a href="luggage.html?childId=${child.id}" class="btn btn-luggage btn-lg d-block mb-2"><i class="fas fa-suitcase"></i></a>
                    <button class="btn btn-warning btn-lg d-block mb-2 edit-btn" data-id="${child.id}"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger btn-lg d-block delete-btn" data-id="${child.id}"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    function loadChildData(childId) {
        const child = children.find(c => c.id === parseInt(childId));
        if (child) {
            document.getElementById('childId').value = child.id;
            document.getElementById('childName').value = child.name;
            document.getElementById('gender').value = child.gender;
            document.getElementById('phone').value = child.phone || '';
            document.getElementById('dob').value = child.dob;
            document.getElementById('city').value = child.city;
            document.getElementById('level').value = child.level;
            document.getElementById('totalAmount').value = child.totalAmount || '';
            document.getElementById('notes').value = child.notes || '';
            document.getElementById('modalTitle').textContent = 'تعديل بيانات الطفل';
            const modal = new bootstrap.Modal(document.getElementById('childModal'));
            modal.show();
        }
    }

    document.getElementById('childForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const childId = document.getElementById('childId').value;
        const totalAmountValue = document.getElementById('totalAmount').value;
        const newChild = {
            id: childId ? parseInt(childId) : (children.length ? Math.max(...children.map(c => c.id)) + 1 : 1),
            name: document.getElementById('childName').value.trim(),
            gender: document.getElementById('gender').value,
            phone: document.getElementById('phone').value.trim() || null,
            dob: document.getElementById('dob').value,
            city: document.getElementById('city').value,
            level: document.getElementById('level').value,
            totalAmount: totalAmountValue ? parseFloat(totalAmountValue) : null,
            notes: document.getElementById('notes').value.trim() || null,
            addedDate: childId ? children.find(c => c.id === parseInt(childId)).addedDate : new Date().toISOString()
        };

        if (!newChild.name || !newChild.dob || !newChild.city || !newChild.level) {
            alert('يرجى ملء جميع الحقول المطلوبة');
            return;
        }

        if (childId) {
            children = children.map(child => child.id === newChild.id ? newChild : child);
            const bankRecordIndex = bankRecords.findIndex(r => r.childId === newChild.id);
            if (bankRecordIndex >= 0) {
                bankRecords[bankRecordIndex].totalAmount = newChild.totalAmount || 0;
                localStorage.setItem('bankRecords', JSON.stringify(bankRecords));
            }
        } else {
            children.push(newChild);
        }

        localStorage.setItem('children', JSON.stringify(children));
        bootstrap.Modal.getInstance(document.getElementById('childModal')).hide();
        document.getElementById('childForm').reset();
        document.getElementById('childId').value = '';
        document.getElementById('modalTitle').textContent = 'إضافة طفل جديد';
        renderChildren();
    });

    document.getElementById('childrenTable').addEventListener('click', function (e) {
        const row = e.target.closest('tr');
        if (!row) return;

        const childId = parseInt(row.dataset.childId);
        const child = children.find(c => c.id === childId);

        if (e.target.tagName !== 'BUTTON' && !e.target.closest('button') && !e.target.closest('a')) {
            if (e.detail === 1) { // ضغطة واحدة
                const remaining = getRemainingAmount(childId);
                alert(`
                    بيانات الطفل:
                    - الاسم: ${child.name}
                    - الجنس: ${child.gender}
                    - العمر: ${calculateAge(child.dob)}
                    - المدينة: ${child.city}
                    - المستوى: ${child.level}
                    - رقم الهاتف: ${child.phone || '-'}
                    - المبلغ الإجمالي: ${child.totalAmount ? child.totalAmount.toFixed(2) + ' درهم' : '-'}
                    - المبلغ المتبقي: ${remaining > 0 ? remaining.toFixed(2) + ' درهم' : 'انتهى'}
                    - ملاحظات: ${child.notes || '-'}
                `);
            } else if (e.detail === 2) { // ضغطتان
                window.location.href = `bank.html?childId=${childId}`;
            }
        }

        if (e.target.classList.contains('edit-btn') || e.target.closest('.edit-btn')) {
            const id = e.target.dataset.id || e.target.closest('.edit-btn').dataset.id;
            loadChildData(id);
        } else if (e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn')) {
            if (confirm('هل أنت متأكد من حذف هذا الطفل؟')) {
                const id = parseInt(e.target.dataset.id || e.target.closest('.delete-btn').dataset.id);
                children = children.filter(child => child.id !== id);
                bankRecords = bankRecords.filter(r => r.childId !== id);
                localStorage.setItem('children', JSON.stringify(children));
                localStorage.setItem('bankRecords', JSON.stringify(bankRecords));
                renderChildren();
            }
        }
    });

    document.getElementById('exportExcel').addEventListener('click', function () {
        if (confirm('هل تريد تحميل بيانات الأطفال؟')) {
            const childrenData = children.map(child => {
                const remaining = getRemainingAmount(child.id);
                return {
                    'رقم': child.id,
                    'الاسم': child.name,
                    'الجنس': child.gender,
                    'العمر': calculateAge(child.dob),
                    'المدينة': child.city,
                    'المستوى الدراسي': child.level,
                    'المبلغ الإجمالي': child.totalAmount ? child.totalAmount.toFixed(2) : '-',
                    'المبلغ المتبقي': remaining > 0 ? remaining.toFixed(2) : 'انتهى',
                    'رقم الهاتف': child.phone || '-',
                    'تاريخ الإضافة': new Date(child.addedDate).toLocaleDateString('ar-MA')
                };
            });

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(childrenData), 'الأطفال');
            XLSX.writeFile(wb, 'بيانات_الأطفال.xlsx');
        }
    });

    renderChildren();
});