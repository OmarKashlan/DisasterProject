let map; // تعريف متغير الخريطة
let marker; // تعريف متغير العلامة على الخريطة

function sendMessage(disaster) {
    // الحصول على مرجع لعنصر loading-overlay في الصفحة
    const loadingOverlay = document.getElementById('loading-overlay');
    // تعيين عرض العنصر إلى 'flex' لجعله مرئيًا
    loadingOverlay.style.display = 'flex';

    // التحقق مما إذا كان المتصفح يدعم خدمات الموقع الجغرافي
    if (navigator.geolocation) {
        // في حالة الدعم، احصل على الموقع الحالي للمستخدم
        navigator.geolocation.getCurrentPosition(
            function (position) {
                // استخراج خطوط الطول والعرض من البيانات الجغرافية
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                // مفتاح API المستخدم للحصول على معلومات العنوان من الإحداثيات الجغرافية
                const apiKey = '0c9aaad5b0e046e3821c7e133b56d1fc';
                // بناء عنوان URL للوصول إلى خدمة OpenCage Geocoding
                const apiUrl = `https://api.opencagedata.com/geocode/v1/json?key=${apiKey}&q=${latitude}+${longitude}&pretty=1`;

                // استدعاء خدمة الويب باستخدام API للحصول على بيانات العنوان
                fetch(apiUrl)
                    .then(response => response.json())
                    .then(data => {
                        // استخراج اسم الموقع من البيانات
                        const locationName = data.results[0].formatted;
                        // الحصول على مرجع لعنصر الصفحة الذي سيتم تحديثه بالموقع
                        const locationElement = document.getElementById('location');
                        // تحديث نص العنصر بالموقع المسترجع والاسم
                        locationElement.innerHTML = ` (${longitude}, ${latitude}) ${locationName} <strong>:الموقع</strong>`;

                        // تهيئة الخريطة إذا لم تكن قد تم تهيئتها بالفعل
                        if (!map) {
                            map = L.map('map').setView([latitude, longitude], 13);
                            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
                        }

                        // إضافة العلامة أو نقلها
                        if (!marker) {
                            marker = L.marker([latitude, longitude]).addTo(map);
                        } else {
                            marker.setLatLng([latitude, longitude]).update();
                        }

                        // إرسال رسالة البريد الإلكتروني باستخدام خدمة emailjs
                        emailjs.send('service_n2nq4h8', 'template_eoddjan', {
                            latitude: latitude,
                            longitude: longitude,
                            location: locationName,
                            disaster: disaster,
                            message: `ارجو المساعدة هناك- ${disaster}. الموقع: (${longitude}, ${latitude}) ${locationName}`
                        }, 'XFuNxrlqkoz_RkPTf')
                            .then(function (response) {
                                console.log('تم إرسال البريد الإلكتروني بنجاح:', response);
                            })
                            .catch(function (error) {
                                console.error('خطأ في إرسال البريد الإلكتروني:', error);
                            })
                            .finally(function () {
                                // إلغاء عرض شاشة التحميل بعد فترة زمنية وعرض إشعار للمستخدم
                                setTimeout(function () {
                                    loadingOverlay.style.display = 'none';
                                    const notificationElement = document.getElementById('notification');
                                    notificationElement.innerHTML = `تم إرسال الرسالة من أجل كارثة الـ${disaster}`;
                                    notificationElement.style.display = 'block';

                                    // إخفاء الإشعار بعد مدة زمنية
                                    setTimeout(function () {
                                        notificationElement.style.display = 'none';
                                    }, 3000);
                                }, 3000);
                            });
                    })
                    .catch(error => {
                        // التعامل مع الأخطاء في حالة حدوثها أثناء جلب بيانات الموقع
                        loadingOverlay.style.display = 'none';
                        console.error('خطأ في جلب بيانات الموقع:', error);
                    });
            },
            function (error) {
                // التعامل مع الأخطاء في حالة عدم القدرة على الوصول إلى الموقع الحالي
                loadingOverlay.style.display = 'none';
                console.error(`خطأ في الحصول على الموقع: ${error.message}`);
            }
        );
    } else {
        // التعامل مع حالة عدم دعم خدمات الموقع الجغرافي في المتصفح
        loadingOverlay.style.display = 'none';
        console.error("Geolocation is not supported by this browser.");
    }
}
