document.addEventListener('DOMContentLoaded', function () {
    let children = JSON.parse(localStorage.getItem('children')) || [];
    let luggageRecords = JSON.parse(localStorage.getItem('luggage')) || [];

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
        document.getElementById('luggageSection').style.display = 'block';

        document.getElementById('backToChildren').href = `children.html`;
        document.getElementById('backToChildrenBottom').href = `children.html`;

        let childLuggage = luggageRecords.filter(l => l.childId === childId);
        updateLuggageTable(childLuggage);

        document.getElementById('addLuggageBtn').addEventListener('click', function () {
            document.getElementById('luggageFormSection').style.display = 'block';
        });

        document.getElementById('cancelLuggage').addEventListener('click', function () {
            document.getElementById('luggageFormSection').style.display = 'none';
            document.getElementById('luggageForm').reset();
        });

        document.getElementById('luggageForm').addEventListener('submit', function (e) {
            e.preventDefault();
            const luggageType = document.getElementById('luggageType').value.trim();
            const luggageColor = document.getElementById('luggageColor').value || '-'; // اختياري، '-' إذا لم يُحدد
            const luggageQuantity = 1; // تلقائيًا 1
            const luggageNotes = document.getElementById('luggageNotes').value.trim();

            if (!luggageType) {
                alert('يرجى إدخال نوع الغرض!');
                return;
            }

            const newLuggage = {
                childId,
                type: luggageType,
                color: luggageColor,
                quantity: luggageQuantity,
                notes: luggageNotes || '-',
                addedDate: new Date().toISOString()
            };

            luggageRecords.push(newLuggage);
            localStorage.setItem('luggage', JSON.stringify(luggageRecords));
            childLuggage = luggageRecords.filter(l => l.childId === childId);
            updateLuggageTable(childLuggage);
            document.getElementById('luggageForm').reset();
            document.getElementById('luggageFormSection').style.display = 'none';
        });

        document.getElementById('luggageTable').addEventListener('click', function (e) {
            if (e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn')) {
                if (confirm('هل أنت متأكد من حذف هذا الغرض؟')) {
                    const index = parseInt(e.target.dataset.index || e.target.closest('.delete-btn').dataset.index);
                    const luggageIndex = luggageRecords.findIndex(l => l.childId === childId && l.addedDate === childLuggage[index].addedDate);
                    luggageRecords.splice(luggageIndex, 1);
                    localStorage.setItem('luggage', JSON.stringify(luggageRecords));
                    childLuggage = luggageRecords.filter(l => l.childId === childId);
                    updateLuggageTable(childLuggage);
                }
            }
        });

        document.getElementById('exportExcel').addEventListener('click', function () {
            if (confirm('هل تريد تنزيل نسخة من بيانات أمتعة هذا الطفل؟')) {
                const luggageData = childLuggage.map(l => ({
                    'التاريخ': new Date(l.addedDate).toLocaleDateString('ar-MA'),
                    'نوع الغرض': l.type,
                    'اللون': l.color,
                    'العدد': l.quantity,
                    'ملاحظات': l.notes
                }));

                const childData = [{
                    'الاسم الكامل': child.name,
                    'المدينة': child.city,
                    'العمر': calculateAge(child.dob)
                }];

                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(childData), 'معلومات الطفل');
                XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(luggageData), 'سجل الأمتعة');
                XLSX.writeFile(wb, `أمتعة_الطفل_${child.name}.xlsx`);
            }
        });
    } else {
        document.getElementById('childInfo').innerHTML = '<p class="text-danger">لم يتم العثور على الطفل!</p>';
    }

    function updateLuggageTable(records) {
        const tbody = document.getElementById('luggageTable');
        tbody.innerHTML = '';
        records.sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate));
        records.forEach((luggage, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(luggage.addedDate).toLocaleDateString('ar-MA')}</td>
                <td>${luggage.type}</td>
                <td><span class="color-dot" style="background-color: ${getColorCode(luggage.color)};"></span> ${luggage.color}</td>
                <td>${luggage.quantity}</td>
                <td>${luggage.notes}</td>
                <td><button class="btn btn-sm btn-danger delete-btn" data-index="${index}"><i class="fas fa-trash"></i></button></td>
            `;
            tbody.appendChild(row);
        });
    }

    function getColorCode(color) {
        const colors = {
            'أحمر': '#ff0000',
            'أزرق': '#0000ff',
            'أخضر': '#00ff00',
            'أصفر': '#ffff00',
            'أسود': '#000000',
            'أبيض': '#ffffff',
            'رمادي': '#808080',
            'بني': '#8b4513',
            'وردي': '#ff69b4',
            'برتقالي': '#ffa500',
            'بنفسجي': '#800080',
            'تركواز': '#40e0d0',
            'زيتي': '#808000',
            'فضي': '#c0c0c0',
            'ذهبي': '#ffd700'
        };
        return colors[color] || '#000000';
    }
});