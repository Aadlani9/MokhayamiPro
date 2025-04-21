document.addEventListener('DOMContentLoaded', function() {
    const campInfo = JSON.parse(localStorage.getItem('campInfo')) || { campName: 'المخيم الصيفي', supervisor: 'المؤطر' };
    let reports = JSON.parse(localStorage.getItem('reports')) || [];
    let commitments = JSON.parse(localStorage.getItem('commitments')) || [];
    let children = JSON.parse(localStorage.getItem('children')) || [];
    let editIndex = -1;
    let editCommitmentIndex = -1;

    // تهيئة الصفحة
    function initPage() {
        document.getElementById('reportTypeSelection').style.display = 'flex';
        document.getElementById('activityDate').value = new Date().toISOString().split('T')[0];
        
        // عرض الجداول عند تحميل الصفحة
        renderTable();
        renderCommitmentsTable();
    }

    // إخفاء جميع الأقسام
    function hideAllSections() {
        document.getElementById('reportTypeSelection').style.display = 'none';
        document.getElementById('reportFormSection').style.display = 'none';
        document.getElementById('reportPreview').style.display = 'none';
        document.getElementById('commitmentFormSection').style.display = 'none';
        document.getElementById('commitmentPreview').style.display = 'none';
    }

    // تنسيق التاريخ
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    // عرض جدول البطاقات
    function renderTable(filterText = '', filterType = 'الكل') {
        const tableBody = document.getElementById('reportsTable');
        tableBody.innerHTML = '';
        let filteredReports = reports;

        if (filterText) {
            filteredReports = filteredReports.filter(report =>
                report.date.includes(filterText) ||
                report.place.toLowerCase().includes(filterText.toLowerCase()) ||
                report.type.toLowerCase().includes(filterText.toLowerCase())
            );
        }

        if (filterType !== 'الكل') {
            filteredReports = filteredReports.filter(report => report.reportType === filterType);
        }

        filteredReports.forEach((report, index) => {
            const row = document.createElement('tr');
            const totalParticipants = (report.males || 0) + (report.females || 0);
            row.innerHTML = `
                <td>${report.date}</td>
                <td>${report.place}</td>
                <td>${report.type}</td>
                <td>${totalParticipants} (${report.males || 0} ذكور, ${report.females || 0} إناث)</td>
                <td>${report.duration || '-'}</td>
                <td>
                    <button class="btn btn-info btn-sm edit-btn" data-index="${index}">تعديل</button>
                    <button class="btn btn-primary btn-sm view-btn" data-index="${index}">عرض</button>
                    <button class="btn btn-success btn-sm pdf-btn" data-index="${index}">PDF</button>
                    <button class="btn btn-danger btn-sm delete-btn" data-index="${index}">حذف</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', editReport));
        document.querySelectorAll('.view-btn').forEach(btn => btn.addEventListener('click', viewReport));
        document.querySelectorAll('.pdf-btn').forEach(btn => btn.addEventListener('click', downloadPdf));
        document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', deleteReport));
    }

    // عرض جدول التعهدات
    function renderCommitmentsTable() {
        const tableBody = document.getElementById('commitmentsTable');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        commitments.forEach((commitment, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${commitment.date}</td>
                <td>${commitment.supervisor}</td>
                <td>${commitment.group || '-'}</td>
                <td>${commitment.children.length}</td>
                <td>
                    <button class="btn btn-info btn-sm edit-commit-btn" data-index="${index}">تعديل</button>
                    <button class="btn btn-primary btn-sm view-commit-btn" data-index="${index}">عرض</button>
                    <button class="btn btn-success btn-sm pdf-commit-btn" data-index="${index}">PDF</button>
                    <button class="btn btn-danger btn-sm delete-commit-btn" data-index="${index}">حذف</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        document.querySelectorAll('.edit-commit-btn').forEach(btn => btn.addEventListener('click', editCommitment));
        document.querySelectorAll('.view-commit-btn').forEach(btn => btn.addEventListener('click', viewCommitment));
        document.querySelectorAll('.pdf-commit-btn').forEach(btn => btn.addEventListener('click', downloadCommitmentPdf));
        document.querySelectorAll('.delete-commit-btn').forEach(btn => btn.addEventListener('click', deleteCommitment));
    }

    // التحقق من صحة النموذج
    function validateForm() {
        const requiredFields = ['activityDate', 'activityPlace', 'activityType', 'malesCount', 'femalesCount', 'supervisorName'];
        let isValid = true;
        requiredFields.forEach(id => {
            const input = document.getElementById(id);
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('is-invalid');
            } else {
                input.classList.remove('is-invalid');
            }
        });
        return isValid;
    }

    // التحقق من صحة نموذج التعهد
    function validateCommitmentForm() {
        const supervisorName = document.getElementById('commitmentSupervisor');
        if (!supervisorName.value.trim()) {
            supervisorName.classList.add('is-invalid');
            return false;
        }
        supervisorName.classList.remove('is-invalid');
        return true;
    }

    // تحديد الحقول الخاصة بنوع النشاط
    function setSpecificFields(reportType) {
        const specificFields = document.getElementById('specificFields');
        specificFields.innerHTML = '';
        if (reportType === 'سهرة') {
            specificFields.innerHTML = `
                <div class="col-md-12">
                    <label for="songs" class="form-label">تفاصيل الأناشيد</label>
                    <textarea class="form-control" id="songs" rows="2" placeholder="قائمة الأناشيد"></textarea>
                </div>
            `;
        } else if (reportType === 'معمل تربوي') {
            specificFields.innerHTML = `
                <div class="col-md-12">
                    <label for="tools" class="form-label">الأدوات المستخدمة</label>
                    <textarea class="form-control" id="tools" rows="2" placeholder="قائمة الأدوات"></textarea>
                </div>
            `;
        }
    }

    // إضافة أو تعديل بطاقة
    function addOrUpdateReport() {
        if (!validateForm()) {
            alert('يرجى ملء جميع الحقول المطلوبة');
            return;
        }

        const reportType = document.getElementById('reportType').value;
        const report = {
            date: formatDate(document.getElementById('activityDate').value),
            place: document.getElementById('activityPlace').value,
            type: document.getElementById('activityType').value,
            males: parseInt(document.getElementById('malesCount').value) || 0,
            females: parseInt(document.getElementById('femalesCount').value) || 0,
            duration: document.getElementById('duration').value || '-',
            goals: document.getElementById('goals').value || '-',
            values: document.getElementById('values').value || '-',
            skills: document.getElementById('skills').value || '-',
            reportType: reportType,
            supervisorName: document.getElementById('supervisorName').value,
            year: document.getElementById('activityDate').value.split('-')[0],
            creationDate: new Date().toISOString()
        };

        if (reportType === 'سهرة') {
            report.songs = document.getElementById('songs').value || '-';
        } else if (reportType === 'معمل تربوي') {
            report.tools = document.getElementById('tools').value || '-';
        }

        if (editIndex === -1) {
            reports.push(report);
            alert('تمت إضافة البطاقة التقنية بنجاح!');
        } else {
            reports[editIndex] = report;
            alert('تم تعديل البطاقة التقنية بنجاح!');
            editIndex = -1;
        }

        localStorage.setItem('reports', JSON.stringify(reports));
        renderTable();
        document.getElementById('reportForm').reset();
        document.getElementById('specificFields').innerHTML = '';
        hideAllSections();
        document.getElementById('reportTypeSelection').style.display = 'flex';
    }

    // إضافة أو تعديل تعهد
    function addOrUpdateCommitment() {
        if (!validateCommitmentForm()) {
            alert('يرجى إدخال اسم المؤطر');
            return;
        }

        const selectedChildren = [];
        document.querySelectorAll('#childrenList input:checked').forEach(input => {
            const childId = input.value;
            const child = children.find(c => c.id.toString() === childId);
            if (child) {
                selectedChildren.push({
                    id: child.id,
                    name: child.name,
                    birthday: child.birthday,
                    grade: child.grade || '-',
                    age: child.age || calculateAge(child.birthday),
                    city: child.city || '-',
                    notes: child.notes || '-'
                });
            }
        });

        const commitment = {
            id: Date.now().toString(),
            date: formatDate(document.getElementById('commitmentDate').value),
            supervisor: document.getElementById('commitmentSupervisor').value,
            group: document.getElementById('commitmentGroup').value || '',
            community: document.getElementById('commitmentCommunity').value || '',
            children: selectedChildren,
            creationDate: new Date().toISOString()
        };

        if (editCommitmentIndex === -1) {
            commitments.push(commitment);
            alert('تم إضافة التعهد بنجاح!');
        } else {
            commitments[editCommitmentIndex] = commitment;
            alert('تم تعديل التعهد بنجاح!');
            editCommitmentIndex = -1;
        }

        localStorage.setItem('commitments', JSON.stringify(commitments));
        renderCommitmentsTable();
        document.getElementById('commitmentForm').reset();
        hideAllSections();
        document.getElementById('reportTypeSelection').style.display = 'flex';
    }

    // حساب العمر من تاريخ الميلاد
    function calculateAge(birthdayString) {
        if (!birthdayString) return '-';
        const birthday = new Date(birthdayString);
        const ageDifMs = Date.now() - birthday.getTime();
        const ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    // تعديل بطاقة
    function editReport(e) {
        editIndex = parseInt(e.target.getAttribute('data-index'));
        const report = reports[editIndex];
        document.getElementById('reportType').value = report.reportType;
        document.getElementById('activityDate').value = report.date.split('/').reverse().join('-');
        document.getElementById('activityPlace').value = report.place;
        document.getElementById('activityType').value = report.type;
        document.getElementById('malesCount').value = report.males;
        document.getElementById('femalesCount').value = report.females;
        document.getElementById('duration').value = report.duration;
        document.getElementById('goals').value = report.goals;
        document.getElementById('values').value = report.values;
        document.getElementById('skills').value = report.skills;
        document.getElementById('supervisorName').value = report.supervisorName || campInfo.supervisor;
        setSpecificFields(report.reportType);
        if (report.songs) document.getElementById('songs').value = report.songs;
        if (report.tools) document.getElementById('tools').value = report.tools;
        hideAllSections();
        document.getElementById('reportFormSection').style.display = 'block';
        document.getElementById('formTitle').textContent = `تعديل بطاقة تقنية ل${report.reportType}`;
    }

    // تعديل تعهد
    function editCommitment(e) {
        editCommitmentIndex = parseInt(e.target.getAttribute('data-index'));
        const commitment = commitments[editCommitmentIndex];
        document.getElementById('commitmentDate').value = commitment.date.split('/').reverse().join('-');
        document.getElementById('commitmentSupervisor').value = commitment.supervisor;
        document.getElementById('commitmentGroup').value = commitment.group || '';
        document.getElementById('commitmentCommunity').value = commitment.community || '';
        
        renderChildrenList(commitment.children.map(c => c.id.toString()));
        
        hideAllSections();
        document.getElementById('commitmentFormSection').style.display = 'block';
        document.getElementById('commitmentFormTitle').textContent = 'تعديل التزام بشرف التأطير';
    }

    // حذف بطاقة
    function deleteReport(e) {
        const index = parseInt(e.target.getAttribute('data-index'));
        if (confirm('هل أنت متأكد من حذف هذه البطاقة التقنية؟')) {
            reports.splice(index, 1);
            localStorage.setItem('reports', JSON.stringify(reports));
            renderTable();
            alert('تم حذف البطاقة التقنية بنجاح!');
        }
    }

    // حذف تعهد
    function deleteCommitment(e) {
        const index = parseInt(e.target.getAttribute('data-index'));
        if (confirm('هل أنت متأكد من حذف هذا التعهد؟')) {
            commitments.splice(index, 1);
            localStorage.setItem('commitments', JSON.stringify(commitments));
            renderCommitmentsTable();
            alert('تم حذف التعهد بنجاح!');
        }
    }

    // عرض التقرير
    function viewReport(e) {
        const index = parseInt(e.target.getAttribute('data-index'));
        const report = reports[index];
        
        // تعيين القيم العامة للمعاينة
        const campNameElement = document.getElementById('displayCampName');
        if (campNameElement) {
            campNameElement.textContent = campInfo.campName || 'غير محدد';
        }
        const summerElement = document.getElementById('displaySummer');
        if (summerElement) {
            summerElement.textContent = report.year || new Date().getFullYear();
        }
        const activityTypeElement = document.getElementById('displayActivityType');
        if (activityTypeElement) {
            activityTypeElement.textContent = report.reportType;
        }
        const reportSupervisorElement = document.getElementById('displayReportSupervisor');
        if (reportSupervisorElement) {
            reportSupervisorElement.textContent = report.supervisorName || campInfo.supervisor;
        }
        
        const dateElement = document.getElementById('displayDate');
        if (dateElement) {
            dateElement.textContent = report.date;
        }
        const placeElement = document.getElementById('displayPlace');
        if (placeElement) {
            placeElement.textContent = report.place;
        }
        const typeElement = document.getElementById('displayType');
        if (typeElement) {
            typeElement.textContent = report.type;
        }
        const participantsElement = document.getElementById('displayParticipants');
        if (participantsElement) {
            participantsElement.textContent = `${(report.males || 0) + (report.females || 0)} (${report.males || 0} ذكور, ${report.females || 0} إناث)`;
        }
        const durationElement = document.getElementById('displayDuration');
        if (durationElement) {
            durationElement.textContent = report.duration;
        }
        const goalsElement = document.getElementById('displayGoals');
        if (goalsElement) {
            goalsElement.textContent = report.goals;
        }
        const valuesElement = document.getElementById('displayValues');
        if (valuesElement) {
            valuesElement.textContent = report.values;
        }
        const skillsElement = document.getElementById('displaySkills');
        if (skillsElement) {
            skillsElement.textContent = report.skills;
        }
        const specificElement = document.getElementById('displaySpecific');
        if (specificElement) {
            specificElement.textContent = report.songs || report.tools || '-';
        }
        
        const creationLocationElement = document.getElementById('displayCreationLocation');
        if (creationLocationElement) {
            creationLocationElement.textContent = campInfo.campName || 'غير محدد';
        }
        const creationDateElement = document.getElementById('displayCreationDate');
        if (creationDateElement) {
            const creationDate = report.creationDate ? new Date(report.creationDate) : new Date();
            creationDateElement.textContent = formatDate(creationDate.toISOString());
        }
        
        hideAllSections();
        document.getElementById('reportPreview').style.display = 'block';
    }

    // عرض التعهد
    function viewCommitment(e) {
        const index = parseInt(e.target.getAttribute('data-index'));
        const commitment = commitments[index];
        
        // تعيين القيم العامة للمعاينة
        const commitmentCampNameElement = document.getElementById('displayCommitmentCampName');
        if (commitmentCampNameElement) {
            commitmentCampNameElement.textContent = campInfo.campName || 'غير محدد';
        }
        const commitmentSummerElement = document.getElementById('displayCommitmentSummer');
        if (commitmentSummerElement) {
            commitmentSummerElement.textContent = commitment.creationDate ? new Date(commitment.creationDate).getFullYear() : new Date().getFullYear();
        }
        const commitmentSupervisorElement = document.getElementById('displayCommitmentSupervisor');
        if (commitmentSupervisorElement) {
            commitmentSupervisorElement.textContent = commitment.supervisor;
        }
        const commitmentDateElement = document.getElementById('displayCommitmentDate');
        if (commitmentDateElement) {
            commitmentDateElement.textContent = commitment.date;
        }
        const commitmentGroupElement = document.getElementById('displayCommitmentGroup');
        if (commitmentGroupElement) {
            commitmentGroupElement.textContent = commitment.group || '-';
        }
        const commitmentCommunityElement = document.getElementById('displayCommitmentCommunity');
        if (commitmentCommunityElement) {
            commitmentCommunityElement.textContent = commitment.community || '-';
        }
        
        const childrenTableContainer = document.getElementById('displayCommitmentChildrenTable');
        if (childrenTableContainer) {
            childrenTableContainer.innerHTML = `
                <table class="table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th>رقم</th>
                            <th>الاسم الكامل للطفل</th>
                            <th>المستوى الدراسي</th>
                            <th>السن</th>
                            <th>المدينة</th>
                            <th>الملاحظة</th>
                        </tr>
                    </thead>
                    <tbody id="childrenTableBody"></tbody>
                </table>
            `;
            
            const tableBody = document.getElementById('childrenTableBody');
            if (tableBody) {
                commitment.children.forEach((child, idx) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${idx + 1}</td>
                        <td>${child.name}</td>
                        <td>${child.grade || '-'}</td>
                        <td>${child.age || calculateAge(child.birthday) || '-'}</td>
                        <td>${child.city || '-'}</td>
                        <td>${child.notes || '-'}</td>
                    `;
                    tableBody.appendChild(row);
                });
            }
        }
        
        const commitmentCreationLocationElement = document.getElementById('displayCommitmentCreationLocation');
        if (commitmentCreationLocationElement) {
            commitmentCreationLocationElement.textContent = campInfo.campName || 'غير محدد';
        }
        const commitmentCreationDateElement = document.getElementById('displayCommitmentCreationDate');
        if (commitmentCreationDateElement) {
            const creationDate = commitment.creationDate ? new Date(commitment.creationDate) : new Date();
            commitmentCreationDateElement.textContent = formatDate(creationDate.toISOString());
        }
        const signatureSupervisorElement = document.getElementById('displaySignatureSupervisor');
        if (signatureSupervisorElement) {
            signatureSupervisorElement.textContent = commitment.supervisor;
        }
        
        hideAllSections();
        document.getElementById('commitmentPreview').style.display = 'block';
    }

    // تحميل تقرير كـ PDF
    function downloadPdf(e) {
        const index = parseInt(e.target.getAttribute('data-index'));
        const report = reports[index];
        const element = document.getElementById('reportDocument');
        
        // إخفاء عناصر واجهة المستخدم
        const noPrintElements = document.querySelectorAll('.no-print');
        noPrintElements.forEach(el => el.style.display = 'none');
        
        // إزالة البوردر والهوامش
        element.style.border = 'none';
        element.style.margin = '0';
        element.style.padding = '0';
        
        const options = {
            margin: [0, 0, 0, 0],
            filename: `بطاقة_تقنية_${report.type.replace(/ /g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2, 
                useCORS: true, 
                scrollX: 0, 
                scrollY: 0,
                windowWidth: element.scrollWidth 
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait',
                putOnlyUsedFonts: true,
                compress: true 
            },
            pagebreak: { mode: ['css', 'legacy'], avoid: ['table', '.children-table'] }
        };
        
        html2pdf().from(element).set(options).save().then(() => {
            // إعادة إظهار عناصر واجهة المستخدم والبوردر
            noPrintElements.forEach(el => el.style.display = '');
            element.style.border = '1px solid #ddd';
            element.style.margin = '';
            element.style.padding = '';
            alert('تم تحميل البطاقة التقنية بصيغة PDF بنجاح!');
        });
    }

    // تحميل تعهد كـ PDF
    function downloadCommitmentPdf(e) {
        const index = parseInt(e.target.getAttribute('data-index'));
        const commitment = commitments[index];
        const element = document.getElementById('commitmentDocument');
        
        // إخفاء عناصر واجهة المستخدم
        const noPrintElements = document.querySelectorAll('.no-print');
        noPrintElements.forEach(el => el.style.display = 'none');
        
        // إزالة البوردر والهوامش
        element.style.border = 'none';
        element.style.margin = '0';
        element.style.padding = '0';
        
        const options = {
            margin: [0, 0, 0, 0],
            filename: `تعهد_${commitment.supervisor.replace(/ /g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2, 
                useCORS: true, 
                scrollX: 0, 
                scrollY: 0,
                windowWidth: element.scrollWidth 
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait',
                putOnlyUsedFonts: true,
                compress: true 
            },
            pagebreak: { mode: ['css', 'legacy'], avoid: ['table', '.children-table'] }
        };
        
        html2pdf().from(element).set(options).save().then(() => {
            // إعادة إظهار عناصر واجهة المستخدم والبوردر
            noPrintElements.forEach(el => el.style.display = '');
            element.style.border = '1px solid #ddd';
            element.style.margin = '';
            element.style.padding = '';
            alert('تم تحميل التعهد بصيغة PDF بنجاح!');
        });
    }

    // عرض قائمة الأطفال
    function renderChildrenList(selectedIds = []) {
        const childrenList = document.getElementById('childrenList');
        childrenList.innerHTML = '';
        
        if (children.length === 0) {
            childrenList.innerHTML = '<p class="text-center">لا يوجد أطفال مسجلين</p>';
            return;
        }
        
        children.forEach(child => {
            const div = document.createElement('div');
            div.className = 'form-check';
            const isChecked = selectedIds.includes(child.id.toString());
            div.innerHTML = `
                <input class="form-check-input" type="checkbox" value="${child.id}" id="child-${child.id}" ${isChecked ? 'checked' : ''}>
                <label class="form-check-label" for="child-${child.id}">
                    ${child.name} (${formatDate(child.birthday)})
                </label>
            `;
            childrenList.appendChild(div);
        });
    }

    // الأحداث
    document.getElementById('addActivityBtn').addEventListener('click', () => {
        editIndex = -1;
        hideAllSections();
        document.getElementById('reportType').value = 'نشاط';
        document.getElementById('supervisorName').value = campInfo.supervisor || '';
        document.getElementById('formTitle').textContent = 'بطاقة تقنية لنشاط';
        setSpecificFields('نشاط');
        document.getElementById('reportFormSection').style.display = 'block';
    });

    document.getElementById('addLabBtn').addEventListener('click', () => {
        editIndex = -1;
        hideAllSections();
        document.getElementById('reportType').value = 'معمل تربوي';
        document.getElementById('supervisorName').value = campInfo.supervisor || '';
        document.getElementById('formTitle').textContent = 'بطاقة تقنية لمعمل تربوي';
        setSpecificFields('معمل تربوي');
        document.getElementById('reportFormSection').style.display = 'block';
    });

    document.getElementById('addEveningBtn').addEventListener('click', () => {
        editIndex = -1;
        hideAllSections();
        document.getElementById('reportType').value = 'سهرة';
        document.getElementById('supervisorName').value = campInfo.supervisor || '';
        document.getElementById('formTitle').textContent = 'بطاقة تقنية لسهرة';
        setSpecificFields('سهرة');
        document.getElementById('reportFormSection').style.display = 'block';
    });

    document.getElementById('addCommitmentBtn').addEventListener('click', () => {
        editCommitmentIndex = -1;
        hideAllSections();
        document.getElementById('commitmentSupervisor').value = campInfo.supervisor || '';
        document.getElementById('commitmentDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('commitmentFormTitle').textContent = 'إنشاء التزام بشرف التأطير';
        renderChildrenList();
        document.getElementById('commitmentFormSection').style.display = 'block';
    });

    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            editIndex = -1;
            editCommitmentIndex = -1;
            hideAllSections();
            document.getElementById('reportTypeSelection').style.display = 'flex';
        });
    });

    document.querySelector('.back-to-form').addEventListener('click', () => {
        hideAllSections();
        document.getElementById('reportFormSection').style.display = 'block';
    });

    document.querySelector('.back-to-commitment-form').addEventListener('click', () => {
        hideAllSections();
        document.getElementById('commitmentFormSection').style.display = 'block';
    });

    document.getElementById('generateReportBtn').addEventListener('click', addOrUpdateReport);
    document.getElementById('generateCommitmentBtn').addEventListener('click', addOrUpdateCommitment);

    document.getElementById('printReportBtn').addEventListener('click', () => {
        window.print();
        alert('تمت عملية الطباعة بنجاح!');
    });

    document.getElementById('printCommitmentBtn').addEventListener('click', () => {
        window.print();
        alert('تمت عملية الطباعة بنجاح!');
    });

    document.getElementById('downloadPdfBtn').addEventListener('click', downloadPdf);
    document.getElementById('downloadCommitmentPdfBtn').addEventListener('click', downloadCommitmentPdf);

    // استدعاء تهيئة الصفحة
    initPage();
});