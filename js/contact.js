document.addEventListener('DOMContentLoaded', function () {
    let children = JSON.parse(localStorage.getItem('children')) || [];
    let bankRecords = JSON.parse(localStorage.getItem('bankRecords')) || [];
    let luggageRecords = JSON.parse(localStorage.getItem('luggage')) || [];
    let campInfo = JSON.parse(localStorage.getItem('campInfo')) || {};

    // تصدير بيانات المرحلة
    document.getElementById('exportCampData').addEventListener('click', function () {
        if (confirm('هل تريد تنزيل بيانات المرحلة الحالية؟ يمكنك حفظها الآن لأنها ستُمسح عند بدء مرحلة جديدة (البيانات لا تُخزن حاليًا، ونعمل على التخزين لاحقًا)')) {
            const campData = [{
                'اسم المخيم': campInfo.campName || 'غير محدد',
                'اسم المؤطر': campInfo.supervisor || 'غير محدد'
            }];

            const childrenData = children.map(child => {
                const remaining = bankRecords.find(r => r.childId === child.id)?.payments.reduce((sum, p) => sum + p.amount, 0) || 0;
                return {
                    'الاسم': child.name,
                    'المدينة': child.city,
                    'العمر': calculateAge(child.dob),
                    'المبلغ الإجمالي': child.totalAmount ? child.totalAmount.toFixed(2) : '-',
                    'المبلغ المدفوع': remaining.toFixed(2),
                    'المبلغ المتبقي': child.totalAmount ? (child.totalAmount - remaining).toFixed(2) : '-'
                };
            });

            const luggageData = luggageRecords.map(luggage => {
                const child = children.find(c => c.id === luggage.childId);
                return {
                    'اسم الطفل': child ? child.name : 'غير معروف',
                    'نوع الغرض': luggage.type,
                    'اللون': luggage.color,
                    'العدد': luggage.quantity,
                    'ملاحظات': luggage.notes,
                    'تاريخ الإضافة': new Date(luggage.addedDate).toLocaleDateString('ar-MA')
                };
            });

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(campData), 'معلومات المخيم');
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(childrenData), 'الأطفال');
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(luggageData), 'الأمتعة');
            XLSX.writeFile(wb, 'بيانات_المرحلة_التخييمية.xlsx');
        }
    });

    // مسح البيانات وبدء مرحلة جديدة
    document.getElementById('resetData').addEventListener('click', function () {
        if (confirm('هل أنت متأكد من مسح جميع البيانات وبدء مرحلة جديدة؟ تأكد من تنزيل البيانات أولاً إذا أردت حفظها!')) {
            localStorage.clear();
            alert('تم مسح جميع البيانات بنجاح. يمكنك الآن بدء مرحلة جديدة.');
            window.location.reload();
        }
    });

    // دالة لحساب العمر
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
});