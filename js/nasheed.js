// nasheed.js - ملف JavaScript للتعامل مع صفحة الأناشيد

document.addEventListener('DOMContentLoaded', function () {
    // قاعدة بيانات الأناشيد
    let nasheeds = [];

    // التحقق من وجود أناشيد في التخزين المحلي
    if (localStorage.getItem('nasheeds')) {
        nasheeds = JSON.parse(localStorage.getItem('nasheeds'));
    } else {
        // قاعدة بيانات الأناشيد الافتراضية
        nasheeds = [
            {
                title: "وطني الحبيب",
                category: "national",
                categoryName: "الأناشيد الوطنية",
                lyrics: "وطني الحبيب ولا أحب سواه\nوفيه أعيش وأحتمي برضاه\nأفديك يا أرض الكرام\nأنت العز وأنت السلام"
            },
            {
                title: "رايتنا عالية",
                category: "national",
                categoryName: "الأناشيد الوطنية",
                lyrics: "رايتنا عالية في السماء\nتخفق بالعز والفداء\nنحمي الوطن بكل ما فينا\nونفديه بدمائنا الغالية"
            },
            {
                title: "صلاتي نوري",
                category: "religious",
                categoryName: "الأناشيد الدينية",
                lyrics: "صلاتي نوري في دربي\nتحفظني في كل خطبي\nأقبل نحو الله دوماً\nفهو الرحيم بقلبي"
            },
            {
                title: "قرآني حياتي",
                category: "religious",
                categoryName: "الأناشيد الدينية",
                lyrics: "قرآني نبض حياتي\nفيه نجاتي وثباتي\nنور في كل الأوقات\nوبلسم كل الآهات"
            },
            {
                title: "نحمي بيئتنا",
                category: "environmental",
                categoryName: "الأناشيد البيئية",
                lyrics: "نحمي بيئتنا بحب\nلا نرمي فيها التُّرب\nنزرع فيها الأشجار\nونحافظ على الأنهار"
            },
            {
                title: "يا زهرة الأرض",
                category: "environmental",
                categoryName: "الأناشيد البيئية",
                lyrics: "يا زهرة الأرض يا خضراء\nنحميك من كل الأعداء\nنزرع حبك في القلوب\nوننظف الدرب والدروب"
            },
            {
                title: "يداً بيد",
                category: "social",
                categoryName: "الأناشيد الاجتماعية",
                lyrics: "يداً بيد نبني الحياة\nبالحب نزرع المنى\nنتعاون دومًا يا إخوتي\nنحقق الخير والعطاء"
            },
            {
                title: "أنا وأنت",
                category: "social",
                categoryName: "الأناشيد الاجتماعية",
                lyrics: "أنا وأنت في صف واحد\nنحترم بعضنا ونساعد\nنرسم في القلب المحبة\nوننشر في الكون السعادة"
            },
            {
                title: "نلعب ونضحك",
                category: "entertainment",
                categoryName: "الأناشيد الترفيهية",
                lyrics: "نلعب ونضحك في الساحة\nنرسم فرحتنا بالراحة\nنهتف نغني نمرح دوم\nفي جو مليء بالنجوم"
            },
            {
                title: "أين أختبئ؟",
                category: "entertainment",
                categoryName: "الأناشيد الترفيهية",
                lyrics: "أين أختبئ يا أصدقائي؟\nخلف الباب أو في الزاوية؟\nهيا ابحثوا بسرعة\nفاللعبة صارت حماسية"
            },
            {
                title: "حروف الهجاء",
                category: "educational",
                categoryName: "الأناشيد التعليمية",
                lyrics: "أ ألف أسد يقفز\nب باء باب يُفتح\nت تاء تفاحة حمراء\nث ثاء ثعلب يمرح"
            },
            {
                title: "جدول الضرب",
                category: "educational",
                categoryName: "الأناشيد التعليمية",
                lyrics: "واحد في واحد واحد\nواحد في اثنين اثنين\nنحفظ نحفظ يا أصحاب\nحتى نصبح شطارًا"
            }
        ];
        localStorage.setItem('nasheeds', JSON.stringify(nasheeds));
    }

    // إضافة مستمعي الأحداث لأزرار الاستماع
    document.querySelectorAll('.nasheed-play').forEach(button => {
        button.addEventListener('click', function() {
            const nasheedTitle = this.getAttribute('data-nasheed');
            const nasheedCategory = this.getAttribute('data-category');
            
            showNasheedDetails(nasheedTitle, nasheedCategory);
        });
    });

    // وظيفة عرض تفاصيل الأنشودة
    function showNasheedDetails(title, category) {
        const nasheed = nasheeds.find(n => n.title === title && n.category === category);
        
        if (nasheed) {
            // تعبئة بيانات النافذة المنبثقة
            document.getElementById('nasheedTitle').textContent = nasheed.title;
            document.getElementById('modalNasheedTitle').textContent = nasheed.title;
            document.getElementById('modalNasheedCategory').textContent = nasheed.categoryName;
            // تعيين كلمات الأنشودة مع المحافظة على تنسيق الأسطر
            const lyricsElement = document.getElementById('nasheedLyrics');
            lyricsElement.textContent = nasheed.lyrics;
            
            // عرض النافذة المنبثقة
            const modal = new bootstrap.Modal(document.getElementById('nasheedModal'));
            modal.show();
        }
    }

    // وظيفة البحث
    document.getElementById('searchBtn').addEventListener('click', performSearch);
    document.getElementById('nasheedSearch').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    function performSearch() {
        const searchQuery = document.getElementById('nasheedSearch').value.trim().toLowerCase();
        
        if (searchQuery.length < 2) {
            alert('الرجاء إدخال كلمة بحث لا تقل عن حرفين');
            return;
        }
        
        // البحث في قاعدة البيانات
        const results = nasheeds.filter(nasheed => 
            nasheed.title.toLowerCase().includes(searchQuery) || 
            nasheed.lyrics.toLowerCase().includes(searchQuery)
        );
        
        displaySearchResults(results);
    }

    // عرض نتائج البحث
    function displaySearchResults(results) {
        const resultsContainer = document.getElementById('resultsContainer');
        resultsContainer.innerHTML = '';
        
        if (results.length === 0) {
            resultsContainer.innerHTML = '<div class="alert alert-info">لم يتم العثور على نتائج. حاول استخدام كلمات بحث أخرى.</div>';
        } else {
            const resultsList = document.createElement('div');
            resultsList.className = 'row';
            
            results.forEach(nasheed => {
                const nasheedCard = document.createElement('div');
                nasheedCard.className = 'col-md-6 col-lg-4 mb-3';
                nasheedCard.innerHTML = `
                    <div class="card nasheed-card">
                        <div class="card-body">
                            <h5 class="card-title">${nasheed.title}</h5>
                            <p class="badge bg-secondary mb-2">${nasheed.categoryName}</p>
                            <p class="card-text">${nasheed.lyrics.replace(/\n/g, '<br>')}</p>
                            <button class="btn btn-primary btn-sm search-play" data-category="${nasheed.category}" data-nasheed="${nasheed.title}">
                                <i class="fas fa-play me-1"></i> استماع
                            </button>
                        </div>
                    </div>
                `;
                resultsList.appendChild(nasheedCard);
            });
            
            resultsContainer.appendChild(resultsList);
            
            // إضافة مستمعي الأحداث لأزرار الاستماع في نتائج البحث
            document.querySelectorAll('.search-play').forEach(button => {
                button.addEventListener('click', function() {
                    const nasheedTitle = this.getAttribute('data-nasheed');
                    const nasheedCategory = this.getAttribute('data-category');
                    
                    showNasheedDetails(nasheedTitle, nasheedCategory);
                });
            });
        }
        
        // عرض قسم النتائج
        document.getElementById('searchResults').style.display = 'block';
        document.getElementById('searchResults').scrollIntoView({ behavior: 'smooth' });
    }

    // وظائف إضافية يمكن تفعيلها مستقبلاً

    // إضافة أنشودة جديدة (للمشرفين فقط)
    function addNewNasheed(nasheed) {
        nasheeds.push(nasheed);
        localStorage.setItem('nasheeds', JSON.stringify(nasheeds));
        
        // إعادة تحميل الصفحة لتحديث الأناشيد
        location.reload();
    }

    // حفظ الأناشيد المفضلة
    function toggleFavorite(nasheedTitle, category) {
        const favorites = JSON.parse(localStorage.getItem('favorite_nasheeds')) || [];
        const existingIndex = favorites.findIndex(f => f.title === nasheedTitle && f.category === category);
        
        if (existingIndex >= 0) {
            favorites.splice(existingIndex, 1);
            localStorage.setItem('favorite_nasheeds', JSON.stringify(favorites));
            return false; // تمت إزالة المفضلة
        } else {
            favorites.push({ title: nasheedTitle, category: category });
            localStorage.setItem('favorite_nasheeds', JSON.stringify(favorites));
            return true; // تمت الإضافة إلى المفضلة
        }
    }
});