document.addEventListener('DOMContentLoaded', function () {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const children = JSON.parse(localStorage.getItem('children')) || [];
    const bankRecords = JSON.parse(localStorage.getItem('bankRecords')) || [];

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

    const totalAmount = children.reduce((sum, child) => sum + (child.totalAmount || 0), 0);
    const totalPaid = bankRecords.reduce((sum, record) => sum + (record.payments.reduce((s, p) => s + p.amount, 0)), 0);

    document.getElementById('campName').textContent = user.campName || 'غير محدد';
    document.getElementById('username').textContent = user.username || 'غير محدد';
    document.getElementById('childrenCount').textContent = children.length;
    document.getElementById('totalAmount').textContent = `${totalAmount.toFixed(2)} درهم`;
    document.getElementById('totalPaid').textContent = `${totalPaid.toFixed(2)} درهم`;
    document.getElementById('update-date').textContent = new Date().toLocaleDateString('ar-MA');

    document.getElementById('exportExcel').addEventListener('click', function () {
        const childrenData = children.map(child => ({
            'رقم': child.id,
            'الاسم': child.name,
            'الجنس': child.gender,
            'العمر': calculateAge(child.dob),
            'رقم الهاتف': child.phone,
            'المدينة': child.city,
            'المستوى الدراسي': child.level,
            'المبلغ الإجمالي': child.totalAmount ? child.totalAmount.toFixed(2) : '-',
            'ملاحظات': child.notes || '',
            'تاريخ الإضافة': new Date(child.addedDate).toLocaleDateString('ar-MA')
        }));

        const bankData = bankRecords.map(record => {
            const child = children.find(c => c.id === record.childId);
            const totalPayments = record.payments.reduce((sum, p) => sum + p.amount, 0);
            return {
                'اسم الطفل': child ? child.name : 'غير معروف',
                'العمر': child ? calculateAge(child.dob) : '-',
                'المدينة': child ? child.city : '-',
                'المبلغ الإجمالي': record.totalAmount.toFixed(2),
                'مجموع المدفوعات': totalPayments.toFixed(2),
                'تفاصيل المدفوعات': record.payments.map(p => `${p.date}: ${p.amount.toFixed(2)} درهم`).join('; ')
            };
        });

        const luggageData = (JSON.parse(localStorage.getItem('luggage')) || []).map(item => {
            const child = children.find(c => c.id === item.childId);
            return {
                'اسم الطفل': child ? child.name : 'غير معروف',
                'نوع الغرض': item.type,
                'اللون': item.color,
                'العدد': item.quantity,
                'ملاحظات': item.notes || '',
                'تاريخ الإضافة': new Date(item.addedDate).toLocaleDateString('ar-MA')
            };
        });

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(childrenData), 'الأطفال');
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(bankData), 'بنك الطفل');
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(luggageData), 'الأمتعة');
        XLSX.writeFile(wb, `بيانات_المخيم_${user.campName || 'بدون_اسم'}.xlsx`);

        document.getElementById('resetData').style.display = 'inline-block';
    });

    document.getElementById('resetData').addEventListener('click', function () {
        if (confirm('هل أنت متأكد من حذف جميع بيانات المرحلة؟ سيتم إعادة تعيين التطبيق بالكامل!')) {
            localStorage.removeItem('user');
            localStorage.removeItem('children');
            localStorage.removeItem('bankRecords');
            localStorage.removeItem('luggage');
            window.location.href = 'index.html';
        }
    });
});