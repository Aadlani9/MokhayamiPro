document.addEventListener('DOMContentLoaded', function () {
    let children = JSON.parse(localStorage.getItem('children')) || [];
    let bankRecords = JSON.parse(localStorage.getItem('bankRecords')) || [];
    let campInfo = JSON.parse(localStorage.getItem('campInfo')) || {};

    // عرض تاريخ آخر تحديث
    document.getElementById('update-date').textContent = new Date().toLocaleDateString('ar-MA');

    // عرض عدد الأطفال
    document.getElementById('childrenCount').textContent = children.length;

    // عرض إجمالي المبالغ والمدفوع
    const totalAmount = children.reduce((sum, child) => sum + (child.totalAmount || 0), 0);
    const totalPaid = bankRecords.reduce((sum, record) => {
        const payments = record.payments.reduce((pSum, p) => pSum + p.amount, 0);
        return sum + payments;
    }, 0);
    document.getElementById('totalAmount').textContent = totalAmount.toFixed(2) + ' درهم';
    document.getElementById('totalPaid').textContent = totalPaid.toFixed(2) + ' درهم';

    // عرض معلومات المخيم
    document.getElementById('campNameDisplay').textContent = campInfo.campName || '-';
    document.getElementById('supervisorDisplay').textContent = campInfo.supervisor || '-';

    // زر معلومات المخيم
    document.getElementById('campInfoBtn').addEventListener('click', function () {
        document.getElementById('campFormSection').style.display = 'block';
        document.getElementById('campName').value = campInfo.campName || '';
        document.getElementById('supervisor').value = campInfo.supervisor || '';
    });

    // إلغاء النموذج
    document.getElementById('cancelCampForm').addEventListener('click', function () {
        document.getElementById('campFormSection').style.display = 'none';
        document.getElementById('campForm').reset();
    });

    // حفظ معلومات المخيم
    document.getElementById('campForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const campName = document.getElementById('campName').value.trim();
        const supervisor = document.getElementById('supervisor').value.trim();

        campInfo = {
            campName: campName || 'غير محدد',
            supervisor: supervisor || 'غير محدد'
        };

        localStorage.setItem('campInfo', JSON.stringify(campInfo));
        document.getElementById('campNameDisplay').textContent = campInfo.campName;
        document.getElementById('supervisorDisplay').textContent = campInfo.supervisor;
        document.getElementById('campFormSection').style.display = 'none';
        document.getElementById('campForm').reset();
    });

    // تصدير البيانات
    document.getElementById('exportExcel').addEventListener('click', function () {
        if (confirm('هل تريد تحميل بيانات المرحلة؟')) {
            const data = children.map(child => {
                const remaining = bankRecords.find(r => r.childId === child.id)?.payments.reduce((sum, p) => sum + p.amount, 0) || 0;
                return {
                    'الاسم': child.name,
                    'المدينة': child.city,
                    'المبلغ الإجمالي': child.totalAmount ? child.totalAmount.toFixed(2) : '-',
                    'المبلغ المدفوع': remaining.toFixed(2),
                    'المبلغ المتبقي': child.totalAmount ? (child.totalAmount - remaining).toFixed(2) : '-'
                };
            });

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), 'إحصائيات المخيم');
            XLSX.writeFile(wb, 'إحصائيات_المخيم.xlsx');
        }
    });

    // إعادة تعيين البيانات (اختياري، محتفظ به كما هو)
    document.getElementById('resetData').addEventListener('click', function () {
        if (confirm('هل أنت متأكد من إعادة تعيين جميع البيانات؟')) {
            localStorage.clear();
            location.reload();
        }
    });
});